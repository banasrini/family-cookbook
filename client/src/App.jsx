import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { api } from './api';
import SearchBar        from './components/SearchBar';
import RecipeList       from './components/RecipeList';
import RecipeDetail     from './components/RecipeDetail';
import CreateRecipeForm from './components/CreateRecipeForm';
import styles from './styles/App.module.css';

function Home() {
  const [recipes, setRecipes]             = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecipes(activeFilters);
      setRecipes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div className={styles.home}>
      <SearchBar onFilterChange={setActiveFilters} activeFilters={activeFilters} />
      {error   && <p className={styles.error}>{error}</p>}
      {loading ? <p className={styles.loading}>Loading...</p> : <RecipeList recipes={recipes} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Cookbook</Link>
        <nav className={styles.nav}>
          <Link to="/">Browse</Link>
          <Link to="/new" className={styles.newBtn}>+ New Recipe</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/new"         element={<CreateRecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
