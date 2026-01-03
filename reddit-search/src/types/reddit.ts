/**
 * TypeScript types for Reddit API responses
 */

// Comment structure from Reddit API
export interface RedditComment {
  id: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  replies?: RedditCommentListing | string; // Can be empty string or nested listing
}

// Post structure from Reddit API
export interface RedditPost {
  id: string;
  title: string;
  selftext: string; // Post body (for text posts)
  author: string;
  created_utc: number;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  num_comments: number;
  permalink: string;
  url: string;
  is_self: boolean; // true if text post, false if link post
}

// Parsed comment for our API response
export interface ParsedComment {
  id: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  depth: number;
  replies: ParsedComment[];
}

// Parsed post with comments for our API response
export interface ParsedPost {
  id: string;
  title: string;
  body: string;
  author: string;
  created_utc: number;
  subreddit: string;
  score: number;
  num_comments: number;
  permalink: string;
  url: string;
  comments: ParsedComment[];
}

// Search API response structure
export interface SearchResponse {
  posts: ParsedPost[];
  after: string | null; // Pagination cursor
  before: string | null;
  total_results: number;
  has_more: boolean;
}

// Reddit API listing structure (used for both posts and comments)
export interface RedditListing<T> {
  kind: "Listing";
  data: {
    after: string | null;
    before: string | null;
    children: Array<{
      kind: string;
      data: T;
    }>;
    dist: number;
  };
}

// Specific types for post and comment listings
export type RedditPostListing = RedditListing<RedditPost>;
export type RedditCommentListing = RedditListing<RedditComment>;

// OAuth token response from Reddit
export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Error response structure
export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// Search request parameters
export interface SearchParams {
  keyword: string;
  limit?: number;
  after?: string;
  sort?: "relevance" | "hot" | "top" | "new" | "comments";
  time?: "hour" | "day" | "week" | "month" | "year" | "all";
}

