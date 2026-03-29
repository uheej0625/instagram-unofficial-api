"use strict";

const fs = require("fs");
const path = require("path");
const IgApiClient = require("../src/core/IgApiClient");
const RealtimeClient = require("../src/realtime/RealtimeClient");

// Replace with dummy or real credentials for testing
const username = process.env.IG_USERNAME || "YOUR_USERNAME";
const password = process.env.IG_PASSWORD || "YOUR_PASSWORD";

async function testRealtime() {
  console.log("--- 1. Initializing API ---");
  const ig = new IgApiClient();
  const sessionFile = path.join(__dirname, "../.clean-session.json");

  try {
    if (fs.existsSync(sessionFile)) {
      console.log("Loading existing session...");
      const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
      await ig.state.fromJSON(session);
    } else if (username === "YOUR_USERNAME") {
      console.log("Using dummy auth session for MQTT connection tests...");
      ig.state.userId = "1234567890";
      ig.state.cookieJar.setCookieSync(
        "sessionid=fake_session_123",
        "https://i.instagram.com",
      );
    } else {
      console.log(`Logging in as ${username}...`);
      await ig.account.login(username, password);

      console.log("Login successful! Saving session...");
      const sessionData = await ig.state.toJSON();
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    }

    console.log(
      `\n--- 2. Connecting to MQTT (User ID: ${ig.state.userId}) ---`,
    );
    const realtime = new RealtimeClient(ig);

    realtime.on("connected", () => {
      console.log("✅ Successfully Connected to Instagram MQTT Server!");
      console.log("Waiting for live packets...\n");
    });

    realtime.on("disconnected", () => {
      console.log("⚠️ Disconnected from MQTT Server.");
    });

    realtime.on("error", (err) => {
      console.error("❌ MQTT Error:", err.message);
    });

    realtime.on("app_packet", (packet) => {
      console.log(
        `[PACKET ${packet.topic.id}] Received data on ${packet.topic.path}`,
      );
    });

    realtime.on("raw_message", (msg) => {
      console.log("📥 Raw MQTT Packet:", {
        topic: msg.topic,
        payloadLength: msg.payload.length,
      });
    });

    realtime.on("iris_message", (data) => {
      console.log(
        "💬 Iris Packet Decoded:",
        JSON.stringify(data).substring(0, 50) + "...",
      );
    });

    // Actually the underlying class might emit 'connect'
    realtime.on("connect", () => {
      console.log("✅ Base Client Connected!");
    });

    await realtime.connect();

    // Keep process alive for 10 seconds to listen to initial pings
    setTimeout(() => {
      console.log("\n--- 3. Disconnecting smoothly ---");
      realtime.disconnect();
      process.exit(0);
    }, 10000);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testRealtime();
