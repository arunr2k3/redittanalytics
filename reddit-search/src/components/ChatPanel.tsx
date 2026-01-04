/**
 * ChatPanel Component
 * A collapsible chat panel integrated with Reddit search results
 */

"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const showToggle = !(isOpen && isFullScreen);

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
      {showToggle && (
        <button
          type="button"
          aria-label="Toggle chat"
          className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full
                     bg-[#FF4500] text-white shadow-lg hover:bg-[#e03d00]
                     sm:bottom-6 sm:right-6 sm:h-9 sm:w-9"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19.5 12c0-.87-.71-1.58-1.58-1.58-.42 0-.8.17-1.08.44-1.07-.75-2.54-1.23-4.17-1.3l.71-3.34 2.32.49c.02.62.53 1.12 1.16 1.12.65 0 1.17-.52 1.17-1.17s-.52-1.17-1.17-1.17c-.46 0-.86.27-1.05.66l-2.59-.55a.28.28 0 00-.33.22l-.79 3.72c-1.67.06-3.17.55-4.26 1.32-.28-.28-.66-.45-1.09-.45-.87 0-1.58.71-1.58 1.58 0 .62.36 1.15.88 1.41-.02.15-.03.3-.03.46 0 2.35 2.74 4.25 6.12 4.25s6.12-1.9 6.12-4.25c0-.15-.01-.31-.03-.46.52-.26.88-.79.88-1.4z"
                fill="white"
              />
              <circle cx="9" cy="13" r="1.1" fill="#FF4500" />
              <circle cx="15" cy="13" r="1.1" fill="#FF4500" />
              <path
                d="M9.5 15.5c.47.67 1.35 1.13 2.5 1.13s2.03-.46 2.5-1.13"
                stroke="#FF4500"
                strokeWidth="0.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl transition-all
                      ${isFullScreen
              ? "inset-2 rounded-xl sm:inset-6 sm:rounded-2xl"
              : "bottom-20 left-4 right-4 h-[70vh] max-h-[540px] rounded-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:h-[500px] sm:max-h-[500px] sm:w-96"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF4500]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M19.5 12c0-.87-.71-1.58-1.58-1.58-.42 0-.8.17-1.08.44-1.07-.75-2.54-1.23-4.17-1.3l.71-3.34 2.32.49c.02.62.53 1.12 1.16 1.12.65 0 1.17-.52 1.17-1.17s-.52-1.17-1.17-1.17c-.46 0-.86.27-1.05.66l-2.59-.55a.28.28 0 00-.33.22l-.79 3.72c-1.67.06-3.17.55-4.26 1.32-.28-.28-.66-.45-1.09-.45-.87 0-1.58.71-1.58 1.58 0 .62.36 1.15.88 1.41-.02.15-.03.3-.03.46 0 2.35 2.74 4.25 6.12 4.25s6.12-1.9 6.12-4.25c0-.15-.01-.31-.03-.46.52-.26.88-.79.88-1.4z"
                    fill="white"
                  />
                  <circle cx="9" cy="13" r="1.1" fill="#FF4500" />
                  <circle cx="15" cy="13" r="1.1" fill="#FF4500" />
                  <path
                    d="M9.5 15.5c.47.67 1.35 1.13 2.5 1.13s2.03-.46 2.5-1.13"
                    stroke="#FF4500"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullScreen ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="14 4 14 10 20 10" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <polyline points="10 20 10 14 4 14" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsFullScreen(false);
                }}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p className="text-sm">Ask me anything about the search results!</p>
                  {posts.length > 0 && (
                    <p className="mt-2 text-xs">
                      Context loaded from {posts.length} posts about &quot;{keyword}&quot;
                    </p>
                  )}
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                      ? "bg-[#FF4500] text-white"
                      : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-100 px-4 py-2">
                    <span className="flex items-center gap-1">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF4500] focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="rounded-md bg-[#FF4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e03d00]
                           disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
