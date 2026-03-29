# Instagram Private API Client

Node.js 환경에서 작동하는 순수 JavaScript 기반의 인스타그램 Private API 클라이언트입니다.
인스타그램 공식 안드로이드 앱의 통신 규격을 모델링하여 제작되었으며, 빠른 속도의 REST API 및 MQTToT(Realtime) 프로토콜을 완벽하게 지원합니다.

> ⚠️ **면책 조항 (Disclaimer):**
> 본 라이브러리는 교육 및 연구 목적으로만 제공됩니다. 인스타그램의 비공개 API를 무단으로 사용하는 것은 커뮤니티 정책 위반 소지가 있으며, 계정 정지(블럭) 또는 삭제의 원인이 될 수 있습니다. 상용 서비스 적용 등으로 인하여 발생하는 모든 책임은 사용자 본인에게 있습니다.

---

## ✨ 주요 기능 및 특징

1. **강력한 Request Manager (자동 헤더 및 쿠키 관리)**
   - Axios 기반 글로벌 인터셉터가 인스타그램의 쿠키(Session, CSRF)를 자동으로 파싱 및 관리합니다.
   - 인스타그램 전용 서명(`.signPayload`) 및 폼 URL 인코딩을 내부 동작으로 처리하여 복잡한 패킷을 쉽게 전송할 수 있습니다.
2. **MQTToT & Iris/Skywalker 완벽 대응 (실시간 메시지 송수신)**
   - 인스타그램 본 서버(Edge MQTT Broker)와 직접 Thrift 프로토콜로 통신합니다.
   - 다이렉트 메시지(DM) 발송, 읽음 처리, 타이핑 상태 표시 등 모든 알림을 이벤트 에미터(EventEmitter) 형식으로 실시간 지원합니다.
3. **Repository 패턴 적용 (쉬운 기능 접근)**
   - `Account`, `User`, `Direct`, `Feed`, `Media` 등 직관적인 모듈 형태로 분리되어 사용이 간편합니다.

---

## 📦 설치 및 시작하기

### 실행 환경

- **Node.js**: v18.0.0 이상 권장

의존성 패키지 설치:

```bash
npm install
```

### 💡 기초 예제 (로그인 및 피드 조회)

```javascript
const { IgApiClient } = require("./src/index");

async function loginAndGetFeed() {
  const ig = new IgApiClient();

  // 1. 인스타그램 로그인 (자동으로 쿠키 및 디바이스 환경 구성)
  await ig.account.login("YOUR_USERNAME", "YOUR_PASSWORD");
  console.log(`✅ 로그인 성공! 내 유저 ID: ${ig.state.userId}`);

  // 2. 내 타임라인 피드 가져오기
  const timeline = await ig.feed.getUserFeed(ig.state.userId);
  console.log(`✅ 피드 개수:`, timeline);
}

loginAndGetFeed();
```

---

## ⚡ 실시간 DM 통신 (MQTToT Realtime)

`RealtimeClient`를 사용하면 인스타그램 안드로이드 앱에서 경험하는 것과 동일한 실시간 푸시 메시지를 수신하고 다룰 수 있습니다.

```javascript
const { IgApiClient, RealtimeClient } = require("./src/index");

async function listenToDirectMessages() {
  const ig = new IgApiClient();
  await ig.account.login("YOUR_USERNAME", "YOUR_PASSWORD");

  const realtime = new RealtimeClient(ig);

  // 연결 성공 이벤트 수신
  realtime.on("connected", () => {
    console.log("✅ Realtime MQTT Server Connected!");
  });

  // 실시간 Direct Message 수신 (Iris 패킷)
  realtime.on("iris_message", (msg) => {
    console.log("✉️ 새로운 DM 도착:", JSON.stringify(msg, null, 2));
  });

  // 서버와 연결 실행
  await realtime.connect();

  // 특정 유저에게 DM 자동 발송 예제
  await ig.directThread.broadcast({
    userIds: ["TARGET_USER_ID"],
    item: "text",
    form: { text: "실시간 API 테스트 메시지입니다!" },
  });
}

listenToDirectMessages();
```

---

## 🧩 지원되는 주요 기능 (Repositories)

클라이언트가 생성되면 아래의 프로퍼티에 접근하여 필요한 기능들을 바로 호출할 수 있습니다.

- `ig.account`: 로그인, 로그아웃, 현재 내 유저 정보 반환
- `ig.user`: 타겟 유저 검색, 팔로잉 및 팔로워 목록 조회
- `ig.direct`, `ig.directThread`: DM 인박스 확인, 그룹핑, 메세지 전송, 메세지 수신 및 읽음(Seen) 처리
- `ig.feed`: 타임라인 피드, 특정 유저 피드, 태그된 피드, 위치 기반 피드 탐색
- `ig.media`: 미디어(사진/영상) 좋아요 누르기, 댓글 쓰기 및 지우기, 정보 조회
- `ig.story`, `ig.highlights`: 스토리 트레이 읽기, 하이라이트 확인
- `ig.search`: 통합 검색, 유저 검색, 특정 해시태그 기반 검색
- `ig.live`: 라이브 방송 생성, 시작 및 종료 관리

---

## 📝 자주 묻는 질문 (문제 해결)

**Q. 자꾸 에러코드 400 Bad Request 혹은 403 Forbidden 응답이 옵니다.**

> A. 인스타그램은 비정상적 접근(대량 요청, 알 수 없는 프록시 IP)을 감지하면 즉시 차단합니다. 계정 제한을 겪게 될 경우 인스타그램 앱에 직접 들어가 본인인증(체크포인트)을 진행해 주세요.

**Q. DM 발송 시 응답으로 `Sorry, this content isn't available right now` 문구가 나옵니다.**

> A. 짧은 시간 내에 DM을 많이 발송했기 때문에 스팸으로 간주되어 일시적 제한(Shadow Ban)을 받은 상태입니다. 짧게는 몇 분에서 길게는 며칠 뒤에 자동으로 풀립니다.

## License

의존하고 있는 패키지는 각기 명시된 라이선스를 따르며, 본 코드는 MIT License 기반으로 제공됩니다.

---

This project was inspired by <https://github.com/icelts/nodejs-insta-private-api>
