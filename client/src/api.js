const BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getRecipes(ingredients = [], source = null) {
    const p = new URLSearchParams();
    if (ingredients.length) p.set('ingredient', ingredients.join(','));
    if (source) p.set('source', source);
    const qs = p.toString() ? `?${p}` : '';
    return fetch(`${BASE}/recipes${qs}`).then(handleResponse);
  },

  getRecipe(id) {
    return fetch(`${BASE}/recipes/${id}`).then(handleResponse);
  },

  createRecipe(data) {
    return fetch(`${BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  updateRecipe(id, data) {
    return fetch(`${BASE}/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  deleteRecipe(id) {
    return fetch(`${BASE}/recipes/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  getIngredients() {
    return fetch(`${BASE}/ingredients`).then(handleResponse);
  },
};
