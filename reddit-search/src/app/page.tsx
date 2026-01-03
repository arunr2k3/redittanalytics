/**
 * Reddit Search App - Main Page
 */

"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
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

  const mainBg = useColorModeValue("gray.50", "gray.900");
  const headerBg = useColorModeValue("white", "gray.800");

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
    <Box as="main" minH="100vh" bg={mainBg}>
      {/* Header */}
      <Box as="header" bg={headerBg} shadow="sm">
        <Container maxW="6xl" py={6}>
          <HStack spacing={3} mb={6}>
            <Text fontSize="4xl">🔍</Text>
            <Heading size="lg">Reddit Search</Heading>
          </HStack>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </Container>
      </Box>

      {/* Main content */}
      <Container maxW="6xl" py={8}>
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {isLoading && (
          <LoadingSpinner message="Searching Reddit and fetching comments..." size="lg" />
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
          <VStack py={16} spacing={4}>
            <SearchIcon boxSize={16} color="gray.400" />
            <Heading size="md">Search Reddit</Heading>
            <Text color="gray.500">
              Enter a keyword to search for posts and comments across all subreddits.
            </Text>
          </VStack>
        )}
      </Container>

      {/* AI Chat Panel */}
      <ChatPanel posts={posts} keyword={searchKeyword} />
    </Box>
  );
}

