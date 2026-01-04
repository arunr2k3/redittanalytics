/**
 * PostCard Component
 * Displays a Reddit post with its metadata and comments
 */

"use client";

import { useState } from "react";
import { ParsedPost } from "@/types/reddit";
import CommentItem from "./CommentItem";

interface PostCardProps {
  post: ParsedPost;
  index: number;
}

function formatDate(utcTimestamp: number): string {
  const date = new Date(utcTimestamp * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({ post, index }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        {/* Subreddit and metadata */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-[#FF4500]">
            {post.subreddit}
          </span>
          <span>|</span>
          <span>Posted by {post.author}</span>
          <span>|</span>
          <span>{formatDate(post.created_utc)}</span>
        </div>

        {/* Post title */}
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          <span className="mr-2 text-gray-400">#{index + 1}</span>
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="hover:text-reddit-orange"
          >
            {post.title}
          </a>
        </h3>

        {/* Post body */}
        {post.body && (
          <div className="mb-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm text-gray-600">
            {post.body}
          </div>
        )}

        {/* Post stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="inline-flex items-center gap-1">
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
              <path d="M12 19V6" />
              <path d="M5 12l7-7 7 7" />
            </svg>
            <span>{post.score} points</span>
          </div>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:text-reddit-orange"
          >
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
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            <span>{post.num_comments} comments</span>
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
              {showComments ? (
                <path d="M18 15l-6-6-6 6" />
              ) : (
                <path d="M6 9l6 6 6-6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="max-h-96 overflow-y-auto bg-gray-50 p-4">
          {post.comments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-500">No comments available</p>
          )}
        </div>
      )}
    </div>
  );
}
