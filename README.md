# Real-Time Collaborative Code Editor — Build Guide

Backend-first build order: **FastAPI core → Docker execution → Node sync server → Frontend.**
This README covers everything through Phase 3 (the hard, resume-defining parts).
Frontend (Phase 4) comes after this skeleton is proven to work.

## 0. Prerequisites

Install on your machine before starting:
- Python 3.11+
- Node.js 20+
- Docker Desktop (must be running — the API uses it to spin up sandboxes)
- PostgreSQL (or just use the Dockerized one below — recommended)

## 1. Folder structure (already created for you)

```
collab-editor/
├── api/                      ← FastAPI backend
│   ├── app/
│   │   ├── core/              (config, db session, security/JWT, docker executor)
│   │   ├── models/             (SQLAlchemy models: User, Room)
│   │   ├── routers/            (auth, rooms, execute)
│   │   ├── schemas/            (Pydantic request/response models)
│   │   └── main.py             (FastAPI app entrypoint)
│   ├── docker_images/          (minimal per-language sandbox images)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── sync-server/               ← Node.js Yjs WebSocket relay
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/                  ← (empty — Phase 4, build after backend works)
└── docker-compose.yml
```

## 2. Set up environment variables

```bash
cd api
cp .env.example .env
# open .env and replace JWT_SECRET_KEY with a real random string, e.g.:
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## 3. Build the code-execution sandbox images

These are the isolated containers your `/execute` endpoint will spin up per run.
Build them once, up front:

```bash
cd api/docker_images
chmod +x build.sh
./build.sh
```

Confirm they exist:
```bash
docker images | grep collab-exec
```

## 4. Start everything with docker-compose

From the project root:

```bash
docker compose up --build
```

This starts three services:
- `postgres` on `localhost:5432`
- `api` (FastAPI) on `localhost:8000`
- `sync-server` (Node/Yjs) on `localhost:1234`

The API container is given access to your host's Docker socket
(`/var/run/docker.sock`) so it can launch sandbox containers — this is
what makes "Docker-in-Docker" execution work without nesting Docker itself.

## 5. Verify the backend is alive

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

Open the interactive API docs FastAPI generates for free:
```
http://localhost:8000/docs
```

## 6. Test the full flow with curl (or Postman — matches your existing workflow)

**Register:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Login (grab the access_token from the response):**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Create a room (replace TOKEN):**
```bash
curl -X POST http://localhost:8000/rooms/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Room","language":"python"}'
```

**Run code in the sandbox (replace TOKEN) — this is your centerpiece feature:**
```bash
curl -X POST http://localhost:8000/execute/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"print(2 + 2)","language":"python"}'
```

**Prove the sandbox limits actually work — send an infinite loop:**
```bash
curl -X POST http://localhost:8000/execute/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"while True: pass","language":"python"}'
```
This should return after ~5 seconds with `"timed_out": true` — screenshot
this for your portfolio/interview talking points, it's your strongest proof point.

## 7. Test the sync server standalone (Phase 3, before touching frontend)

The sync server is already running via docker-compose on port 1234.
Verify it's up:
```bash
curl http://localhost:1234
# "Yjs sync server is running"
```

To actually test CRDT sync before building your own frontend, use Yjs's
official demo client (quill/codemirror demos on github.com/yjs/yjs-demos)
pointed at `ws://localhost:1234/<any-room-name>` — open it in two browser
tabs and confirm edits sync between them live.

## 8. Commit checkpoints (do this as you go — it's evidence for interviews)

```bash
git init
git add .
git commit -m "Phase 1: FastAPI auth + rooms working"
# ...after sandbox execution is tested...
git commit -m "Phase 2: Docker sandboxed execution with memory/time limits verified"
# ...after sync server tested with Yjs demo client...
git commit -m "Phase 3: Yjs sync server verified with multi-tab live sync"
```

## Phase 4 — Frontend (React + Monaco + y-monaco)

The frontend is now scaffolded in `/frontend`. It covers:
- `/login`, `/register` — JWT auth against FastAPI
- `/rooms` — create/list rooms
- `/rooms/:roomId` — the actual editor: live collaborative Monaco editor
  (synced via the Node/Yjs server) + a "Run" button that calls FastAPI's
  `/execute/` endpoint and shows sandboxed output on the right

### Run it

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Make sure the backend (`docker compose up`,
from Phase 1–3) is already running, since the frontend talks to:
- `http://localhost:8000` (FastAPI — auth, rooms, execute)
- `ws://localhost:1234` (Node sync server — live editing)

### Proving the "real-time collaborative" claim

1. Register/log in, create a room
2. Open the **same room URL in two separate browser tabs** (or two browsers)
3. Type in one tab — it should appear live in the other, with each tab's
   cursor visible to the other (via Yjs awareness + y-monaco)
4. Click **Run** in either tab — code executes in an isolated Docker
   container server-side and the output appears in the right-hand panel

Screen-record steps 2–4 together — that's your single strongest portfolio
artifact: it proves live sync *and* sandboxed execution in one clip.

### Known simplification (be upfront about this in interviews)

The "Run" button currently reads whichever tab clicked it, sends that
tab's code to `/execute/`, and shows the result only in that tab. A fuller
version would also sync run results across tabs via the Yjs awareness
channel (same pattern used for cursors) — call this out as a stated
next step if asked, rather than pretending every tab shows the result.

## What's next (stretch goals, optional)

- Persist execution history per room (new DB table)
- Support more languages (add a Dockerfile + image per language)
- Broadcast run output to all tabs in a room, not just the one that ran it
- Rate-limit `/execute/` per user to prevent sandbox abuse
