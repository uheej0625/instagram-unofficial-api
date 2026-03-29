"use strict";

const Repository = require("./Repository");

class LocationRepository extends Repository {
  /**
   * @param {string} locationId
   */
  async info(locationId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/locations/${locationId}/info/`,
    });
    return response.data;
  }

  /**
   * @param {string} query
   * @param {string|number} lat
   * @param {string|number} lng
   */
  async search(query, lat, lng) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/location_search/`,
      params: {
        search_query: query,
        latitude: lat,
        longitude: lng,
      },
    });
    return response.data;
  }

  /**
   * @param {string|number} lat
   * @param {string|number} lng
   */
  async searchByCoordinates(lat, lng) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/location_search/`,
      params: {
        latitude: lat,
        longitude: lng,
      },
    });
    return response.data;
  }

  /**
   * @param {string} locationId
   * @param {string} [maxId]
   */
  async getFeed(locationId, maxId = null) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/locations/${locationId}/`,
      params: maxId ? { max_id: maxId } : {},
    });
    return response.data;
  }

  /**
   * @param {string} locationId
   */
  async getStories(locationId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/feed/locations/${locationId}/story/`,
    });
    return response.data;
  }

  /**
   * @param {string} locationId
   */
  async getRelated(locationId) {
    const response = await this.client.request.send({
      method: "GET",
      url: `/api/v1/locations/${locationId}/related/`,
    });
    return response.data;
  }
}

module.exports = LocationRepository;
