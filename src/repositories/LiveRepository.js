"use strict";

const Repository = require("../repositories/Repository");

class LiveRepository extends Repository {
  async create(options = {}) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/create/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        ...options,
      },
    });
    return response.data;
  }

  async start(broadcastId, shouldSendNotifications = false) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/start/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        should_send_notifications: shouldSendNotifications,
      },
    });
    return response.data;
  }

  async end(broadcastId, endAfterCopyrightWarning = false) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/end_broadcast/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        end_after_copyright_warning: endAfterCopyrightWarning,
      },
    });
    return response.data;
  }

  async info(broadcastId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/live/${broadcastId}/info/`,
    });
    return response.data;
  }

  async getViewerList(broadcastId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/live/${broadcastId}/get_viewer_list/`,
    });
    return response.data;
  }

  async comment(broadcastId, message) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/comment/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        comment_text: message,
        live_or_vod: 1,
        offset_to_video_start: 0,
      },
    });
    return response.data;
  }

  async like(broadcastId, likeCount = 1) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/like/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        user_like_count: likeCount,
      },
    });
    return response.data;
  }

  async getHeartbeatAndViewerCount(broadcastId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/heartbeat_and_get_viewer_count/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  async muteComment(broadcastId, userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/mute/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        commenter_id: userId,
      },
    });
    return response.data;
  }

  async unmuteComment(broadcastId, userId) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/live/${broadcastId}/unmute/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
        commenter_id: userId,
      },
    });
    return response.data;
  }
}

module.exports = LiveRepository;
