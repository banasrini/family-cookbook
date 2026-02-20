import { Link } from 'react-router-dom';
import styles from '../styles/RecipeCard.module.css';

const SOURCE_LABEL = { amma: 'A', atthamma: 'At' };

export default function RecipeCard({ recipe }) {
  const preview = recipe.ingredients.slice(0, 4).map(i => i.name).join(', ');
  const hasMore = recipe.ingredients.length > 4;
  const sourceClass = recipe.source ? styles[recipe.source] : '';

  return (
    <Link to={`/recipes/${recipe.id}`} className={`${styles.card} ${sourceClass}`}>
      {recipe.source && (
        <span className={`${styles.tag} ${styles[`tag_${recipe.source}`]}`}>
          {SOURCE_LABEL[recipe.source]}
        </span>
      )}
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
