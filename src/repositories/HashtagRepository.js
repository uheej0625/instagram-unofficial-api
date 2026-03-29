"use strict";

const Repository = require("./Repository");

class HashtagRepository extends Repository {
  /**
   * @param {string} hashtag
   */
  async info(hashtag) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/tags/${encodeURIComponent(hashtag)}/info/`,
    });
    return response.data;
  }

  /**
   * @param {string} query
   */
  async search(query) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/tags/search/`,
      params: {
        q: query,
        timezone_offset: this.client.state.timezoneOffset,
        count: 30,
      },
    });
    return response.data;
  }

  /**
   * @param {string} hashtag
   * @param {string} [maxId]
   */
  async getFeed(hashtag, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/tag/${encodeURIComponent(hashtag)}/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * @param {string} hashtag
   */
  async getStories(hashtag) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/tag/${encodeURIComponent(hashtag)}/story/`,
    });
    return response.data;
  }

  /**
   * @param {string} hashtag
   */
  async follow(hashtag) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/web/tags/${encodeURIComponent(hashtag)}/follow/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
      },
    });
    return response.data;
  }

  /**
   * @param {string} hashtag
   */
  async unfollow(hashtag) {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/web/tags/${encodeURIComponent(hashtag)}/unfollow/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
      },
    });
    return response.data;
  }

  /**
   * @param {string} hashtag
   */
  async getRelated(hashtag) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/tags/suggested/${encodeURIComponent(hashtag)}/`,
    });
    return response.data;
  }

  /**
   */
  async getFollowing() {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/users/${this.client.state.userId}/following_tags_info/`,
    });
    return response.data;
  }
}

module.exports = HashtagRepository;
