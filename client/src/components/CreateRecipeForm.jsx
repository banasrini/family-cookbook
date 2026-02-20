import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import styles from '../styles/CreateRecipeForm.module.css';

const BLANK_INGREDIENT = { name: '', quantity: '' };

export default function CreateRecipeForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    notes: '',
    ingredients: [{ ...BLANK_INGREDIENT }],
  });
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateIngredient(index, field, value) {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  }

  function addIngredient() {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...BLANK_INGREDIENT }],
    }));
  }

  function removeIngredient(index) {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ingredients = form.ingredients.filter(i => i.name.trim() !== '');
      const recipe = await api.createRecipe({ ...form, ingredients });
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Link to="/" className={styles.back}>← Back to recipes</Link>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>New Recipe</h1>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="e.g. Banana Bread"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="A short description"
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>Ingredients</legend>
          {form.ingredients.map((ing, i) => (
            <div key={i} className={styles.ingredientRow}>
              <input
                placeholder="Quantity (e.g. 2 cups)"
                value={ing.quantity}
                onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                className={styles.quantityInput}
              />
              <input
                placeholder="Ingredient name"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                className={styles.nameInput}
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className={styles.removeBtn}
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className={styles.addIngredientBtn}>
            + Add ingredient
          </button>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            rows={8}
            value={form.instructions}
            onChange={e => setField('instructions', e.target.value)}
            placeholder="Step 1: Preheat oven to 350°F..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Tips, substitutions, storage advice..."
          />
        </div>

        <button type="submit" disabled={submitting} className={styles.submitBtn}>
          {submitting ? 'Creating...' : 'Create Recipe'}
        </button>
      </form>
    </div>
  );
}
