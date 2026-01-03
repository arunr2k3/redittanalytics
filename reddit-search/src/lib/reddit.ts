/**
 * Reddit API Client
 * Uses the public Reddit JSON API (no authentication required)
 * Append .json to any Reddit URL to get JSON data
 */

import {
  RedditPostListing,
  RedditPost,
  RedditComment,
  ParsedPost,
  ParsedComment,
  SearchParams,
  SearchResponse,
} from "@/types/reddit";

// Reddit public API base URL
const REDDIT_BASE = "https://www.reddit.com";

// Rate limiting configuration (public API is more restrictive ~10 req/min to be safe)
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Rate limiter to respect Reddit's API limits
 */
class RateLimiter {
  private requests: number[] = [];

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    // Remove requests outside the time window
    this.requests = this.requests.filter(
      (time) => now - time < RATE_LIMIT_WINDOW_MS
    );

    if (this.requests.length >= RATE_LIMIT_REQUESTS) {
      // Calculate wait time until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = RATE_LIMIT_WINDOW_MS - (now - oldestRequest) + 100;
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // Retry after waiting
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Make a request to the Reddit public JSON API
 * No authentication required - just append .json to URLs
 */
async function redditFetch<T>(endpoint: string): Promise<T> {
  // Wait for rate limit slot
  await rateLimiter.waitForSlot();

  // Parse the endpoint to insert .json before query string
  let jsonEndpoint: string;
  if (endpoint.includes("?")) {
    // Insert .json before the query string
    const [path, query] = endpoint.split("?");
    jsonEndpoint = `${path}.json?${query}`;
  } else {
    jsonEndpoint = `${endpoint}.json`;
  }

  const url = `${REDDIT_BASE}${jsonEndpoint}`;

  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      // User-Agent is important for Reddit to not block requests
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
  });

  if (response.status === 429) {
    // Rate limited - wait and retry
    const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
    console.log(`Rate limited. Retrying after ${retryAfter}s...`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return redditFetch<T>(endpoint);
  }

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Parse Reddit comments recursively
 * Reddit returns comments in a nested structure with "replies" field
 */
function parseComments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any[],
  depth: number = 0,
  maxDepth: number = 10
): ParsedComment[] {
  if (depth > maxDepth) return [];

  const comments: ParsedComment[] = [];

  for (const child of children) {
    // Skip "more" comments links (kind: "more")
    if (child.kind !== "t1") continue;

    const comment: RedditComment = child.data;

    const parsed: ParsedComment = {
      id: comment.id,
      body: comment.body || "[deleted]",
      author: comment.author || "[deleted]",
      created_utc: comment.created_utc,
      score: comment.score || 0,
      depth,
      replies: [],
    };

    // Recursively parse nested replies
    if (
      comment.replies &&
      typeof comment.replies === "object" &&
      comment.replies.data?.children
    ) {
      parsed.replies = parseComments(
        comment.replies.data.children,
        depth + 1,
        maxDepth
      );
    }

    comments.push(parsed);
  }

  return comments;
}

/**
 * Fetch comments for a specific post
 */
async function fetchPostComments(
  subreddit: string,
  postId: string,
  limit: number = 100
): Promise<ParsedComment[]> {
  try {
    // Reddit returns [post, comments] array for comment endpoints
    const response = await redditFetch<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [any, { kind: string; data: { children: any[] } }]
    >(`/r/${subreddit}/comments/${postId}?limit=${limit}&depth=5&sort=top`);

    if (!response[1]?.data?.children) {
      return [];
    }

    return parseComments(response[1].data.children);
  } catch (error) {
    console.error(`Error fetching comments for ${postId}:`, error);
    return [];
  }
}

/**
 * Search Reddit posts across all subreddits
 */
export async function searchReddit(params: SearchParams): Promise<SearchResponse> {
  const { keyword, limit = 10, after, sort = "relevance", time = "all" } = params;

  if (!keyword || keyword.trim() === "") {
    throw new Error("Search keyword is required");
  }

  // Build search query parameters
  const queryParams = new URLSearchParams({
    q: keyword,
    limit: Math.min(limit, 25).toString(), // Cap at 25 to avoid too many comment fetches
    sort,
    t: time,
    type: "link", // Search only posts (not comments or subreddits)
    restrict_sr: "false", // Search all subreddits
  });

  if (after) {
    queryParams.set("after", after);
  }

  // Search for posts
  console.log(`Searching Reddit for: "${keyword}"`);
  const searchResults = await redditFetch<RedditPostListing>(
    `/search?${queryParams.toString()}`
  );

  const posts: ParsedPost[] = [];

  // Process each post and fetch its comments
  for (const child of searchResults.data.children) {
    if (child.kind !== "t3") continue; // t3 = post/link

    const post: RedditPost = child.data;

    console.log(`Fetching comments for: ${post.title.substring(0, 50)}...`);

    // Fetch comments for this post
    const comments = await fetchPostComments(post.subreddit, post.id);

    posts.push({
      id: post.id,
      title: post.title,
      body: post.selftext || "",
      author: post.author || "[deleted]",
      created_utc: post.created_utc,
      subreddit: post.subreddit,
      score: post.score,
      num_comments: post.num_comments,
      permalink: `https://reddit.com${post.permalink}`,
      url: post.url,
      comments,
    });
  }

  return {
    posts,
    after: searchResults.data.after,
    before: searchResults.data.before,
    total_results: searchResults.data.dist || posts.length,
    has_more: searchResults.data.after !== null,
  };
}

