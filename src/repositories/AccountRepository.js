'use strict';

const Constants = require('../constants/instagram-constants');

/**
 * Manages Account authentication (login, logout, current_user)
 */
class AccountRepository {
    /**
     * @param {import('../core/IgApiClient')} client
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Web-based login flow (More reliable against device bans)
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<any>} User Object
     */
    async login(username, password) {
        // Step 1: Pre-fetch CSRF Token
        await this.client.request.send({
            method: 'GET',
            url: Constants.IG_WEB_URL + '/accounts/login/',
        });

        // Step 2: Perform Web Login Request
        const time = Math.floor(Date.now() / 1000);
        const encodedPassword = `#PWD_INSTAGRAM_BROWSER:0:${time}:${password}`;
        
        try {
            const loginRes = await this.client.request.send({
                method: 'POST',
                url: Constants.IG_WEB_URL + '/api/v1/web/accounts/login/ajax/',
                headers: {
                    'X-Instagram-AJAX': '1',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': Constants.IG_WEB_URL + '/accounts/login/',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: `username=${encodeURIComponent(username)}&enc_password=${encodeURIComponent(encodedPassword)}&queryParams=%7B%7D&optIntoOneTap=false`
            });

            const body = loginRes.data;

            if (body.status === 'fail') {
                const igErrorMessage = body.message || 'Instagram forcefully rejected the login (e.g., Checkpoint required or IP Ban)';
                const err = new Error(`Login failed (${loginRes.status}): ${igErrorMessage}`);
                err.response = loginRes;
                throw err;
            }

            if (body.two_factor_required) {
                throw new Error('Two factor authentication required. Please login via browser first.');
            }
            if (!body.authenticated) {
                throw new Error(body.message || 'Login failed - invalid credentials');
            }

            // Sync auth state
            this.client.state.userId = body.userId;
            
            // Transfer Web cookies to Mobile API domain so current_user works
            const webCookies = this.client.state.cookieJar.getCookiesSync(Constants.IG_WEB_URL);
            for (const cookie of webCookies) {
                try {
                    this.client.state.cookieJar.setCookieSync(cookie.cookieString(), Constants.IG_BASE_URL);
                } catch (e) {}
            }

            // Sync experiments (required to establish proper mobile session)
            try {
                const signedSync = this.client.request.signPayload({
                    _csrftoken: this.client.state.csrfToken,
                    id: this.client.state.device.uuid,
                    server_config_retrieval: '1',
                    experiments: Constants.LOGIN_EXPERIMENTS
                });
                const syncData = Object.keys(signedSync).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(signedSync[k])}`).join('&');

                await this.client.request.send({
                    method: 'POST',
                    url: '/api/v1/qe/sync/',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: syncData
                });
            } catch (e) {}
            
            // Try fetch additional user data via Mobile API. 
            // Instagram frequently returns 403 here because it hasn't fully synced the web session.
            // We must swallow this (as the legacy code did) so the session can be saved and MQTT can connect.
            try {
                return await this.currentUser();
            } catch (error) {
                return { pk: body.userId, username };
            }

        } catch (error) {
            const err = /** @type {any} */ (error);
            if (err.response && err.response.status === 403) {
                throw new Error(`Instagram returned 403 Forbidden. Your account might be flagged, required a checkpoint challenge, or you're logging in from a new IP: ${err.message}`);
            }
            throw error;
        }
    }

    /**
     * Get the logged-in user profile
     */
    async currentUser() {
        const res = await this.client.request.send({
            method: 'GET',
            url: '/api/v1/accounts/current_user/',
            params: { edit: true }
        });
        return res.data;
    }
}

module.exports = AccountRepository;
