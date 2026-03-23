const express = require('express');
const { client } = require('../db');

const router = express.Router();

// GET /api/tags - all tag names for autocomplete
router.get('/', async (req, res) => {
  try {
    const { rows } = await client.execute({ sql: 'SELECT name FROM tags ORDER BY name', args: [] });
    res.json(rows.map(r => r.name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
