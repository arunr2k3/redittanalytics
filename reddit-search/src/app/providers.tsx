"use client";

import { ChakraProvider, extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    reddit: {
      orange: "#FF4500",
      blue: "#0079D3",
      dark: "#1A1A1B",
      light: "#DAE0E6",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        _dark: {
          bg: "gray.900",
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

