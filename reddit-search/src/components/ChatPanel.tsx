/**
 * ChatPanel Component
 * A collapsible chat panel integrated with Reddit search results
 */

"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  IconButton,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  useColorModeValue,
  Collapse,
  Spinner,
} from "@chakra-ui/react";
import { CloseIcon, ChatIcon } from "@chakra-ui/icons";
import { ParsedPost } from "@/types/reddit";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  posts: ParsedPost[];
  keyword: string;
}

export default function ChatPanel({ posts, keyword }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const assistantBg = useColorModeValue("gray.100", "gray.700");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const context = {
        keyword,
        posts: posts.map((p) => ({
          title: p.title,
          body: p.body.slice(0, 500),
          subreddit: p.subreddit,
          author: p.author,
          score: p.score,
          comments: p.comments.slice(0, 5).map((c) => ({
            body: c.body.slice(0, 300),
            author: c.author,
            score: c.score,
          })),
        })),
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: posts.length > 0 ? context : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <IconButton
        aria-label="Toggle chat"
        icon={isOpen ? <CloseIcon /> : <Text fontSize="2xl">🤖</Text>}
        position="fixed"
        bottom={6}
        right={6}
        w={14}
        h={14}
        borderRadius="full"
        bgGradient="linear(to-br, blue.500, purple.600)"
        color="white"
        _hover={{ bgGradient: "linear(to-br, blue.600, purple.700)" }}
        shadow="lg"
        zIndex={50}
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Chat Panel */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          position="fixed"
          bottom={24}
          right={6}
          w="96"
          h="500px"
          bg={panelBg}
          borderRadius="xl"
          shadow="2xl"
          display="flex"
          flexDirection="column"
          zIndex={50}
          border="1px"
          borderColor={borderColor}
        >
          {/* Header */}
          <HStack px={4} py={3} borderBottom="1px" borderColor={borderColor} spacing={2}>
            <Text fontSize="xl">🤖</Text>
            <Box>
              <Text fontWeight="semibold">AI Assistant</Text>
              <Text fontSize="xs" color="gray.500">Powered by Gemini Flash</Text>
            </Box>
          </HStack>

          {/* Messages */}
          <Box flex="1" overflowY="auto" p={4}>
            <VStack spacing={3} align="stretch">
              {messages.length === 0 && (
                <Box textAlign="center" color="gray.500" py={8}>
                  <Text fontSize="sm">Ask me anything about the search results!</Text>
                  {posts.length > 0 && (
                    <Text fontSize="xs" mt={2}>
                      I have context from <strong>all {posts.length} posts</strong> about &quot;{keyword}&quot;
                    </Text>
                  )}
                </Box>
              )}
              {messages.map((msg, i) => (
                <Flex key={i} justify={msg.role === "user" ? "flex-end" : "flex-start"}>
                  <Box
                    maxW="85%"
                    borderRadius="lg"
                    px={3}
                    py={2}
                    fontSize="sm"
                    bg={msg.role === "user" ? "blue.600" : assistantBg}
                    color={msg.role === "user" ? "white" : undefined}
                  >
                    {msg.role === "assistant" ? (
                      <Box className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </Box>
                    ) : msg.content}
                  </Box>
                </Flex>
              ))}
              {isLoading && (
                <Flex justify="flex-start">
                  <Box bg={assistantBg} borderRadius="lg" px={4} py={2}>
                    <Spinner size="sm" />
                  </Box>
                </Flex>
              )}
              {error && <Text color="red.500" fontSize="sm" textAlign="center">{error}</Text>}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Input */}
          <Box p={3} borderTop="1px" borderColor={borderColor}>
            <HStack spacing={2}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                size="sm"
                isDisabled={isLoading}
              />
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleSend}
                isDisabled={isLoading || !input.trim()}
              >
                Send
              </Button>
            </HStack>
          </Box>
        </Box>
      </Collapse>
    </>
  );
}

