/**
 * CommentItem Component
 * Displays a single comment with nested replies
 */

import { ParsedComment } from "@/types/reddit";

interface CommentItemProps {
  comment: ParsedComment;
  maxDepthDisplay?: number;
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

export default function CommentItem({
  comment,
  maxDepthDisplay = 5,
}: CommentItemProps) {
  if (comment.depth > maxDepthDisplay) {
    return null;
  }

  return (
    <div
      className="border-l-2 border-gray-200 pl-4"
      style={{ marginLeft: comment.depth > 0 ? "1rem" : 0 }}
    >
      {/* Comment header */}
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-blue-600">{comment.author}</span>
        <span>|</span>
        <span>{formatDate(comment.created_utc)}</span>
        <span>|</span>
        <span>{comment.score} points</span>
      </div>

      {/* Comment body */}
      <p className="mb-2 whitespace-pre-wrap text-sm text-gray-800">
        {comment.body}
      </p>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
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
