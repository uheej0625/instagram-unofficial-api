"use strict";

const axios = require("axios");
const crypto = require("crypto");
const Constants = require("../constants/instagram-constants");

/**
 * Handles all HTTP communication with Instagram's Private API.
 * Injects required headers, manages cookies, and signs payloads.
 */
class RequestManager {
  /**
   * @param {import('./IgApiClient')} client Reference to the main API client
   */
  constructor(client) {
    this.client = client;

    this.httpRequest = axios.create({
      baseURL: Constants.IG_BASE_URL,
      timeout: 20000,
      validateStatus: () => true, // We want to handle HTTP status manually
    });

    this._setupInterceptors();
  }

  _setupInterceptors() {
    this.httpRequest.interceptors.request.use(async (config) => {
      // Determine absolute URL for cookie jar
      const fullUrl =
        config.baseURL && !config.url.startsWith("http")
          ? config.baseURL + config.url.replace(/^\/+/, "")
          : config.url || Constants.IG_BASE_URL;

      // Apply Cookies manually
      const cookieString =
        this.client.state.cookieJar.getCookieStringSync(fullUrl);
      if (cookieString) {
        config.headers["Cookie"] = cookieString;
      }

      // Apply standard Instagram headers
      config.headers["User-Agent"] = this._getUserAgent();
      config.headers["X-IG-App-ID"] =
        Constants.FACEBOOK_ANALYTICS_APPLICATION_ID;
      config.headers["X-IG-Capabilities"] = Constants.DEFAULT_CAPABILITIES;
      config.headers["Accept-Language"] = this.client.state.language.replace(
        "_",
        "-",
      );

      const csrf = this.client.state.csrfToken;
      if (csrf) config.headers["X-CSRFToken"] = csrf;

      if (this.client.state.authorizationToken) {
        config.headers["Authorization"] = this.client.state.authorizationToken;
      }

      return config;
    });

    this.httpRequest.interceptors.response.use(async (response) => {
      // Store cookies manually returned from server
      const fullUrl =
        response.config.baseURL && !response.config.url.startsWith("http")
          ? response.config.baseURL + response.config.url.replace(/^\/+/, "")
          : response.config.url || Constants.IG_BASE_URL;

      const setCookieHeaders = response.headers["set-cookie"];
      if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
        for (const cookieStr of setCookieHeaders) {
          try {
            this.client.state.cookieJar.setCookieSync(cookieStr, fullUrl);
          } catch (e) {
            // Silently ignore invalid cookies
          }
        }
      }

      // Capture authorization header and extract sessionid if provided via header instead of cookie
      if (response.headers["ig-set-authorization"]) {
        const authStr = response.headers["ig-set-authorization"];
        this.client.state.authorizationToken = authStr;
        try {
          const tokenPartsStr = authStr.split(":");
          if (tokenPartsStr.length >= 3) {
            const tokenPayloadStr = tokenPartsStr[2];
            const tokenPayloadStrFromB64 = Buffer.from(
              tokenPayloadStr,
              "base64",
            ).toString("utf8");
            const tokenData = JSON.parse(tokenPayloadStrFromB64);
            if (tokenData.sessionid) {
              this.client.state.cookieJar.setCookieSync(
                `sessionid=${tokenData.sessionid}; Path=/; Domain=i.instagram.com; Secure; HttpOnly`,
                Constants.IG_BASE_URL,
              );
            }
            if (tokenData.ds_user_id && !this.client.state.userId) {
              this.client.state.userId = tokenData.ds_user_id.toString();
            }
          }
        } catch (e) {}
      }

      if (response.status >= 400) {
        const error = new Error(
          `Request to ${response.config.url} failed with status ${response.status}`,
        );
        error.response = response;
        throw error;
      }

      return response;
    });
  }

  /**
   * Generates Instagram's standard User-Agent string
   * @returns {string}
   */
  _getUserAgent() {
    return `Instagram ${Constants.APP_VERSION} Android (${this.client.state.device.deviceString}; ${this.client.state.language}; ${Constants.APP_VERSION_CODE})`;
  }

  /**
   * Helper to cryptographically sign request payloads (specifically forms)
   * using Instagram's Signature Key.
   * @param {Object} payload
   * @returns {Object} Signed body object containing ig_sig_key_version and signed_body
   */
  signPayload(payload) {
    const jsonPayload = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", Constants.SIGNATURE_KEY)
      .update(jsonPayload)
      .digest("hex");

    return {
      ig_sig_key_version: Constants.SIGNATURE_VERSION,
      signed_body: `${signature}.${jsonPayload}`,
    };
  }

  /**
   * Simple utility to generate Jazoest (Instagram specific tracking field)
   * @param {string} input
   * @returns {string}
   */
  generateJazoest(input) {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input.charCodeAt(i);
    }
    return `2${sum}`;
  }

  /**
   * Send an HTTP Request with automated exponential backoff
   * @param {import('axios').AxiosRequestConfig & { form?: object }} config
   * @param {number} [retries=3]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  async send(config, retries = 3) {
    if (config.form) {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";

      const signed = this.signPayload(config.form);
      const formBody = new URLSearchParams();
      for (const key in signed) {
        formBody.append(key, signed[key]);
      }
      config.data = formBody.toString();
      delete config.form;
    }

    try {
      const response = await this.httpRequest.request(config);
      return response;
    } catch (error) {
      // Retry if it's a server error or rate limiting and we have retries left
      const status = error.response ? error.response.status : 0;
      const isRetryable =
        status >= 500 || status === 429 || error.code === "ECONNABORTED";

      if (isRetryable && retries > 0) {
        const delayMs = (4 - retries) * 1000; // 1s, 2s, 3s
        await new Promise((res) => setTimeout(res, delayMs));
        return this.send(config, retries - 1);
      }

      throw error;
    }
  }
}

module.exports = RequestManager;
