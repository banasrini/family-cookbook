import { useState, useEffect } from 'react';
import { api } from '../api';
import styles from '../styles/SearchBar.module.css';

export default function SearchBar({ onFilterChange, activeFilters }) {
  const [inputValue, setInputValue]     = useState('');
  const [allIngredients, setAllIngredients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api.getIngredients().then(setAllIngredients).catch(() => {});
  }, []);

  const matchingSuggestions = inputValue.length > 0
    ? allIngredients.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !activeFilters.includes(s.toLowerCase())
      )
    : [];

  function addFilter(name) {
    const normalized = name.trim().toLowerCase();
    if (!normalized || activeFilters.includes(normalized)) return;
    onFilterChange([...activeFilters, normalized]);
    setInputValue('');
    setShowDropdown(false);
  }

  function removeFilter(name) {
    onFilterChange(activeFilters.filter(f => f !== name));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addFilter(inputValue);
    }
    if (e.key === 'Escape') setShowDropdown(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.chips}>
        {activeFilters.map(f => (
          <span key={f} className={styles.chip}>
            {f}
            <button
              type="button"
              onClick={() => removeFilter(f)}
              aria-label={`Remove ${f}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={activeFilters.length === 0 ? 'Filter by ingredient...' : 'Add another ingredient...'}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className={styles.input}
        />
      </div>
      {showDropdown && matchingSuggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {matchingSuggestions.slice(0, 8).map(s => (
            <li key={s} onMouseDown={() => addFilter(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
