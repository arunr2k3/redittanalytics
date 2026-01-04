/**
 * Reddit Search App - Main Page
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
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(
    async (keyword: string, after?: string): Promise<SearchResponse | null> => {
      const params = new URLSearchParams({ keyword, limit: "10" });
      if (after) params.set("after", after);

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

  const handleRetry = useCallback(() => {
    if (searchKeyword) handleSearch(searchKeyword);
  }, [searchKeyword, handleSearch]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <img
                  src="/assets/redditheader.png"
                  alt="Reddit"
                  className="h-8 w-auto"
                />
                <span>Search</span>
              </h1>
              <p className="text-sm text-gray-500">
                Search posts and comments across all subreddits
              </p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {isLoading && (
          <LoadingSpinner
            message="Searching Reddit and fetching comments..."
            size="lg"
          />
        )}

        {!isLoading && hasSearched && (
          <PostList
            posts={posts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        )}

        {!hasSearched && !isLoading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
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
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Search Reddit</h2>
            <p className="mt-2 text-sm text-gray-500">
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
