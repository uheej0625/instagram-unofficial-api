"use strict";

const Chance = require("chance");
const Repository = require("./Repository");

class DirectThreadRepository extends Repository {
  /**
   * Send a text message to a group thread
   * @param {Object} options - { threadId, message }
   */
  async sendToGroup(options) {
    const { threadId, message } = options;
    if (!threadId || !message)
      throw new Error("threadId and message are required");

    return this.broadcast({
      threadIds: [threadId],
      item: "text",
      form: { text: message },
    });
  }

  /**
   * Fetch a specific thread by its ID
   * @param {string} threadId
   */
  async getThread(threadId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/direct_v2/threads/${threadId}/`,
    });
    return response.data;
  }

  /**
   * Fetch threads by participants
   * @param {Array} recipientUsers
   */
  async getByParticipants(recipientUsers) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/direct_v2/threads/get_by_participants/",
      params: { recipient_users: JSON.stringify(recipientUsers) },
    });
    return response.data;
  }

  /**
   * Broadcast a message to multiple threads or users
   */
  async broadcast(options) {
    const mutationToken = new Chance().guid();
    const recipients = options.threadIds || options.userIds;
    const recipientsType = options.threadIds ? "thread_ids" : "recipient_users";

    let recipientsIds = Array.isArray(recipients) ? recipients : [recipients];
    if (recipientsType === "recipient_users") {
      // Instagram expects double array for recipient users: [["12345"]]
      recipientsIds = [recipientsIds.map(String)];
    }

    const form = {
      action: "send_item",
      [recipientsType]: JSON.stringify(recipientsIds),
      client_context: mutationToken,
      _csrftoken: this.client.state.csrfToken,
      device_id: this.client.state.device.deviceId,
      mutation_token: mutationToken,
      _uuid: this.client.state.device.uuid,
      ...options.form,
    };

    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/broadcast/${options.item}/`,
      method: "POST",
      form: form,
      signed: options.signed || false,
      params: options.qs,
    });
    return response.data;
  }

  /**
   * Mark a specific item in a thread as seen
   */
  async markItemSeen(threadId, threadItemId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/items/${threadItemId}/seen/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        use_unified_inbox: true,
        action: "mark_seen",
        thread_id: threadId,
        item_id: threadItemId,
      },
    });
    return response.data;
  }

  /**
   * Delete an item from a thread
   */
  async deleteItem(threadId, itemId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/items/${itemId}/delete/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Approve a pending thread
   */
  async approve(threadId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/approve/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Decline a pending thread
   */
  async decline(threadId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/decline/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Mute a thread
   */
  async mute(threadId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/mute/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Unmute a thread
   */
  async unmute(threadId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/unmute/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Add users to a thread
   */
  async addUser(threadId, userIds) {
    if (!Array.isArray(userIds)) throw new Error("userIds must be an array");

    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/add_user/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        user_ids: JSON.stringify(userIds),
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Leave a thread
   */
  async leave(threadId) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/leave/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  /**
   * Update thread title
   */
  async updateTitle(threadId, title) {
    const response = await this.client.request.send({
      url: `/api/v1/direct_v2/threads/${threadId}/update_title/`,
      method: "POST",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        title,
      },
    });
    return response.data;
  }
}

module.exports = DirectThreadRepository;
