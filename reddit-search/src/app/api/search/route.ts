/**
 * Search API Endpoint
 * 
 * GET /api/search?keyword=...&limit=...&after=...
 * 
 * Searches Reddit for posts containing the keyword and returns
 * structured JSON with posts, comments, and timestamps.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchReddit } from "@/lib/reddit";
import { SearchParams, SearchResponse, ApiError } from "@/types/reddit";

/**
 * Validate and parse search parameters from the request
 */
function parseSearchParams(request: NextRequest): SearchParams {
  const searchParams = request.nextUrl.searchParams;

  const keyword = searchParams.get("keyword");
  if (!keyword || keyword.trim() === "") {
    throw new Error("Missing required parameter: keyword");
  }

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const after = searchParams.get("after") || undefined;
  const sort = (searchParams.get("sort") as SearchParams["sort"]) || "relevance";
  const time = (searchParams.get("time") as SearchParams["time"]) || "all";

  return {
    keyword: keyword.trim(),
    limit: Math.min(Math.max(limit, 1), 25), // Clamp between 1 and 25
    after,
    sort,
    time,
  };
}

/**
 * GET handler for search requests
 */
export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse | ApiError>> {
  console.log("=== Search API Request ===");
  console.log(`URL: ${request.url}`);

  try {
    // Parse and validate request parameters
    const params = parseSearchParams(request);
    console.log("Search params:", params);

    // Perform the Reddit search
    const results = await searchReddit(params);

    console.log(`Found ${results.posts.length} posts`);

    // Return successful response with CORS headers
    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Search API error:", error);

    // Determine appropriate error status code
    const message = error instanceof Error ? error.message : "Unknown error";
    let status = 500;

    if (message.includes("Missing required parameter")) {
      status = 400; // Bad Request
    } else if (message.includes("credentials")) {
      status = 503; // Service Unavailable
    } else if (message.includes("Rate limit")) {
      status = 429; // Too Many Requests
    }

    const errorResponse: ApiError = {
      error: status === 400 ? "Bad Request" : "Internal Server Error",
      message,
      status,
    };

    return NextResponse.json(errorResponse, { status });
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

