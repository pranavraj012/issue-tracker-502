# Issue Tracker API

Roll Number: 23071A0502
Name: Pranav Raj

# Week 1 — Simple Backend with CRUD APIs (Express)

**Syllabus experiment 1:** *Write code for a simple backend project. It should have basic CRUD operations and APIs (GET, POST, DELETE, PATCH/UPDATE).*

We build an **Issue Tracking API** with Express and keep using it for the rest of the course.

## Concepts

- **REST API** — resources (here: `issues`) addressed by URLs, manipulated with HTTP verbs.
- **CRUD ↔ HTTP verbs**
  - **Create** → `POST /api/issues` → returns `201 Created`
  - **Read** → `GET /api/issues` (list) and `GET /api/issues/:id` (one) → `200 OK`
  - **Update** → `PATCH /api/issues/:id` (partial update) → `200 OK`
  - **Delete** → `DELETE /api/issues/:id` → `204 No Content`
- **Status codes you must know:** `200` OK, `201` Created, `204` No Content, `400` Bad Request (invalid input), `404` Not Found, `500` Internal Server Error.
- **PUT vs PATCH:** PUT replaces the whole resource; PATCH changes only the fields sent. We use PATCH (the syllabus asks for PATCH/UPDATE).
- **Idempotency:** GET, PUT, DELETE are idempotent (repeating them has the same effect); POST is not.
- **In-memory store** — a `Map` inside the process. Data resets on restart (fine for labs; a real app would use PostgreSQL/MongoDB).

## Project structure

```
week-01-backend/
├── package.json      # project metadata + scripts + dependencies
├── server.js         # Express app entry point (exports `app` for tests, starts server when run)
├── store.js          # in-memory data store (create/read/update/delete issues)
├── routes/
│   └── issues.js     # the CRUD routes (GET/POST/PATCH/DELETE)
└── README.md
```

## Run it

```bash
cd week-01-backend
npm install        # installs express from package.json
npm start          # node server.js  → listens on :3000
npm run dev        # node --watch server.js  (auto-restarts on edits)
```

## API reference

| Method | Endpoint | Body | Success | Purpose |
|--------|----------|------|---------|---------|
| GET | `/healthz` | — | `200` | health check (used by Docker/K8s probes later) |
| GET | `/api/issues` | — | `200` | list all issues (filters: `?status=open&priority=high`) |
| GET | `/api/issues/:id` | — | `200` / `404` | get one issue |
| POST | `/api/issues` | `{title, description?, status?, priority?}` | `201` / `400` | create issue |
| PATCH | `/api/issues/:id` | any of `{title, description, status, priority}` | `200` / `400` / `404` | partial update |
| DELETE | `/api/issues/:id` | — | `204` / `404` | delete issue |

`status` ∈ `open | in-progress | closed`, `priority` ∈ `low | medium | high`.

## Try it (curl)

```bash
# health check
curl http://localhost:3000/healthz

# list (comes pre-seeded with 3 sample issues)
curl http://localhost:3000/api/issues

# create
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Broken deploy pipeline","description":"CI fails at the test step","priority":"high"}'

# update (partial)
curl -X PATCH http://localhost:3000/api/issues/4 \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'

# delete
curl -X DELETE http://localhost:3000/api/issues/4 -i

# error cases (study the codes)
curl -X POST http://localhost:3000/api/issues -H "Content-Type: application/json" -d '{}'          # 400 title required
curl http://localhost:3000/api/issues/999                                                            # 404
curl -X PATCH http://localhost:3000/api/issues/1 -H "Content-Type: application/json" -d '{"foo":1}'  # 400 unknown field
```

## Exam tips

- If asked "which verb for partial update?" → **PATCH**; full replace → **PUT**.
- If asked why `201` and not `200` for POST → resource **created**, new URI (often in `Location` header).
- Validation failures → **400**, missing resource → **404**. Know the difference cold.
- `express.json()` is the body-parsing middleware; without it `req.body` is `undefined`.
