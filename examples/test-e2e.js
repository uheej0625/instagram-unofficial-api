"use strict";

const IgApiClient = require("../src/core/IgApiClient");
const RealtimeClient = require("../src/realtime/RealtimeClient");

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

async function runFullTest() {
  console.log("--- 🚀 Starting Full Instagram API E2E Test ---");
  if (!username || !password) {
    console.error("❌ Please provide $env:IG_USERNAME and $env:IG_PASSWORD");
    process.exit(1);
  }

  const ig = new IgApiClient();

  try {
    console.log(`\n[1] Logging in as ${username}...`);
    const loginResponse = await ig.account.login(username, password);
    console.log(`✅ Login successful! User ID: ${ig.state.userId}`);

    console.log("\n[2] Fetching Current User Info...");
    const currentUser = await ig.account.currentUser();
    console.log(
      `✅ User Profile fetched: ${currentUser.user.username} (PK: ${currentUser.user.pk})`,
    );

    console.log("\n[3] Testing Feed Repository (Timeline)...");
    const timeline = await ig.feed.getUserFeed(ig.state.userId);
    console.log(`✅ Feed fetched successfully. Status: ${timeline.status}`);

    console.log("\n[4] Testing Search Repository...");
    const searchResult = await ig.search.searchUsers("instagram", 1);
    console.log(
      `✅ Search result fetched. Users returned: ${searchResult.users ? searchResult.users.length : 0}`,
    );

    console.log("\n[5] Testing Realtime MQTT Connection...");
    const realtime = new RealtimeClient(ig);

    realtime.on("connected", () => {
      console.log("✅ Realtime Connected!");
    });

    realtime.on("raw_message", (msg) => {
      console.log(
        `📥 MQTT Packet from ${msg.topic} length: ${msg.payload.length}`,
      );
    });

    await realtime.connect();

    // Let it chill for 5 seconds to catch connect packets and then disconnect
    setTimeout(() => {
      console.log("\n--- 🛑 Disconnecting & Finishing Test ---");
      realtime.disconnect();
      process.exit(0);
    }, 5000);
  } catch (err) {
    console.error("\n❌ E2E Test Failed:");
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
}

runFullTest();
