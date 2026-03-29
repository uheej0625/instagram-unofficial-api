"use strict";

const IgApiClient = require("../src/core/IgApiClient");
const RealtimeClient = require("../src/realtime/RealtimeClient");

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

async function testDM() {
  console.log("--- 🚀 Starting DM Test ---");
  if (!username || !password) {
    console.error("❌ Please provide $env:IG_USERNAME and $env:IG_PASSWORD");
    process.exit(1);
  }

  const ig = new IgApiClient();

  try {
    console.log(`\n[1] Logging in as ${username}...`);
    await ig.account.login(username, password);
    const myUserId = ig.state.userId;
    console.log(`✅ Login successful! User ID: ${myUserId}`);

    console.log(
      "\n[2] Testing Realtime MQTT Connection based on new architecture...",
    );
    const realtime = new RealtimeClient(ig);

    realtime.on("connected", () => {
      console.log("✅ Realtime Connected! Waiting a bit before sending DM...");
    });

    // Let's capture the Iris messages for DM
    realtime.on("iris_message", (msg) => {
      console.log("✉️ [IRIS MESSAGE RECEIVED]");
      console.log(JSON.stringify(msg, null, 2));
    });

    realtime.on("raw_message", (msg) => {
      console.log(
        `📥 MQTT Packet from ${msg.topic} length: ${msg.payload.length}`,
      );
    });

    await realtime.connect();

    // 3초 대기 후 자기 자신에게 DM 발송
    setTimeout(async () => {
      console.log(`\n[3] 나 자신(${myUserId})에게 DM 발송 시도 중...`);
      try {
        const messageText = `자동화 테스트 메세지입니다. 시간: ${new Date().toISOString()}`;
        const response = await ig.directThread.broadcast({
          userIds: [myUserId],
          item: "text",
          form: { text: messageText },
        });

        if (response.status === "ok") {
          console.log(
            `✅ DM 발송 성공! Thread ID: ${response.payload?.thread_id || "알 수 없음"}`,
          );
        } else {
          console.log("⚠️ DM 발송 응답 상태가 ok가 아닙니다:", response);
        }
      } catch (err) {
        console.error("❌ DM 발송 중 에러 발생:", err.message);
        console.error(err.response?.data);
      }
    }, 3000);

    // 메시지 돌려받을 때까지(수신) 10초 대기
    setTimeout(() => {
      console.log("\n--- 🛑 Disconnecting & Finishing Test ---");
      realtime.disconnect();
      process.exit(0);
    }, 10000);
  } catch (err) {
    console.error("\n❌ E2E Test Failed:");
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
}

testDM();
