/**
 * CommentItem Component
 * Displays a single comment with nested replies
 */

import { ParsedComment } from "@/types/reddit";

interface CommentItemProps {
  comment: ParsedComment;
  maxDepthDisplay?: number;
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

export default function CommentItem({
  comment,
  maxDepthDisplay = 5,
}: CommentItemProps) {
  // Limit nesting depth for UI clarity
  if (comment.depth > maxDepthDisplay) {
    return null;
  }

  return (
    <div
      className={`border-l-2 border-gray-200 dark:border-gray-700 pl-4 ${comment.depth > 0 ? "ml-4" : ""
        }`}
    >
      {/* Comment header */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span className="font-medium text-reddit-blue">{comment.author}</span>
        <span>•</span>
        <span>{formatDate(comment.created_utc)}</span>
        <span>•</span>
        <span>{comment.score} points</span>
      </div>

      {/* Comment body */}
      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-2">
        {comment.body}
      </p>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              maxDepthDisplay={maxDepthDisplay}
            />
          ))}
        </div>
      )}
    </div>
  );
}

