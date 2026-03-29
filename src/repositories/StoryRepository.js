"use strict";

const Repository = require("./Repository");

class StoryRepository extends Repository {
  /**
   * @param {Object} options
   */
  async react(options) {
    // ... need to read dist to see exact params ...
  }

  async getFeed() {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/reels_tray/`,
    });
    return response.data;
  }

  /**
   * @param {string} userId
   */
  async getUser(userId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/user/${userId}/story/`,
    });
    return response.data;
  }

  /**
   * @param {Object} options
   */
  async upload(options) {
    // Legacy code uses big upload service. We might just proxy to it later.
  }

  /**
   * @param {Object} options
   */
  async uploadVideo(options) {
    // legacy
  }

  /**
   * @param {Array<Object>|Object} input
   * @param {string} [sourceId]
   */
  async seen(input, sourceId = null) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v2/media/seen/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        reels: JSON.stringify(Array.isArray(input) ? input : [input]),
        live_vods: JSON.stringify([]),
      },
    });
    return response.data;
  }

  /**
   * @param {string} userId
   */
  async getHighlights(userId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/users/${userId}/info/`,
    });
    // Highlight logic in older repo might differ
    return response.data;
  }

  /**
   * @param {string} highlightId
   */
  async getHighlight(highlightId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/reels_media/`,
      params: {
        user_ids: highlightId,
      },
    });
    return response.data;
  }

  /**
   * @param {string} storyId
   */
  async viewers(storyId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/media/${storyId}/list_reel_media_viewer/`,
    });
    return response.data;
  }
}

module.exports = StoryRepository;
