/**
 * Reddit Search App - Main Page
 * 
 * This is the main entry point for the Reddit Search application.
 * It allows users to search Reddit posts across all subreddits
 * and view posts with their comments.
 */

"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import PostList from "@/components/PostList";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import ChatPanel from "@/components/ChatPanel";
import { ParsedPost, SearchResponse, ApiError } from "@/types/reddit";

export default function Home() {
  // State management
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Fetch search results from the API
   */
  const fetchResults = useCallback(
    async (keyword: string, after?: string): Promise<SearchResponse | null> => {
      const params = new URLSearchParams({ keyword, limit: "10" });
      if (after) {
        params.set("after", after);
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.message || "Failed to fetch results");
      }

      return data as SearchResponse;
    },
    []
  );

  /**
   * Handle initial search
   */
  const handleSearch = useCallback(
    async (keyword: string) => {
      setIsLoading(true);
      setError(null);
      setPosts([]);
      setSearchKeyword(keyword);
      setAfterCursor(null);
      setHasSearched(true);

      try {
        const results = await fetchResults(keyword);
        if (results) {
          setPosts(results.posts);
          setAfterCursor(results.after);
          setHasMore(results.has_more);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchResults]
  );

  /**
   * Handle loading more results (pagination)
   */
  const handleLoadMore = useCallback(async () => {
    if (!afterCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const results = await fetchResults(searchKeyword, afterCursor);
      if (results) {
        setPosts((prev) => [...prev, ...results.posts]);
        setAfterCursor(results.after);
        setHasMore(results.has_more);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [afterCursor, isLoadingMore, searchKeyword, fetchResults]);

  /**
   * Retry the last search
   */
  const handleRetry = useCallback(() => {
    if (searchKeyword) {
      handleSearch(searchKeyword);
    }
  }, [searchKeyword, handleSearch]);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            {/* Reddit-style logo */}
            <svg className="w-10 h-10 text-reddit-orange" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm5.66 11.28a1.29 1.29 0 0 1-1.28 1.28 1.25 1.25 0 0 1-.89-.36 6.15 6.15 0 0 1-3.43 1.1l.58 2.74 1.9-.41a.92.92 0 0 1 1.82.19.91.91 0 0 1-.91.92.91.91 0 0 1-.89-.71l-2.14.46a.24.24 0 0 1-.29-.19l-.66-3.1a6.27 6.27 0 0 1-3.58-1.1 1.25 1.25 0 0 1-.89.36 1.29 1.29 0 0 1-1.28-1.28 1.26 1.26 0 0 1 .53-1 4.74 4.74 0 0 1-.09-.93 4.09 4.09 0 0 1 4.82-3.82 4.09 4.09 0 0 1 4.82 3.82 4.74 4.74 0 0 1-.09.93 1.26 1.26 0 0 1 .58 1.03z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reddit Search
            </h1>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error message */}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {/* Loading state */}
        {isLoading && (
          <LoadingSpinner
            message="Searching Reddit and fetching comments..."
            size="lg"
          />
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <PostList
            posts={posts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        )}

        {/* Initial state */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
              Search Reddit
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Enter a keyword to search for posts and comments across all subreddits.
            </p>
          </div>
        )}
      </div>

      {/* AI Chat Panel */}
      <ChatPanel posts={posts} keyword={searchKeyword} />
    </main>
  );
}

