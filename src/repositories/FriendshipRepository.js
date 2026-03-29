"use strict";

const Repository = require("./Repository");

class FriendshipRepository extends Repository {
  /**
   * @param {string|number} userId
   */
  async create(userId) {
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
  async destroy(userId) {
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
   */
  async show(userId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/friendships/show/${userId}/`,
    });
    return response.data;
  }

  /**
   * @param {string|number[]} userIds
   */
  async showMany(userIds) {
    const response = await this.client.request.send({
      method: "POST",
      url: "/api/v1/friendships/show_many/",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        user_ids: userIds.join(","),
      },
    });
    return response.data;
  }

  /**
   * @param {string|number} userId
   */
  async block(userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/friendships/block/${userId}/`,
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
  async unblock(userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/friendships/unblock/${userId}/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        user_id: userId,
      },
    });
    return response.data;
  }
}

module.exports = FriendshipRepository;
