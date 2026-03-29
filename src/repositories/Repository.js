"use strict";

/**
 * Base Repository class to be inherited by specific API services
 */
class Repository {
  /**
   * @param {import('../core/IgApiClient')} client API Client instance
   */
  constructor(client) {
    this.client = client;
  }
}

module.exports = Repository;
