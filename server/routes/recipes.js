const express = require('express');
const { client } = require('../db');

const router = express.Router();

async function hydrateRecipe(id) {
  const { rows: [recipe] } = await client.execute({
    sql: 'SELECT * FROM recipes WHERE id = ?',
    args: [id],
  });
  if (!recipe) return null;
  const { rows: ingredients } = await client.execute({
    sql: `SELECT i.id, i.name, ri.quantity
          FROM recipe_ingredients ri
          JOIN ingredients i ON i.id = ri.ingredient_id
          WHERE ri.recipe_id = ?
          ORDER BY i.name`,
    args: [id],
  });
  return { ...recipe, ingredients };
}

// GET /api/recipes?ingredient=butter,flour
router.get('/', async (req, res) => {
  try {
    const { ingredient } = req.query;

    let recipeIds;

    if (ingredient) {
      const names = ingredient.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (names.length === 0) {
        const { rows } = await client.execute('SELECT id FROM recipes ORDER BY created_at DESC');
        const recipes = await Promise.all(rows.map(r => hydrateRecipe(r.id)));
        return res.json(recipes);
      }
      const placeholders = names.map(() => '?').join(', ');
      const { rows } = await client.execute({
        sql: `SELECT r.id FROM recipes r
              JOIN recipe_ingredients ri ON ri.recipe_id = r.id
              JOIN ingredients i         ON i.id = ri.ingredient_id
              WHERE LOWER(i.name) IN (${placeholders})
              GROUP BY r.id
              HAVING COUNT(DISTINCT i.id) = ?
              ORDER BY r.created_at DESC`,
        args: [...names, names.length],
      });
      recipeIds = rows.map(r => r.id);
    } else {
      const { rows } = await client.execute('SELECT id FROM recipes ORDER BY created_at DESC');
      recipeIds = rows.map(r => r.id);
    }

    const recipes = await Promise.all(recipeIds.map(id => hydrateRecipe(id)));
    res.json(recipes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await hydrateRecipe(parseInt(req.params.id));
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/recipes
router.post('/', async (req, res) => {
  const { name, description, instructions, notes, ingredients = [] } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Recipe name is required' });
  }

  const tx = await client.transaction('write');
  try {
    const r = await tx.execute({
      sql: 'INSERT INTO recipes (name, description, instructions, notes) VALUES (?, ?, ?, ?)',
      args: [name.trim(), description ?? null, instructions ?? null, notes ?? null],
    });
    const recipeId = Number(r.lastInsertRowid);

    for (const ing of ingredients) {
      if (!ing.name || ing.name.trim() === '') continue;
      await tx.execute({
        sql: 'INSERT OR IGNORE INTO ingredients (name) VALUES (LOWER(?))',
        args: [ing.name.trim()],
      });
      const { rows: [row] } = await tx.execute({
        sql: 'SELECT id FROM ingredients WHERE name = LOWER(?)',
        args: [ing.name.trim()],
      });
      await tx.execute({
        sql: 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
        args: [recipeId, row.id, ing.quantity ?? null],
      });
    }

    await tx.commit();
    res.status(201).json(await hydrateRecipe(recipeId));
  } catch (e) {
    await tx.rollback();
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const { rows: [existing] } = await client.execute({
    sql: 'SELECT id FROM recipes WHERE id = ?',
    args: [id],
  });
  if (!existing) return res.status(404).json({ error: 'Recipe not found' });

  const { name, description, instructions, notes, ingredients } = req.body;

  const tx = await client.transaction('write');
  try {
    await tx.execute({
      sql: `UPDATE recipes
            SET name         = COALESCE(?, name),
                description  = COALESCE(?, description),
                instructions = COALESCE(?, instructions),
                notes        = ?,
                updated_at   = datetime('now')
            WHERE id = ?`,
      args: [name ?? null, description ?? null, instructions ?? null, notes ?? null, id],
    });

    if (Array.isArray(ingredients)) {
      await tx.execute({
        sql: 'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
        args: [id],
      });

      for (const ing of ingredients) {
        if (!ing.name || ing.name.trim() === '') continue;
        await tx.execute({
          sql: 'INSERT OR IGNORE INTO ingredients (name) VALUES (LOWER(?))',
          args: [ing.name.trim()],
        });
        const { rows: [row] } = await tx.execute({
          sql: 'SELECT id FROM ingredients WHERE name = LOWER(?)',
          args: [ing.name.trim()],
        });
        await tx.execute({
          sql: 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
          args: [id, row.id, ing.quantity ?? null],
        });
      }
    }

    await tx.commit();
    res.json(await hydrateRecipe(id));
  } catch (e) {
    await tx.rollback();
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await client.execute({
      sql: 'DELETE FROM recipes WHERE id = ?',
      args: [id],
    });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Recipe not found' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
