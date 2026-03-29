"use strict";

const IgApiClient = require("../src/core/IgApiClient");

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

async function testDMV2() {
  const ig = new IgApiClient();
  await ig.account.login(username, password);

  console.log("Sending message to", ig.state.userId);

  const client_context = String(Math.floor(Date.now() / 1000) * 1000); // Sometimes it needs this format

  // Testing multiple recipient string formats
  const formatsToTest = [
    JSON.stringify([[ig.state.userId]]),
    JSON.stringify([[Number(ig.state.userId)]]),
    JSON.stringify([ig.state.userId]),
  ];

  for (let format of formatsToTest) {
    try {
      const res = await ig.request.send({
        url: "/api/v1/direct_v2/threads/broadcast/text/",
        method: "POST",
        form: {
          action: "send_item",
          recipient_users: format,
          client_context: client_context,
          _csrftoken: ig.state.csrfToken,
          device_id: ig.state.device.deviceId,
          _uuid: ig.state.device.uuid,
          text: "hello from format: " + format,
        },
      });
      console.log(`Format: ${format} => SUCCESS`, res.data.status);
      return;
    } catch (e) {
      console.log(
        `Format: ${format} => FAILED:`,
        typeof e.response?.data === "string"
          ? e.response.data.substring(0, 100)
          : e.response?.data || e.message,
      );
    }
  }
}
testDMV2();
