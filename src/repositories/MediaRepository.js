"use strict";

const Repository = require("./Repository");

class MediaRepository extends Repository {
  /**
   * @param {string} mediaId
   */
  async info(mediaId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/media/${mediaId}/info/`,
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {Object} moduleInfo
   */
  async like(mediaId, moduleInfo = { module_name: "feed_timeline" }) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/like/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        media_id: mediaId,
        ...moduleInfo,
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {Object} moduleInfo
   */
  async unlike(mediaId, moduleInfo = { module_name: "feed_timeline" }) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/unlike/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        media_id: mediaId,
        ...moduleInfo,
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {string} commentText
   */
  async comment(mediaId, commentText) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/comment/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        comment_text: commentText,
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {string} commentId
   */
  async deleteComment(mediaId, commentId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/comment/${commentId}/delete/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {string} mediaType
   */
  async delete(mediaId, mediaType = "PHOTO") {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/delete/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        media_id: mediaId,
        media_type: mediaType,
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {string} captionText
   */
  async edit(mediaId, captionText) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/media/${mediaId}/edit_media/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        caption_text: captionText,
      },
    });
    return response.data;
  }

  /**
   * @param {Array<Object>} reels
   */
  async seen(reels) {
    const response = await this.client.request.send({
      method: "POST",
      url: "/api/v2/media/seen/",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        reels: JSON.stringify(reels),
      },
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   */
  async likers(mediaId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/media/${mediaId}/likers/`,
    });
    return response.data;
  }

  /**
   * @param {string} mediaId
   * @param {string} [maxId]
   */
  async comments(mediaId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/media/${mediaId}/comments/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }
}

module.exports = MediaRepository;
