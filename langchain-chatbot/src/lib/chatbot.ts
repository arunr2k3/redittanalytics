/**
 * LangChain Chatbot with Google Gemini Flash
 * 
 * This module creates a conversational chatbot using LangChain
 * with Google's Gemini 2.0 Flash model for fast responses.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

// Define message types for the chat
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Create and configure the Google Gemini model
 * Using gemini-2.0-flash for fast, efficient responses
 */
function createModel() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash", // Using Gemini 2.0 Flash for speed
    maxOutputTokens: 2048,
    temperature: 0.7, // Balance between creativity and consistency
  });
}

/**
 * Convert our chat messages to LangChain message format
 */
function convertToLangChainMessages(messages: ChatMessage[]): BaseMessage[] {
  return messages.map((msg) => {
    switch (msg.role) {
      case "system":
        return new SystemMessage(msg.content);
      case "user":
        return new HumanMessage(msg.content);
      case "assistant":
        return new AIMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });
}

/**
 * System prompt to define the chatbot's personality and behavior
 */
const SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant. 

Your characteristics:
- You provide clear, accurate, and helpful responses
- You're conversational and engaging
- You can help with a wide variety of topics including coding, writing, analysis, and general questions
- You use markdown formatting when appropriate (code blocks, lists, headers)
- You're honest about limitations and uncertainties
- You keep responses concise but comprehensive

Always be respectful and helpful to the user.`;

/**
 * Send a message to the chatbot and get a response
 * 
 * @param messages - The conversation history
 * @returns The assistant's response
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  try {
    // Create the model instance
    const model = createModel();

    // Add system prompt at the beginning if not already present
    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Convert to LangChain format
    const langChainMessages = convertToLangChainMessages(messagesWithSystem);

    // Invoke the model
    console.log("Sending message to Gemini...");
    const response = await model.invoke(langChainMessages);

    // Extract the text content from the response
    const content = response.content;

    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      // Handle multi-part responses
      return content
        .map((part) => (typeof part === "string" ? part : part.text || ""))
        .join("");
    }

    return String(content);
  } catch (error) {
    console.error("Chatbot error:", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("API_KEY")) {
        throw new Error("Invalid or missing Google API key");
      }
      if (error.message.includes("quota") || error.message.includes("rate")) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
      throw new Error(`Chat failed: ${error.message}`);
    }

    throw new Error("An unexpected error occurred");
  }
}

/**
 * Stream a response from the chatbot (for real-time typing effect)
 */
export async function* chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
  try {
    const model = createModel();

    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const langChainMessages = convertToLangChainMessages(messagesWithSystem);

    // Use streaming for real-time responses
    const stream = await model.stream(langChainMessages);

    for await (const chunk of stream) {
      const content = chunk.content;
      if (typeof content === "string") {
        yield content;
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    throw error;
  }
}

