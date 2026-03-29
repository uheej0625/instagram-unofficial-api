"use strict";

const { CookieJar } = require("tough-cookie");
const Chance = require("chance");

/**
 * @typedef {Object} DeviceProfile
 * @property {string} deviceString (e.g. "26/8.0.0; 480dpi; 1080x1920; samsung; SM-G930F...")
 * @property {string} deviceId (e.g. "android-1234567890abcdef")
 * @property {string} uuid
 * @property {string} phoneId
 * @property {string} adid
 */

/**
 * Manages the current session's cookies, device identity, and authentication tokens.
 * A Clean-Room implementation focusing on explicit state boundaries.
 */
class SessionState {
  constructor() {
    /** @type {CookieJar} */
    this.cookieJar = new CookieJar();

    /** @type {DeviceProfile} */
    this.device = this.generateDevice("default-seed");

    /** @type {string|null} */
    this.authorizationToken = null;

    /** @type {string|null} */
    this.userId = null;

    /** @type {string} */
    this.language = "en_US";
  }

  /**
   * Extracts a specific cookie value from the JAR for the given host
   * @param {string} key Cookie name
   * @param {string} url Host URL (e.g., 'https://i.instagram.com')
   * @returns {string|null}
   */
  getCookieValue(key, url = "https://i.instagram.com") {
    try {
      const cookies = this.cookieJar.getCookiesSync(url);
      const found = cookies.find((c) => c.key === key);
      return found ? found.value : null;
    } catch {
      return null;
    }
  }

  /**
   * @returns {string|null}
   */
  get csrfToken() {
    return (
      this.getCookieValue("csrftoken") ||
      this.getCookieValue("csrftoken", "https://www.instagram.com")
    );
  }

  /**
   * Generates a consistent or randomized Android device profile
   * @param {string} seed
   * @returns {DeviceProfile}
   */
  generateDevice(seed) {
    const chance = new Chance(seed);
    return {
      deviceString:
        "26/8.0.0; 480dpi; 1080x1920; samsung; SM-G930F; herolte; samsungexynos8890",
      deviceId: `android-${chance.string({ pool: "abcdef0123456789", length: 16 })}`,
      uuid: chance.guid(),
      phoneId: chance.guid(),
      adid: chance.guid(),
    };
  }

  /**
   * Serializes the session state to a JSON-safe object for persistence.
   * @returns {Promise<Object>}
   */
  async toJSON() {
    const util = require("util");
    const serializeJar = util.promisify(
      this.cookieJar.serialize.bind(this.cookieJar),
    );

    const serializedCookies = await serializeJar();

    return {
      device: this.device,
      authorizationToken: this.authorizationToken,
      userId: this.userId,
      language: this.language,
      cookies: serializedCookies,
    };
  }

  /**
   * Hydrates the session state from a persisted JSON object.
   * @param {Object} data
   */
  async fromJSON(data) {
    if (!data) return;

    if (data.device) this.device = data.device;
    if (data.authorizationToken)
      this.authorizationToken = data.authorizationToken;
    if (data.userId) this.userId = data.userId;
    if (data.language) this.language = data.language;

    if (data.cookies) {
      const util = require("util");
      const deserializeJar = util.promisify(CookieJar.deserialize);
      this.cookieJar = await deserializeJar(data.cookies);
    }
  }
}

module.exports = SessionState;
