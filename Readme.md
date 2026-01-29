# PasteBin
## Deployed URL
https://pastebin-azyq-git-main-mili-shandilyas-projects.vercel.app/ 

A minimal Pastebin-like service built with Node.js, Express, and Redis.  
it supports time framed pastes, maximum view limits, and browser rendering through html page

## Features
- Create text pastes via API or simple HTML form
- ttl  for pastes
- maximum view count per paste is implemented
- HTML rendering for browser access
- Redis based storage
- basic security via Helmet

---

## API Endpoints

### Health Check


GET /api/healthz


Response:
```json
{ "ok": true }

## Create Paste 
POST /api/pastes


Body:

{
  "content": "mili1234",
  "ttl_seconds": 60,
  "max_views": 5
}


Response:

{
  "id": "abd",
  "url": "http://<host>/p/abd"
}

## Fetch Paste 
GET /api/pastes/<id>


Response:

{
  "content": "mili1234",
  "remaining_views": 4,
  "expires_at": "2026-01-29T12:00:00.000Z"
}

## View Paste 
GET /p/:id


renders the paste content directly in the browser

## Create Paste 
GET /


provides a minimal HTML form to create a paste without using the API

Environment Variables
REDIS_URL=rediss://<username>:<password>@<host>:<port>
PORT=3000


Redis credentials are injected via environment variables

# how to run locally
npm install
npm start


The server will start on http://localhost:3000.


# Design 
redis hashes are used to store paste metadata

TTL is enforced using timestamp comparison instead of Redis EXPIRE

View count is enforced atomically using HINCRBY

HTML output is escaped to prevent XSS

Security headers are applied using Helmet