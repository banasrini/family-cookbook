import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import styles from '../styles/RecipeDetail.module.css';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe]           = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [aiEditOpen, setAiEditOpen]   = useState(false);
  const [aiNote, setAiNote]           = useState('');
  const [aiApplying, setAiApplying]   = useState(false);
  const [aiError, setAiError]         = useState(null);

  useEffect(() => {
    api.getRecipe(id)
      .then(data => { setRecipe(data); setNotesValue(data.notes ?? ''); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveNotes() {
    setSaving(true);
    try {
      const updated = await api.updateRecipe(id, { notes: notesValue });
      setRecipe(updated);
      setEditingNotes(false);
    } catch (e) {
      alert(`Failed to save notes: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
    await api.deleteRecipe(id);
    navigate('/');
  }

  async function applyAiEdit() {
    if (!aiNote.trim()) return;
    setAiApplying(true);
    setAiError(null);
    try {
      const updated = await api.aiEditRecipe(id, aiNote);
      setRecipe(updated);
      setAiNote('');
      setAiEditOpen(false);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiApplying(false);
    }
  }

  if (loading) return <p className={styles.state}>Loading...</p>;
  if (error)   return <p className={styles.state}>Error: {error}</p>;
  if (!recipe) return null;

  return (
    <article className={styles.detail}>
      <Link to="/" className={styles.back}>← Back to recipes</Link>

      <h1 className={styles.title}>{recipe.name}</h1>
      {recipe.description && (
        <p className={styles.description}>{recipe.description}</p>
      )}

      <div className={styles.aiEditContainer}>
        {!aiEditOpen ? (
          <button
            onClick={() => { setAiEditOpen(true); setAiError(null); }}
            className={styles.editNotesBtn}
          >
            Edit recipe
          </button>
        ) : (
          <div className={styles.aiEditPanel}>
            <p className={styles.aiEditLabel}>What would you like to change?</p>
            <textarea
              value={aiNote}
              onChange={e => { setAiNote(e.target.value); setAiError(null); }}
              rows={3}
              placeholder="e.g. also add garlic to this, double the flour, remove cilantro"
              className={styles.notesTextarea}
              disabled={aiApplying}
              autoFocus
            />
            {aiError && <p className={styles.aiEditError}>{aiError}</p>}
            <div className={styles.notesActions}>
              <button
                onClick={applyAiEdit}
                disabled={aiApplying || !aiNote.trim()}
                className={styles.saveBtn}
              >
                {aiApplying ? 'Updating...' : 'Apply'}
              </button>
              <button
                onClick={() => { setAiEditOpen(false); setAiNote(''); setAiError(null); }}
                disabled={aiApplying}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {recipe.ingredients.length > 0 && (
        <section className={styles.section}>
          <h2>Ingredients</h2>
          <ul className={styles.ingredientList}>
            {recipe.ingredients.map(i => (
              <li key={i.id}>
                {i.quantity && <span className={styles.quantity}>{i.quantity}</span>}
                {i.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.instructions && (
        <section className={styles.section}>
          <h2>Instructions</h2>
          <pre className={styles.instructions}>{recipe.instructions}</pre>
        </section>
      )}

      <section className={styles.section}>
        <h2>Notes</h2>
        {editingNotes ? (
          <div className={styles.notesEditor}>
            <textarea
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              rows={5}
              placeholder="Add your notes here..."
              className={styles.notesTextarea}
            />
            <div className={styles.notesActions}>
              <button onClick={saveNotes} disabled={saving} className={styles.saveBtn}>
                {saving ? 'Saving...' : 'Save notes'}
              </button>
              <button
                onClick={() => { setEditingNotes(false); setNotesValue(recipe.notes ?? ''); }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.notesView}>
            <p className={recipe.notes ? styles.notesText : styles.notesEmpty}>
              {recipe.notes || 'No notes yet.'}
            </p>
            <button onClick={() => setEditingNotes(true)} className={styles.editNotesBtn}>
              {recipe.notes ? 'Edit notes' : 'Add notes'}
            </button>
          </div>
        )}
      </section>

      <hr className={styles.divider} />
      <button onClick={handleDelete} className={styles.deleteBtn}>
        Delete recipe
      </button>
    </article>
  );
}
