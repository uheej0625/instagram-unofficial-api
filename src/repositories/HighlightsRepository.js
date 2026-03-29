"use strict";

const Repository = require("./Repository");

class HighlightsRepository extends Repository {
  /**
   * @param {string} userId
   */
  async getHighlightsTray(userId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/highlights/${userId}/highlights_tray/`,
    });
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

  // Creating highlights etc require form POST
  async create(title, storyIds, coverMediaId = null) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/highlights/create_reel/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        title: title,
        media_ids: JSON.stringify(storyIds),
        cover_media_id: coverMediaId,
      },
    });
    return response.data;
  }

  async edit(highlightId, title, storyIds, coverMediaId = null) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/highlights/${highlightId}/edit_reel/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        title: title,
        media_ids: JSON.stringify(storyIds),
        cover_media_id: coverMediaId,
      },
    });
    return response.data;
  }

  async delete(highlightId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/highlights/${highlightId}/delete_reel/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  async addStories(highlightId, storyIds) {
    // ...
  }

  async removeStories(highlightId, storyIds) {
    // ...
  }

  async updateCover(highlightId, coverMediaId) {
    // ...
  }
}

module.exports = HighlightsRepository;
