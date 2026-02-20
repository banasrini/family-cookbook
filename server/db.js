const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/recipes.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
  await client.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS recipes (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        description  TEXT,
        instructions TEXT,
        notes        TEXT,
        created_at   TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS ingredients (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS recipe_ingredients (
        recipe_id     INTEGER NOT NULL REFERENCES recipes(id)     ON DELETE CASCADE,
        ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity      TEXT,
        PRIMARY KEY (recipe_id, ingredient_id)
      )`,
      args: [],
    },
  ], 'write');
}

module.exports = { client, initDb };
