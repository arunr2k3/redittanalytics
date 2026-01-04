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
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search Reddit posts and comments..."
          disabled={isLoading}
          aria-label="Search keyword"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm
                     focus:border-reddit-orange focus:outline-none focus:ring-2 focus:ring-orange-200
                     disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-reddit-orange px-5 py-3 text-sm font-semibold text-white
                     hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300 sm:min-w-[120px]"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Searching...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </span>
          )}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Search across all subreddits. Results include posts and their comments.
      </p>
    </form>
  );
}
