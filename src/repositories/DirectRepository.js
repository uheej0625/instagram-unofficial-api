"use strict";

const fs = require("fs");
const Repository = require("./Repository");

class DirectRepository extends Repository {
  /**
   * Send a text message to a user username
   * @param {{ to: string, message: string }} options
   */
  async send(options) {
    const { to, message } = options;
    if (!to || !message)
      throw new Error("Recipient (to) and message are required");

    const user = await this.client.user.infoByUsername(to);
    const thread = await this.client.directThread.getByParticipants([user.pk]);
    return this.client.directThread.broadcast({
      threadIds: [thread.thread_id],
      item: "text",
      form: { text: message },
    });
  }

  /**
   * Send an image to a user username
   * @param {{ to: string, imagePath: string }} options
   */
  async sendImage(options) {
    const { to, imagePath } = options;
    if (!to || !imagePath)
      throw new Error("Recipient (to) and imagePath are required");

    const imageBuffer = fs.readFileSync(imagePath);
    const uploadResult = await this.client.upload.photo({
      file: imageBuffer,
      uploadId: Date.now().toString(),
    });
    const user = await this.client.user.infoByUsername(to);
    const thread = await this.client.directThread.getByParticipants([user.pk]);
    return this.client.directThread.broadcast({
      threadIds: [thread.thread_id],
      item: "configure_photo",
      form: {
        upload_id: uploadResult.upload_id,
        allow_full_aspect_ratio: true,
      },
    });
  }

  /**
   * Send a video to a user username
   * @param {{ to: string, videoPath: string }} options
   */
  async sendVideo(options) {
    const { to, videoPath } = options;
    if (!to || !videoPath)
      throw new Error("Recipient (to) and videoPath are required");

    const videoBuffer = fs.readFileSync(videoPath);
    const uploadResult = await this.client.upload.video({
      video: videoBuffer,
      uploadId: Date.now().toString(),
    });
    const user = await this.client.user.infoByUsername(to);
    const thread = await this.client.directThread.getByParticipants([user.pk]);
    return this.client.directThread.broadcast({
      threadIds: [thread.thread_id],
      item: "configure_video",
      form: { upload_id: uploadResult.upload_id, video_result: "deprecated" },
    });
  }

  /**
   * Get inbox threads with optional pagination cursor
   * @param {string} [cursor=null]
   */
  async getInbox(cursor = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/direct_v2/inbox/",
      params: {
        visual_message_return_type: "unseen",
        cursor: cursor || undefined,
        thread_message_limit: 10,
        persistentBadging: true,
        limit: 20,
      },
    });
    return response.data;
  }

  /**
   * Create a group thread
   * @param {string[]} recipientUsers Array of user Pks
   * @param {string} threadTitle
   */
  async createGroupThread(recipientUsers, threadTitle) {
    if (!Array.isArray(recipientUsers) || !threadTitle)
      throw new Error("recipientUsers must be array and threadTitle required");

    const response = await this.client.request.send({
      method: "POST",
      url: "/api/v1/direct_v2/create_group_thread/",
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        _uid: this.client.state.userId,
        recipient_users: JSON.stringify(recipientUsers),
        thread_title: threadTitle,
      },
    });
    return response.data;
  }

  /**
   * Get ranked recipients (suggested users to send DMs)
   * @param {string} [mode='raven']
   * @param {string} [query='']
   */
  async rankedRecipients(mode = "raven", query = "") {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/direct_v2/ranked_recipients/",
      params: { mode, query, show_threads: true },
    });
    return response.data;
  }

  /**
   * Get online presence
   */
  async getPresence() {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/direct_v2/get_presence/",
    });
    return response.data;
  }
}

module.exports = DirectRepository;
