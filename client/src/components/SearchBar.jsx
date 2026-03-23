import { useState, useEffect } from 'react';
import { api } from '../api';
import styles from '../styles/SearchBar.module.css';

export default function SearchBar({ onFilterChange, activeFilters, sourceFilter, onSourceChange, tagFilters, onTagFilterChange }) {
  const [inputValue, setInputValue]         = useState('');
  const [allIngredients, setAllIngredients] = useState([]);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [tagInput, setTagInput]             = useState('');
  const [allTags, setAllTags]               = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    api.getIngredients().then(setAllIngredients).catch(() => {});
    api.getTags().then(setAllTags).catch(() => {});
  }, []);

  const matchingSuggestions = inputValue.length > 0
    ? allIngredients.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !activeFilters.includes(s.toLowerCase())
      )
    : [];

  const matchingTagSuggestions = tagInput.length > 0
    ? allTags.filter(s =>
        s.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tagFilters.includes(s.toLowerCase())
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

  function addTagFilter(name) {
    const normalized = name.trim().toLowerCase();
    if (!normalized || tagFilters.includes(normalized)) return;
    onTagFilterChange([...tagFilters, normalized]);
    setTagInput('');
    setShowTagDropdown(false);
  }

  function removeTagFilter(name) {
    onTagFilterChange(tagFilters.filter(f => f !== name));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTagFilter(tagInput);
    }
    if (e.key === 'Escape') setShowTagDropdown(false);
  }

  function toggleSource(value) {
    onSourceChange(sourceFilter === value ? null : value);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.sourceRow}>
        <button
          type="button"
          className={`${styles.sourceBtn} ${styles.amma} ${sourceFilter === 'amma' ? styles.active : ''}`}
          onClick={() => toggleSource('amma')}
        >
          Amma
        </button>
        <button
          type="button"
          className={`${styles.sourceBtn} ${styles.atthamma} ${sourceFilter === 'atthamma' ? styles.active : ''}`}
          onClick={() => toggleSource('atthamma')}
        >
          Atthamma
        </button>
      </div>
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
      <div className={styles.container}>
        <div className={styles.chips}>
          {tagFilters.map(f => (
            <span key={f} className={`${styles.chip} ${styles.tagChip}`}>
              #{f}
              <button
                type="button"
                onClick={() => removeTagFilter(f)}
                aria-label={`Remove tag ${f}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tagFilters.length === 0 ? 'Filter by tag...' : 'Add another tag...'}
            value={tagInput}
            onChange={e => { setTagInput(e.target.value); setShowTagDropdown(true); }}
            onKeyDown={handleTagKeyDown}
            onFocus={() => setShowTagDropdown(true)}
            onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
            className={styles.input}
          />
        </div>
        {showTagDropdown && matchingTagSuggestions.length > 0 && (
          <ul className={styles.dropdown}>
            {matchingTagSuggestions.slice(0, 8).map(s => (
              <li key={s} onMouseDown={() => addTagFilter(s)}>
                #{s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
