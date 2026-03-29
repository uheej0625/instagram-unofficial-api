"use strict";

const SessionState = require("./SessionState");
const RequestManager = require("./RequestManager");

/**
 * Main Instagram API Client.
 * Orchestrates the session state, network requests, and provides access to
 * all entity Repositories (like DM, Feed, Account).
 */
class IgApiClient {
  constructor() {
    /**
     * Contextual session variables like device properties, auth tokens, and cookies
     * @type {SessionState}
     */
    this.state = new SessionState();

    /**
     * HTTP Networking Manager configuring auto-headers, backoff, and signature injection
     * @type {RequestManager}
     */
    this.request = new RequestManager(this);

    const AccountRepository = require("../repositories/AccountRepository");
    const UserRepository = require("../repositories/UserRepository");
    const DirectRepository = require("../repositories/DirectRepository");
    const DirectThreadRepository = require("../repositories/DirectThreadRepository");
    const UploadRepository = require("../repositories/UploadRepository");
    const FeedRepository = require("../repositories/FeedRepository");
    const FriendshipRepository = require("../repositories/FriendshipRepository");
    const MediaRepository = require("../repositories/MediaRepository");
    const HashtagRepository = require("../repositories/HashtagRepository");
    const LocationRepository = require("../repositories/LocationRepository");
    const StoryRepository = require("../repositories/StoryRepository");
    const HighlightsRepository = require("../repositories/HighlightsRepository");
    const LiveRepository = require("../repositories/LiveRepository");
    const SearchRepository = require("../repositories/SearchRepository");

    this.account = new AccountRepository(this);
    this.user = new UserRepository(this);
    this.direct = new DirectRepository(this);
    this.directThread = new DirectThreadRepository(this);
    this.upload = new UploadRepository(this);
    this.feed = new FeedRepository(this);
    this.friendship = new FriendshipRepository(this);
    this.media = new MediaRepository(this);
    this.hashtag = new HashtagRepository(this);
    this.location = new LocationRepository(this);
    this.story = new StoryRepository(this);
    this.highlights = new HighlightsRepository(this);
    this.live = new LiveRepository(this);
    this.search = new SearchRepository(this);
  }

  /**
   * Destroys open connections, clearing event listeners or timeout loops.
   */
  destroy() {
    // Implement cleanup logic here
  }
}

module.exports = IgApiClient;
