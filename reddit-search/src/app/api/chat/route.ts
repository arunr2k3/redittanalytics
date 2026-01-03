/**
 * Chat API Endpoint for Reddit Search App
 * 
 * POST /api/chat
 * Body: { messages: ChatMessage[], context?: RedditContext }
 */

import { NextRequest, NextResponse } from "next/server";
import { chat, ChatMessage, RedditContext } from "@/lib/chatbot";

interface ChatRequest {
  messages: ChatMessage[];
  context?: RedditContext;
}

export async function POST(request: NextRequest) {
  console.log("=== Chat API Request ===");

  try {
    const body: ChatRequest = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array cannot be empty" },
        { status: 400 }
      );
    }

    const validMessages = body.messages.filter(
      (msg) => msg.role === "user" || msg.role === "assistant"
    );

    console.log(`Processing ${validMessages.length} messages`);

    const response = await chat(validMessages, body.context);

    console.log("Response received from Gemini");

    return NextResponse.json({
      message: response,
      role: "assistant",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    let status = 500;

    if (message.includes("API key")) {
      status = 401;
    } else if (message.includes("rate limit")) {
      status = 429;
    }

    return NextResponse.json({ error: message, status }, { status });
  }
}

