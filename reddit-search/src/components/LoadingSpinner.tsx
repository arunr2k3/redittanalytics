/**
 * LoadingSpinner Component
 * Displays a spinning loader with optional message
 */

import { VStack, Spinner, Text } from "@chakra-ui/react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "sm",
    md: "lg",
    lg: "xl",
  } as const;

  return (
    <VStack p={8} spacing={4}>
      <Spinner
        size={sizeMap[size]}
        color="orange.500"
        thickness="4px"
        emptyColor="gray.200"
      />
      {message && (
        <Text fontSize="sm" color="gray.500">
          {message}
        </Text>
      )}
    </VStack>
  );
}

