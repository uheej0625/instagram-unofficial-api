"use strict";

const EventEmitter = require("events");
const { MQTToTClient } = require("./mqttot/mqttot.client");
const { MQTToTConnection } = require("./mqttot/mqttot.connection");
const Constants = require("../constants/instagram-constants");

/**
 * @typedef {Object} RealtimeOptions
 * @property {string[]} [graphQlSubs] GraphQL Topic strings to subscribe to
 * @property {string[]} [skywalkerSubs] Skywalker (typing/presence) strings to subscribe to
 * @property {any} [irisData] Internal Iris push setup payload from inbox
 */

/**
 * Clean Realtime Client managing the lifecycle of the MQTT connection
 * and delegating incoming Direct Messages to strong events.
 */
class RealtimeClient extends EventEmitter {
  /**
   * @param {import('../core/IgApiClient')} client API Client instance
   */
  constructor(client) {
    super();
    this.client = client;

    /** @type {MQTToTClient|null} */
    this.mqtt = null;

    // Track running status
    this.isConnected = false;
  }

  /**
   * Start the MQTT connection and attach main data listeners.
   * @param {RealtimeOptions} options
   */
  async connect(options = {}) {
    const connectionData = this._buildConnectionData();

    this.mqtt = new MQTToTClient({
      url: Constants.MQTT_HOST,
      autoReconnect: true,
      requirePayload: false,
      payloadProvider: async () => {
        const { compressDeflate } = require("../utils/shared");
        return await compressDeflate(connectionData.toThrift());
      },
    });

    // Forward connection events
    this.mqtt.on("connect", () => {
      this.isConnected = true;
      this.emit("connected");
    });

    this.mqtt.on("error", (err) => this.emit("error", err));
    this.mqtt.on("disconnect", () => {
      this.isConnected = false;
      this.emit("disconnected");
    });

    // Basic message forwarding (to be strongly parsed later)
    this.mqtt.on("message", (msg) => this.emit("raw_message", msg));
    // @ts-ignore - 'receive' is emitted by the custom client but not in base types
    this.mqtt.on(
      "receive",
      (/** @type {any} */ topic, /** @type {any} */ data) =>
        this._routeParsedPacket(topic, data),
    );

    try {
      await this.mqtt.connect();
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Stop the MQTT listener immediately.
   */
  disconnect() {
    if (this.mqtt) {
      this.mqtt.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Constructs the MQTToTConnection metadata
   * @returns {any}
   */
  _buildConnectionData() {
    const state = this.client.state;
    const deviceId =
      state.device.phoneId || "00000000-0000-0000-0000-000000000000";

    // Ensure userId is a BigInt format if available, otherwise fake it or throw
    let userId = 0n;
    if (state.userId) {
      userId = BigInt(state.userId);
    } else {
      console.warn(
        "[RealtimeClient] Warning: Client state has no userId for MQTT Payload. Attempting unauth connect.",
      );
    }

    const appSpecificInfo = {
      app_version: Constants.APP_VERSION,
      "X-IG-Capabilities": Constants.DEFAULT_CAPABILITIES,
      everclear_subscriptions: JSON.stringify({
        inapp_notification_subscribe_comment: "17899377895239777",
        inapp_notification_subscribe_comment_mention_and_reply:
          "17899377895239777",
        video_call_participant_state_delivery: "17977239895057311",
        presence_subscribe: "17846944882223835",
      }),
      "User-Agent": this.client.request._getUserAgent(),
      "Accept-Language": state.language.replace("_", "-"),
    };

    const connection = new MQTToTConnection({
      clientIdentifier: deviceId.substring(0, 20),
      clientInfo: {
        userId,
        userAgent: appSpecificInfo["User-Agent"],
        clientCapabilities: 183n,
        endpointCapabilities: 0n,
        publishFormat: 1,
        noAutomaticForeground: false,
        makeUserAvailableInForeground: true,
        deviceId: deviceId,
        isInitiallyForeground: true,
        networkType: 1,
        networkSubtype: 0,
        clientMqttSessionId: BigInt(Date.now()) & 0xffffffffn,
        subscribeTopics: [88, 135, 149, 150, 133, 146], // Sub arrays for GraphQL
        clientType: "cookie_auth",
        appId: BigInt(567067343352427n),
        deviceSecret: "",
        clientStack: 3,
      },
      password:
        "sessionid=" +
        decodeURIComponent(state.getCookieValue("sessionid") || ""),
      appSpecificInfo,
    });

    return connection;
  }

  /**
   * Internal Router for incoming MQTT protocols
   */
  _routeParsedPacket(topic, data) {
    // Here we parse iris/graphql/skywalker depending on topic ID
    // and emit polished events.

    if (topic.id === "134" || topic.id === "135" || topic.id === "146") {
      this.emit("iris_message", data);
    } else if (topic.id === "88") {
      this.emit("presence", data);
    } else {
      this.emit("app_packet", { topic, data });
    }
  }
}

module.exports = RealtimeClient;
