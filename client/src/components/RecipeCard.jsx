import { Link } from 'react-router-dom';
import styles from '../styles/RecipeCard.module.css';

export default function RecipeCard({ recipe }) {
  const preview = recipe.ingredients.slice(0, 4).map(i => i.name).join(', ');
  const hasMore = recipe.ingredients.length > 4;

  return (
    <Link to={`/recipes/${recipe.id}`} className={styles.card}>
      <h2 className={styles.name}>{recipe.name}</h2>
      {recipe.description && (
        <p className={styles.description}>{recipe.description}</p>
      )}
      {recipe.ingredients.length > 0 && (
        <p className={styles.ingredients}>
          {preview}{hasMore ? ', ...' : ''}
        </p>
      )}
    </Link>
  );
}
