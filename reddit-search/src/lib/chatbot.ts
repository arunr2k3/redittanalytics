/**
 * LangChain Chatbot with Google Gemini Flash
 * Integrated with Reddit Search App
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RedditContext {
  posts: Array<{
    title: string;
    body: string;
    subreddit: string;
    author: string;
    score: number;
    comments: Array<{
      body: string;
      author: string;
      score: number;
    }>;
  }>;
  keyword: string;
}

function createModel() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    temperature: 0.7,
  });
}

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

function buildSystemPrompt(context?: RedditContext): string {
  let prompt = `You are a helpful AI assistant integrated with a Reddit Search application.

Your capabilities:
- You provide clear, accurate, and helpful responses
- You can analyze and discuss Reddit posts and comments
- You use markdown formatting when appropriate
- You're honest about limitations`;

  if (context && context.posts.length > 0) {
    prompt += `\n\n--- REDDIT SEARCH CONTEXT ---
The user searched for: "${context.keyword}"
Found ${context.posts.length} posts. Here are ALL the posts:

`;
    context.posts.forEach((post, i) => {
      prompt += `Post ${i + 1}: "${post.title}" in r/${post.subreddit} (score: ${post.score})
${post.body ? `Content: ${post.body}` : ""}
Top comments: ${post.comments.map(c => `[${c.author}]: ${c.body}`).join(" | ")}

`;
    });
    prompt += `\nYou have context from ALL ${context.posts.length} posts. Reference them by number when answering.`;
  }

  return prompt;
}

export async function chat(messages: ChatMessage[], context?: RedditContext): Promise<string> {
  try {
    const model = createModel();
    const systemPrompt = buildSystemPrompt(context);

    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const langChainMessages = convertToLangChainMessages(messagesWithSystem);
    console.log("Sending message to Gemini...");
    const response = await model.invoke(langChainMessages);

    const content = response.content;

    if (typeof content === "string") {
      return content;
    } else if (Array.isArray(content)) {
      return content.map((part) => (typeof part === "string" ? part : part.text || "")).join("");
    }

    return String(content);
  } catch (error) {
    console.error("Chatbot error:", error);

    if (error instanceof Error) {
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

