import RecipeCard from './RecipeCard';
import styles from '../styles/RecipeList.module.css';

export default function RecipeList({ recipes }) {
  if (recipes.length === 0) {
    return (
      <p className={styles.empty}>
        No recipes found. Try a different filter or{' '}
        <a href="/new">create a new recipe</a>!
      </p>
    );
  }
  return (
    <ul className={styles.grid}>
      {recipes.map(recipe => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </li>
      ))}
    </ul>
  );
}
