/**
 * SearchBar Component
 * Input field with search button for entering keywords
 */

"use client";

import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && !isLoading) {
      onSearch(keyword.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        {/* Search Input */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search Reddit posts and comments..."
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-reddit-orange focus:border-transparent
                     dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-label="Search keyword"
        />
        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          className="px-6 py-3 text-lg font-semibold text-white bg-reddit-orange rounded-lg
                     hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-reddit-orange focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Search"
          )}
        </button>
      </div>
      {/* Search tips */}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Search across all subreddits. Results include posts and their comments.
      </p>
    </form>
  );
}

