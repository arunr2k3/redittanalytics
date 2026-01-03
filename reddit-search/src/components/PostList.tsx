/**
 * PostList Component
 * Displays a list of posts with pagination controls
 */

"use client";

import {
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
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
      <VStack py={12} spacing={2}>
        <Icon as={WarningIcon} boxSize={12} color="gray.400" />
        <Text fontSize="lg" fontWeight="medium">
          No results found
        </Text>
        <Text fontSize="sm" color="gray.500">
          Try searching for a different keyword.
        </Text>
      </VStack>
    );
  }

  return (
    <Box w="full" maxW="4xl" mx="auto">
      <Text fontSize="sm" color="gray.500" mb={4}>
        Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
      </Text>

      <VStack spacing={4} align="stretch">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </VStack>

      {hasMore && (
        <Box textAlign="center" mt={8}>
          <Button
            onClick={onLoadMore}
            isDisabled={isLoadingMore}
            colorScheme="blue"
            size="lg"
            leftIcon={isLoadingMore ? <Spinner size="sm" /> : undefined}
          >
            {isLoadingMore ? "Loading more..." : "Load More Posts"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

