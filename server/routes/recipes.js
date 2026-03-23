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
  const { rows: tags } = await client.execute({
    sql: `SELECT t.id, t.name
          FROM recipe_tags rt
          JOIN tags t ON t.id = rt.tag_id
          WHERE rt.recipe_id = ?
          ORDER BY t.name`,
    args: [id],
  });
  return { ...recipe, ingredients, tags };
}

async function upsertTags(tx, recipeId, tagNames) {
  await tx.execute({ sql: 'DELETE FROM recipe_tags WHERE recipe_id = ?', args: [recipeId] });
  for (const name of tagNames) {
    const normalized = name.trim().toLowerCase();
    if (!normalized) continue;
    await tx.execute({
      sql: 'INSERT OR IGNORE INTO tags (name) VALUES (?)',
      args: [normalized],
    });
    const { rows: [row] } = await tx.execute({
      sql: 'SELECT id FROM tags WHERE name = ?',
      args: [normalized],
    });
    await tx.execute({
      sql: 'INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
      args: [recipeId, row.id],
    });
  }
}

// GET /api/recipes?ingredient=butter,flour&source=amma&tag=quick,spicy
router.get('/', async (req, res) => {
  try {
    const { ingredient, source, tag } = req.query;

    let sql = 'SELECT DISTINCT r.id FROM recipes r WHERE 1=1';
    const args = [];

    if (source) {
      sql += ' AND r.source = ?';
      args.push(source);
    }

    if (ingredient) {
      const names = ingredient.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (names.length > 0) {
        const placeholders = names.map(() => '?').join(', ');
        sql += ` AND (
          SELECT COUNT(DISTINCT i.id) FROM recipe_ingredients ri
          JOIN ingredients i ON i.id = ri.ingredient_id
          WHERE ri.recipe_id = r.id AND LOWER(i.name) IN (${placeholders})
        ) = ?`;
        args.push(...names, names.length);
      }
    }

    if (tag) {
      const tagNames = tag.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (tagNames.length > 0) {
        const placeholders = tagNames.map(() => '?').join(', ');
        sql += ` AND (
          SELECT COUNT(DISTINCT t.id) FROM recipe_tags rt
          JOIN tags t ON t.id = rt.tag_id
          WHERE rt.recipe_id = r.id AND LOWER(t.name) IN (${placeholders})
        ) = ?`;
        args.push(...tagNames, tagNames.length);
      }
    }

    sql += ' ORDER BY r.created_at DESC';

    const { rows } = await client.execute({ sql, args });
    const recipes = await Promise.all(rows.map(r => hydrateRecipe(r.id)));
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
  const { name, description, instructions, notes, source, ingredients = [], tags = [] } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Recipe name is required' });
  }

  const tx = await client.transaction('write');
  try {
    const r = await tx.execute({
      sql: 'INSERT INTO recipes (name, description, instructions, notes, source) VALUES (?, ?, ?, ?, ?)',
      args: [name.trim(), description ?? null, instructions ?? null, notes ?? null, source ?? null],
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

    await upsertTags(tx, recipeId, tags);

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
  const { name, description, instructions, notes, source, ingredients, tags } = req.body;

  let tx;
  try {
    const { rows: [existing] } = await client.execute({
      sql: 'SELECT id FROM recipes WHERE id = ?',
      args: [id],
    });
    if (!existing) return res.status(404).json({ error: 'Recipe not found' });

    tx = await client.transaction('write');

    await tx.execute({
      sql: `UPDATE recipes
            SET name         = COALESCE(?, name),
                description  = COALESCE(?, description),
                instructions = COALESCE(?, instructions),
                notes        = ?,
                source       = COALESCE(?, source),
                updated_at   = datetime('now')
            WHERE id = ?`,
      args: [name ?? null, description ?? null, instructions ?? null, notes ?? null, source ?? null, id],
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

    if (Array.isArray(tags)) {
      await upsertTags(tx, id, tags);
    }

    await tx.commit();
    res.json(await hydrateRecipe(id));
  } catch (e) {
    if (tx) await tx.rollback();
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

// POST /api/recipes/:id/ai-edit
router.post('/:id/ai-edit', async (req, res) => {
  const id = parseInt(req.params.id);
  const { note } = req.body;

  if (!note || note.trim() === '') {
    return res.status(400).json({ error: 'note is required' });
  }

  const recipe = await hydrateRecipe(id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const ingredientsList = recipe.ingredients
    .map(i => `${i.quantity ? i.quantity + ' ' : ''}${i.name}`)
    .join('\n');

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a helpful cooking assistant for a family recipe book.
Apply the user's requested change to the recipe and return ONLY the updated fields.
Be precise and literal. When updating ingredients, return the COMPLETE updated list.
Preserve the original style and voice of the recipe.`,
      tools: [{
        name: 'update_recipe',
        description: 'Apply updates to a recipe. Only include fields that actually changed.',
        input_schema: {
          type: 'object',
          properties: {
            instructions: {
              type: 'string',
              description: 'Full updated instructions. Only include if instructions changed.',
            },
            ingredients: {
              type: 'array',
              description: 'COMPLETE updated ingredients list. Only include if any ingredient changed.',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Ingredient name, lowercase' },
                  quantity: { type: 'string', description: 'e.g. "2 cups", "1 tsp"' },
                },
                required: ['name'],
              },
            },
          },
        },
      }],
      tool_choice: { type: 'any' },
      messages: [{
        role: 'user',
        content: `Current recipe:

Name: ${recipe.name}
${recipe.description ? `Description: ${recipe.description}\n` : ''}
Ingredients:
${ingredientsList || '(none)'}

Instructions:
${recipe.instructions || '(none)'}

User's requested change: "${note.trim()}"

Apply the change and call update_recipe with only the fields that need updating.`,
      }],
    });

    const toolUse = response.content.find(b => b.type === 'tool_use');
    if (!toolUse) return res.status(500).json({ error: 'AI did not return an update' });

    const updates = toolUse.input;
    if (!updates.instructions && !Array.isArray(updates.ingredients)) {
      return res.json(recipe); // nothing to change
    }

    const tx = await client.transaction('write');
    try {
      if (updates.instructions !== undefined) {
        await tx.execute({
          sql: `UPDATE recipes SET instructions = ?, updated_at = datetime('now') WHERE id = ?`,
          args: [updates.instructions, id],
        });
      }
      if (Array.isArray(updates.ingredients)) {
        await tx.execute({ sql: 'DELETE FROM recipe_ingredients WHERE recipe_id = ?', args: [id] });
        for (const ing of updates.ingredients) {
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
      throw e;
    }
  } catch (e) {
    console.error('AI edit error:', e);
    res.status(500).json({ error: 'AI edit failed. Please try again.' });
  }
});

module.exports = router;
