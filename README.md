# Instagram Private API Client

A pure JavaScript (ES6+) Instagram Private API client for Node.js, fully compatible with the official Android app's protocol. Supports fast REST API and MQTToT (Realtime) protocol for direct messaging and more.

> ⚠️ **Disclaimer:**
> This library is for educational and research purposes only. Using Instagram's private API without permission may violate their terms of service and can result in account bans or deletion. All responsibility for usage lies with the user.

---

## ✨ Features

1. **Powerful Request Manager (Automatic Headers & Cookies)**
   - Axios-based global interceptor automatically manages Instagram cookies (Session, CSRF).
   - Handles Instagram signature (`.signPayload`) and form URL encoding internally for easy packet transmission.
2. **Full MQTToT & Iris/Skywalker Support (Realtime Messaging)**
   - Communicates directly with Instagram's Edge MQTT Broker using Thrift protocol.
   - Supports direct message (DM) sending, read receipts, typing status, and all events via EventEmitter in real time.
3. **Repository Pattern (Easy API Access)**
   - Modular structure: `Account`, `User`, `Direct`, `Feed`, `Media`, etc. for intuitive usage.

---

## 📦 Installation & Getting Started

### Requirements

- **Node.js**: v18.0.0 or higher recommended

Install dependencies:

```bash
npm install
```

### 💡 Basic Example (Login & Fetch Feed)

```javascript
const { IgApiClient } = require("./src/index");

async function loginAndGetFeed() {
  const ig = new IgApiClient();
  await ig.account.login("YOUR_USERNAME", "YOUR_PASSWORD");
  console.log(`✅ Login successful! User ID: ${ig.state.userId}`);
  const timeline = await ig.feed.getUserFeed(ig.state.userId);
  console.log(`✅ Feed:`, timeline);
}

loginAndGetFeed();
```

---

## ⚡ Realtime DM (MQTToT)

Use `RealtimeClient` to receive and handle push messages just like the official Instagram Android app.

```javascript
const { IgApiClient, RealtimeClient } = require("./src/index");

async function listenToDirectMessages() {
  const ig = new IgApiClient();
  await ig.account.login("YOUR_USERNAME", "YOUR_PASSWORD");

  const realtime = new RealtimeClient(ig);

  realtime.on("connected", () => {
    console.log("✅ Realtime MQTT Server Connected!");
  });

  realtime.on("iris_message", (msg) => {
    console.log("✉️ New DM:", JSON.stringify(msg, null, 2));
  });

  await realtime.connect();

  // Example: Send a DM to a user
  await ig.directThread.broadcast({
    userIds: ["TARGET_USER_ID"],
    item: "text",
    form: { text: "Test message from API!" },
  });
}

listenToDirectMessages();
```

---

## 🧩 Main Features (Repositories)

After creating a client, you can access the following properties for all features:

- `ig.account`: Login, logout, get current user info
- `ig.user`: Search users, get following/followers
- `ig.direct`, `ig.directThread`: DM inbox, group, send/receive/read messages
- `ig.feed`: Timeline, user feed, tag feed, location feed
- `ig.media`: Like, comment, delete, get media info
- `ig.story`, `ig.highlights`: Read stories, highlights
- `ig.search`: Search, user search, hashtag search
- `ig.live`: Create/start/end live broadcasts

---

## 📝 FAQ / Troubleshooting

**Q. I keep getting 400 Bad Request or 403 Forbidden errors.**

> A. Instagram aggressively blocks abnormal access (mass requests, unknown proxy IPs). If your account is restricted, log in via the official app and complete any verification (checkpoint).

**Q. I get `Sorry, this content isn't available right now` when sending DMs.**

> A. This usually means your account is temporarily shadow-banned for sending too many DMs in a short time. Wait a few minutes to a few days for the restriction to lift.

## License

All dependencies follow their respective licenses. This code is provided under the MIT License.
