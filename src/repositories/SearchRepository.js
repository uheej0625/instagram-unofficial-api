"use strict";

const Repository = require("../repositories/Repository");

class SearchRepository extends Repository {
  async search(query, options = {}) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/fbsearch/topsearch/`,
      params: {
        query: query,
        context: "blended",
        timezone_offset: this.client.state.timezoneOffset,
        count: 30,
        ...options,
      },
    });
    return response.data;
  }

  async searchUsers(query, count = 30) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/users/search/`,
      params: {
        q: query,
        timezone_offset: this.client.state.timezoneOffset,
        count: count,
      },
    });
    return response.data;
  }

  async searchHashtags(query, count = 30) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/tags/search/`,
      params: {
        q: query,
        timezone_offset: this.client.state.timezoneOffset,
        count: count,
      },
    });
    return response.data;
  }

  async searchLocations(query, lat = null, lng = null, count = 30) {
    const params = {
      search_query: query,
      count: count,
    };
    if (lat && lng) {
      params.latitude = lat;
      params.longitude = lng;
    }
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/location_search/`,
      params: params,
    });
    return response.data;
  }

  async getRecentSearches() {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/fbsearch/recent_searches/`,
    });
    return response.data;
  }

  async clearRecentSearches() {
    const response = await this.client.request.send({
      method: "POST",
      url: `/api/v1/fbsearch/clear_recent_searches/`,
      form: {
        _csrftoken: this.client.state.csrfToken,
        _uid: this.client.state.userId,
        _uuid: this.client.state.device.uuid,
      },
    });
    return response.data;
  }

  async getSuggestedUsers() {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/fbsearch/suggested_searches/`,
      params: {
        type: "users",
      },
    });
    return response.data;
  }

  async getSuggestedHashtags() {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/fbsearch/suggested_searches/`,
      params: {
        type: "hashtags",
      },
    });
    return response.data;
  }
}

module.exports = SearchRepository;
