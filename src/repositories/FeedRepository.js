"use strict";

const fs = require("fs");
const Repository = require("./Repository");

class FeedRepository extends Repository {
  /**
   * Upload an image to feed
   * @param {{ imagePath: string, caption?: string }} options
   */
  async upload(options) {
    const { imagePath, caption } = options;
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadResult = await this.client.upload.photo({
      file: imageBuffer,
      uploadId: Date.now().toString(),
    });

    const configureResult = await this.client.upload.configurePhoto({
      uploadId: uploadResult.upload_id,
      caption: caption || "",
      source_type: "4",
    });

    return configureResult;
  }

  /**
   * Upload a video to feed
   * @param {{ videoPath: string, imagePath: string, caption?: string }} options
   */
  async uploadVideo(options) {
    const { videoPath, imagePath, caption } = options;
    const videoBuffer = fs.readFileSync(videoPath);
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadId = Date.now().toString();

    await this.client.upload.photo({
      file: imageBuffer,
      uploadId: uploadId,
    });

    const uploadResult = await this.client.upload.video({
      video: videoBuffer,
      uploadId: uploadId,
    });

    const configureResult = await this.client.upload.configureVideo({
      uploadId: uploadResult.upload_id || uploadId,
      caption: caption || "",
      length: 0,
      clips: [
        {
          length: 0,
          source_type: "3",
          camera_position: "back",
        },
      ],
    });

    return configureResult;
  }

  /**
   * Get home timeline feed
   * @param {string} [maxId]
   */
  async getFeed(maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/feed/timeline/",
      params: maxId ? { max_id: maxId } : {},
      headers: {
        "X-IG-Capabilities": "3brTvw==",
      },
    });
    return response.data;
  }

  /**
   * Get user feed
   * @param {string|number} userId
   * @param {string} [maxId]
   */
  async getUserFeed(userId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/user/${userId}/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * Get tag feed
   * @param {string} tag
   * @param {string} [maxId]
   */
  async getTag(tag, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/tags/${encodeURIComponent(tag)}/sections/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        tab: "recent",
        max_id: maxId || "",
      },
    });
    return response.data;
  }

  /**
   * Get liked medias
   * @param {string} [maxId]
   */
  async getLiked(maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/feed/liked/",
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * Get saved medias
   * @param {string} [maxId]
   */
  async getSaved(maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/feed/saved/",
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * Get location feed
   * @param {string|number} locationId
   * @param {string} [maxId]
   */
  async getLocation(locationId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/locations/${locationId}/sections/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uuid: this.client.state.device.uuid,
        tab: "recent",
        max_id: maxId || "",
      },
    });
    return response.data;
  }

  /**
   * Get explore feed
   * @param {string} [maxId]
   */
  async getExploreFeed(maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/discover/explore/",
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * Get reels (video) feed
   * @param {string} [maxId]
   */
  async getReelsFeed(maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: "/api/v1/clips/home/",
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * Upload an album/carousel
   */
  async uploadCarousel(options) {
    // Implementation might be complex so stubbing it if we're lacking the exact legacy signature,
    // to avoid code bloat unless strictly required. Let's provide basic implementation stub.
    throw new Error("uploadCarousel not yet ported to the new architecture");
  }
}

module.exports = FeedRepository;
