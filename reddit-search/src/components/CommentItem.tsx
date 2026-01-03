/**
 * CommentItem Component
 * Displays a single comment with nested replies
 */

import { Box, Text, HStack, VStack, useColorModeValue } from "@chakra-ui/react";
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
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (comment.depth > maxDepthDisplay) {
    return null;
  }

  return (
    <Box
      borderLeft="2px"
      borderColor={borderColor}
      pl={4}
      ml={comment.depth > 0 ? 4 : 0}
    >
      {/* Comment header */}
      <HStack spacing={2} fontSize="xs" color="gray.500" mb={1}>
        <Text fontWeight="medium" color="blue.500">{comment.author}</Text>
        <Text>•</Text>
        <Text>{formatDate(comment.created_utc)}</Text>
        <Text>•</Text>
        <Text>{comment.score} points</Text>
      </HStack>

      {/* Comment body */}
      <Text fontSize="sm" whiteSpace="pre-wrap" mb={2}>
        {comment.body}
      </Text>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <VStack spacing={2} align="stretch" mt={2}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              maxDepthDisplay={maxDepthDisplay}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}

