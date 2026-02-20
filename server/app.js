const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const recipesRouter = require('./routes/recipes');
const ingredientsRouter = require('./routes/ingredients');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/recipes', recipesRouter);
app.use('/api/ingredients', ingredientsRouter);

// Init DB schema on cold start
initDb().catch((err) => {
  console.error('FATAL: database initialization failed. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.', err);
});

module.exports = app;
