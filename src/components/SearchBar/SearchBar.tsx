'use client';

import { useState } from 'react';
import styles from './SearchBar.module.scss';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  onFilterClick, 
  placeholder = "Тут будет поиск, фильтры и всякое такое" 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className={styles.searchBarContainer}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <svg 
            className={styles.searchIcon} 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className={styles.searchInput}
          />
        </div>
        
        <button
          type="button"
          onClick={onFilterClick}
          className={styles.filterButton}
        >
          <svg 
            className={styles.filterIcon} 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Фильтры
        </button>
      </form>
    </div>
  );
}
