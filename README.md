# Family Cookbook

A full-stack recipe app for storing and browsing family recipes, with ingredient-based filtering and source tags (Amma / Atthamma).

**Live:** https://cookbook-ashen.vercel.app/

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite |
| Backend | Express.js (Node) |
| Database | Turso (serverless SQLite via `@libsql/client`) |
| Deployment | Vercel (serverless functions) |

---

## Local Development

### Prerequisites

- Node.js 18+
- A Turso account (or use the local SQLite fallback)

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
TURSO_DATABASE_URL=file:./data/recipes.db   # local SQLite
TURSO_AUTH_TOKEN=                            # leave empty for local file DB
```

### 3. Start the servers

```bash
# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173, proxies /api → :3001)
cd client && npm run dev
```

### 4. Seed the database

```bash
cd server && node seed.js
```

This inserts 17 sample recipes.

---

## Deployment (Vercel)

### Environment variables

Set these in the Vercel dashboard under **Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://<db-name>-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | Token from `turso db tokens create <db-name>` |

### Deploy

```bash
vercel          # preview
vercel --prod   # production
```

### Seed production database

Run once after first deploy (or whenever you need to reset data):

```bash
cd server
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node seed.js
```

---

## Project Structure

```
├── api/
│   └── index.js          # Vercel serverless entry point
├── client/               # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── api.js         # Fetch helpers for all API calls
│       └── components/
├── server/               # Express backend
│   ├── app.js            # Express setup, exported for Vercel + local
│   ├── index.js          # Local dev entry (calls app.listen)
│   ├── db.js             # Turso client + schema init
│   ├── seed.js           # Seeds 17 recipes
│   └── routes/
│       ├── recipes.js    # Full CRUD
│       └── ingredients.js # GET all ingredient names (autocomplete)
└── vercel.json           # Build config + /api/* rewrite rule
```

---

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/recipes` | List all recipes (supports `?ingredient=a,b` and `?source=amma`) |
| `GET` | `/api/recipes/:id` | Get a single recipe with ingredients |
| `POST` | `/api/recipes` | Create a recipe |
| `PUT` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |
| `GET` | `/api/ingredients` | List all ingredient names for autocomplete |
