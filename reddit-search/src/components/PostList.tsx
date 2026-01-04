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
      <div className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">No results found</p>
        <p className="text-sm text-gray-500">Try searching for a different keyword.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="mb-4 text-sm text-gray-500">
        Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
      </p>

      <div className="flex flex-col gap-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF4500] px-6 py-3 text-sm font-semibold text-white
                       hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isLoadingMore ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Loading more...
              </>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
