const express = require('express');
const { client } = require('../db');

const router = express.Router();

// GET /api/ingredients — all known ingredient names for autocomplete
router.get('/', async (req, res) => {
  try {
    const { rows } = await client.execute('SELECT name FROM ingredients ORDER BY name');
    res.json(rows.map(r => r.name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
