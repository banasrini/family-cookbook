# Cookbook — Claude Context

## Architecture

Full-stack recipe app:
- **Frontend**: React + Vite (`client/`) on port 5173 in dev
- **Backend**: Express.js (`server/`) on port 3001 in dev
- **Database**: Turso (serverless SQLite via `@libsql/client`)
- **Deployment**: Vercel (serverless functions)

## Key Files

| File | Role |
|------|------|
| `server/db.js` | Turso client init + `initDb()` schema bootstrap |
| `server/app.js` | Express app setup, exported (no `listen`) |
| `server/index.js` | Local dev entry — imports app, calls `app.listen()` |
| `api/index.js` | Vercel entry point — re-exports `server/app` |
| `vercel.json` | Build config + `/api/:path*` → `/api/index` rewrite |
| `server/routes/recipes.js` | Full CRUD for recipes (async, uses transactions) |
| `server/routes/ingredients.js` | GET all ingredient names for autocomplete |
| `server/seed.js` | Seeds 17 recipes; run with `node seed.js` from `server/` |

## Database

- **Local dev**: `file:./data/recipes.db` (libsql local file, set in `.env`)
- **Production**: Turso cloud URL via env vars `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- **Schema**: 3 tables — `recipes`, `ingredients`, `recipe_ingredients` (many-to-many)
- `initDb()` is called on cold start in `app.js`; it's idempotent (`CREATE TABLE IF NOT EXISTS`)

## Query Patterns (always async)

```js
// Single row
const { rows: [row] } = await client.execute({ sql: 'SELECT ...', args: [id] });

// Multiple rows
const { rows } = await client.execute({ sql: 'SELECT ...' });

// Insert / update / delete
const result = await client.execute({ sql: 'INSERT ...', args: [...] });
const id = Number(result.lastInsertRowid); // lastInsertRowid is BigInt — always convert

// Transaction
const tx = await client.transaction('write');
try { await tx.execute(...); await tx.commit(); }
catch (e) { await tx.rollback(); throw e; }
```

## Environment Variables

```
TURSO_DATABASE_URL   # libsql URL (file:./data/recipes.db locally, libsql://... in prod)
TURSO_AUTH_TOKEN     # not needed for local file DB; required for Turso cloud
```

Set production env vars in Vercel dashboard (Project → Settings → Environment Variables).

## Dev Commands

```bash
# Install all deps
cd server && npm install
cd client && npm install

# Start backend (port 3001)
cd server && npm run dev

# Start frontend (port 5173, proxies /api to :3001)
cd client && npm run dev

# Re-seed database
cd server && node seed.js
```

## Vercel Deployment

```bash
vercel          # preview deploy (follow prompts, set env vars)
vercel --prod   # promote to production
```

Build: `cd client && npm install && npm run build` → outputs to `client/dist`
API: all `/api/*` requests → `api/index.js` → `server/app.js`

## Conventions

- All route handlers are `async` with try/catch returning `500` on error
- Ingredient names stored lowercase (`LOWER(?)` on insert/lookup)
- `hydrateRecipe(id)` assembles a recipe + its ingredients list — called after every write
- `lastInsertRowid` is always wrapped in `Number()` (libsql returns BigInt)
- No ORM — raw SQL throughout
- `server/package.json` is CommonJS (`"type": "commonjs"`)
- `client/package.json` is ESM (`"type": "module"`)
