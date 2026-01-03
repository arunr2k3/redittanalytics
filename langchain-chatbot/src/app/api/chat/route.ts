/**
 * Chat API Endpoint
 * 
 * POST /api/chat
 * Body: { messages: ChatMessage[] }
 * 
 * Sends messages to the LangChain chatbot and returns the response.
 * Supports both regular responses and streaming.
 */

import { NextRequest, NextResponse } from "next/server";
import { chat, ChatMessage } from "@/lib/chatbot";

interface ChatRequest {
  messages: ChatMessage[];
}

/**
 * POST handler for chat requests
 */
export async function POST(request: NextRequest) {
  console.log("=== Chat API Request ===");

  try {
    // Parse the request body
    const body: ChatRequest = await request.json();

    // Validate the request
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

    // Filter to only user and assistant messages (system is added internally)
    const validMessages = body.messages.filter(
      (msg) => msg.role === "user" || msg.role === "assistant"
    );

    console.log(`Processing ${validMessages.length} messages`);

    // Get the chatbot response
    const response = await chat(validMessages);

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

    return NextResponse.json(
      {
        error: message,
        status,
      },
      { status }
    );
  }
}

