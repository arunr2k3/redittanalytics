/**
 * PostList Component
 * Displays a list of posts with pagination controls
 */

"use client";

import { ParsedPost } from "@/types/reddit";
import PostCard from "./PostCard";

interface PostListProps {
  posts: ParsedPost[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function PostList({
  posts,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try searching for a different keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
      </p>

      {/* Post list */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Load More button for pagination */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 text-sm font-medium text-white bg-reddit-blue rounded-lg
                       hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-reddit-blue focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
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
                Loading more...
              </span>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

