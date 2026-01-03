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

/**
 * Format Unix timestamp to human-readable date
 */
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
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {/* Post header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        {/* Subreddit and metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium text-reddit-blue">{post.subreddit}</span>
          <span>•</span>
          <span>Posted by {post.author}</span>
          <span>•</span>
          <span>{formatDate(post.created_utc)}</span>
        </div>

        {/* Post title */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          <span className="text-gray-400 mr-2">#{index + 1}</span>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-reddit-orange transition-colors"
          >
            {post.title}
          </a>
        </h2>

        {/* Post body (if text post) */}
        {post.body && (
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-3 max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>
        )}

        {/* Post stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {post.score} points
          </span>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 hover:text-reddit-orange transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {post.num_comments} comments
            {showComments ? " ▲" : " ▼"}
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto comments-scrollable">
          {post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              No comments available
            </p>
          )}
        </div>
      )}
    </article>
  );
}

