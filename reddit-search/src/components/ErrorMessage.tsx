/**
 * ErrorMessage Component
 * Displays error messages with retry option
 */

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Text,
  Code,
} from "@chakra-ui/react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Alert status="error" variant="left-accent" borderRadius="md" my={4} flexDirection="column" alignItems="flex-start">
      <Box display="flex" alignItems="center" w="full">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Box>
        {onRetry && (
          <Button size="sm" colorScheme="red" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Box>

      {message.includes("credentials") && (
        <Text mt={3} fontSize="xs" color="red.600">
          💡 Make sure you&apos;ve set up your Reddit API credentials in the{" "}
          <Code colorScheme="red">.env.local</Code> file. See{" "}
          <Code colorScheme="red">.env.example</Code> for instructions.
        </Text>
      )}

      {message.includes("Rate limit") && (
        <Text mt={3} fontSize="xs" color="red.600">
          ⏱️ Reddit API rate limit exceeded. Please wait a moment and try again.
        </Text>
      )}
    </Alert>
  );
}

