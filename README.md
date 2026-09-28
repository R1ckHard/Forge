# Forge

Приватный training companion: регистрация → план тренировок с
lock/unlock на сервере → экран сессии с workout → чат с coach через свой API →
mock-paywall (premium на 1 час + ещё 3 урока).

**Стек:** React Native (Expo) · Express.js + TypeScript · **in-memory store**  
(данные живут в процессе API и сбрасываются при его рестарте — для демо этого достаточно).

---

## Как запустить

Нужны: Node.js 20+, npm. Docker / Mongo **не нужны**.

### Быстрый старт

```bash
# 1) зависимости
cd apps/api && npm install
cd ../mobile && npm install

# 2) env для API (если ещё нет .env)
cd ../api
cp .env.example .env
# в .env обязательно должен быть JWT_SECRET

# 3) API (терминал 1)
npm run dev
# → http://127.0.0.1:4040  ·  GET /health

# 4) Mobile (терминал 2)
cd ../mobile
npm start
# нажми i (iOS Simulator) или отсканируй QR в Expo Go
```

Или из корня:

```bash
npm run api      # Express на :4040
npm run mobile   # Expo
```

### Устройство (не симулятор)

Укажи IP Mac в сети:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:4040 npm start
```

### Проверка

1. Открой приложение → Register  
2. Plan: сессия 1 open, 2–3 locked  
3. Complete → unlock следующей  
4. Coach: сообщения; после 3 — paywall  
5. Subscribe (demo) → premium 1 час + сессии 4–6  

API health: [http://127.0.0.1:4040/health](http://127.0.0.1:4040/health)  
Debug dump (local): [http://127.0.0.1:4040/debug/db](http://127.0.0.1:4040/debug/db)

---

## Loom

_[Добавь ссылку на Loom после записи]_

`https://www.loom.com/share/YOUR_VIDEO_ID`

---

## Scope

| В scope | Вне scope |
|---------|-----------|
| Email/password, JWT, SecureStore | Cognito / Apple / Google |
| Plan unlock **только на сервере** | App Store / Play / IAP |
| Coach fake API + mock paywall 1h | Реальный OpenAI |
| In-memory persistence (demo) | Docker / MongoDB |
| Smithy, лого, session workouts | Marketing landing |
