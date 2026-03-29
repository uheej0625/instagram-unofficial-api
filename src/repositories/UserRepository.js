"use strict";

const Repository = require("./Repository");

/**
 * Manages User-related features (info, search, follow, etc.)
 */
class UserRepository extends Repository {
  /**
   * @param {string} username
   * @returns {Promise<any>}
   */
  async infoByUsername(username) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/users/${username}/usernameinfo/`,
    });
    return response.data.user;
  }

  /**
   * @param {string} userId
   * @returns {Promise<any>}
   */
  async info(userId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/users/${userId}/info/`,
    });
    return response.data.user;
  }

  /**
   * @param {string} query
   * @returns {Promise<any[]>}
   */
  async search(query) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/users/search/",
      params: {
        q: query,
        count: 50,
      },
    });
    return response.data.users;
  }

  /**
   * @param {string|number} userId
   */
  async follow(userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/friendships/create/${userId}/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        user_id: userId,
      },
    });
    return response.data;
  }

  /**
   * @param {string|number} userId
   */
  async unfollow(userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/friendships/destroy/${userId}/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        user_id: userId,
      },
    });
    return response.data;
  }

  /**
   * @param {string|number} userId
   * @param {string} [maxId]
   */
  async getFollowers(userId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/friendships/${userId}/followers/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * @param {string|number} userId
   * @param {string} [maxId]
   */
  async getFollowing(userId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/friendships/${userId}/following/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }
}

module.exports = UserRepository;
