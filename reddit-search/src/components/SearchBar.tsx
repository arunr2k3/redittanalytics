/**
 * SearchBar Component
 * Input field with search button for entering keywords
 */

"use client";

import { useState, FormEvent } from "react";
import {
  Box,
  Input,
  Button,
  HStack,
  Text,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");
  const inputBg = useColorModeValue("white", "gray.800");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && !isLoading) {
      onSearch(keyword.trim());
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="full" maxW="2xl" mx="auto">
      <HStack spacing={2}>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search Reddit posts and comments..."
          size="lg"
          bg={inputBg}
          borderColor="gray.300"
          _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange" }}
          isDisabled={isLoading}
          aria-label="Search keyword"
        />
        <Button
          type="submit"
          colorScheme="orange"
          size="lg"
          px={6}
          isDisabled={isLoading || !keyword.trim()}
          leftIcon={isLoading ? <Spinner size="sm" /> : <SearchIcon />}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </HStack>
      <Text mt={2} fontSize="sm" color="gray.500">
        Search across all subreddits. Results include posts and their comments.
      </Text>
    </Box>
  );
}

