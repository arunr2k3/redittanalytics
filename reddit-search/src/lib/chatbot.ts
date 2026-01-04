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

const MAX_POSTS_IN_PROMPT = 5;
const MAX_COMMENTS_PER_POST = 3;
const MAX_POST_BODY_CHARS = 800;
const MAX_COMMENT_CHARS = 240;
const MAX_TOTAL_PROMPT_CHARS = 12000;

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars - 3)}...`;
}

function buildSystemPrompt(context?: RedditContext): string {
  let prompt = `You are a helpful AI assistant integrated with a Reddit Search application.

Your capabilities:
- You provide clear, accurate, and helpful responses
- You can analyze and discuss Reddit posts and comments
- You use markdown formatting when appropriate
- You're honest about limitations`;

  if (context && context.posts.length > 0) {
    const posts = context.posts.slice(0, MAX_POSTS_IN_PROMPT);
    prompt += `\n\n--- REDDIT SEARCH CONTEXT ---
The user searched for: "${context.keyword}"
Found ${context.posts.length} posts. Showing the top ${posts.length}:

`;
    posts.forEach((post, i) => {
      const body = post.body ? truncateText(post.body, MAX_POST_BODY_CHARS) : "";
      const comments = post.comments
        .slice(0, MAX_COMMENTS_PER_POST)
        .map((c) => `[${c.author}]: ${truncateText(c.body, MAX_COMMENT_CHARS)}`)
        .join(" | ");
      prompt += `Post ${i + 1}: "${post.title}" in r/${post.subreddit} (score: ${post.score})
${body ? `Content: ${body}` : ""}
Top comments: ${comments || "None"}

`;
    });
    prompt += `\nYou have context from ${posts.length} posts. Reference them by number when answering.`;
  }

  if (prompt.length > MAX_TOTAL_PROMPT_CHARS) {
    prompt = truncateText(prompt, MAX_TOTAL_PROMPT_CHARS);
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

    const { content } = response;

    // Normalize the response content into plain text
    if (typeof content === "string") {
      return content;
    }

    const asArray = Array.isArray(content) ? content : [content];
    const parts = asArray
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof (part as { text?: unknown }).text === "string") {
          return (part as { text: string }).text;
        }
        // Fallback: try to stringify known shapes
        return "";
      })
      .filter(Boolean)
      .join("");

    return parts || JSON.stringify(content);
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
