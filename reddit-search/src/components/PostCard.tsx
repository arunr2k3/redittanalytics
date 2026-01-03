/**
 * PostCard Component
 * Displays a Reddit post with its metadata and comments
 */

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Badge,
  Link,
  Collapse,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChatIcon, TriangleUpIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
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
  const cardBg = useColorModeValue("white", "gray.800");
  const commentsBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bodyColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Card bg={cardBg} shadow="md" mb={4} overflow="hidden">
      <CardBody p={4} borderBottom="1px" borderColor={borderColor}>
        {/* Subreddit and metadata */}
        <HStack spacing={2} fontSize="xs" color="gray.500" mb={2}>
          <Badge colorScheme="blue" variant="subtle">{post.subreddit}</Badge>
          <Text>•</Text>
          <Text>Posted by {post.author}</Text>
          <Text>•</Text>
          <Text>{formatDate(post.created_utc)}</Text>
        </HStack>

        {/* Post title */}
        <Heading size="md" mb={2}>
          <Text as="span" color="gray.400" mr={2}>#{index + 1}</Text>
          <Link
            href={post.permalink}
            isExternal
            _hover={{ color: "orange.500" }}
          >
            {post.title}
          </Link>
        </Heading>

        {/* Post body */}
        {post.body && (
          <Box
            fontSize="sm"
            color={bodyColor}
            mb={3}
            maxH="48"
            overflowY="auto"
            whiteSpace="pre-wrap"
          >
            {post.body}
          </Box>
        )}

        {/* Post stats */}
        <HStack spacing={4} fontSize="sm" color="gray.500">
          <HStack spacing={1}>
            <Icon as={TriangleUpIcon} />
            <Text>{post.score} points</Text>
          </HStack>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChatIcon />}
            rightIcon={showComments ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={() => setShowComments(!showComments)}
            _hover={{ color: "orange.500" }}
          >
            {post.num_comments} comments
          </Button>
        </HStack>
      </CardBody>

      {/* Comments section */}
      <Collapse in={showComments} animateOpacity>
        <Box p={4} bg={commentsBg} maxH="96" overflowY="auto">
          {post.comments.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" fontSize="sm" fontStyle="italic">
              No comments available
            </Text>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}

