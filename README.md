# 7Sync

A real-time watch party app — watch videos together in perfect sync with your friends. No login required. Just create a room, share the link, and enjoy.

---

## Credits

This project is a fork of **[WatchParty](https://github.com/howardchung/watchparty)** by [Howard Chung](https://github.com/howardchung), licensed under the MIT License.

The original project is a feature-rich, open-source watch party platform that supports YouTube, screen sharing, file uploads, virtual browsers, and more. All core architecture, socket sync engine, and video player logic are built on top of his work.

---

## Features

- Watch YouTube videos, direct URLs, HLS/DASH streams together in sync
- Screen sharing and file upload streaming
- Real-time chat
- Playback rate sync across all viewers
- Playlist queue
- Host/Viewer permission system (new)
- Create Room / Join Room from the home page (new)

---

## How It Works

1. Click **Create Room** — you become the Host
2. Share the room link with friends — they join as Viewers
3. The Host controls playback (play, pause, seek, speed, video URL)
4. Viewers watch in perfect sync but cannot control playback

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Mantine UI
- **Backend:** Node.js, Express 5, Socket.IO 4
- **Optional:** PostgreSQL (persistent rooms), Redis (metrics), Firebase (auth)
- **Process manager:** PM2

---

## Running Locally

```bash
# Install dependencies
npm install

# Start backend (port 8080)
npm run start

# Start frontend dev server (separate terminal)
npm run ui
```

Open `http://localhost:5173` in your browser.

---

## Deploying

Build the React frontend first, then start the server (it serves the built files):

```bash
npm run build   # builds React into /build
npm run start   # starts Express server on PORT (default 8080)
```

Set environment variable `NODE_ENV=production`.

### Recommended: Railway

1. Push repo to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Add env var: `NODE_ENV=production`

---

## What We Changed from the Original

### Added
- **Host/Viewer permission system** — the first person to connect to a room (the creator) becomes the Host. Only the Host can play, pause, seek, change speed, set the video URL, or manage the playlist. Viewers can only watch.
- **HOST / VIEWER badge** in the video controls bar so every user knows their role at a glance.
- **Join Room UI** on the home page — paste a room link or room code directly from the landing page without needing to know the URL format.
- **`.gitignore` protection** for SSL certificate files (`cert.pem`, `key.pem`) and `.env`.

### Removed / Replaced
- Removed Firebase authentication dependency from the frontend (the original used Firebase login to gate certain features; 7Sync works without login).
- Removed the subscriber/monetization UI (subscribe modal, Stripe integration surface) from the frontend — the backend config still supports it if needed.
- Removed the original room lock system as the primary permission gate for playback — replaced by the simpler host-based model.

---

## License

MIT — same as the original [WatchParty](https://github.com/howardchung/watchparty) project.
# 7Sync
