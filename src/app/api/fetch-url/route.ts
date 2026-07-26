import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "StudyPath/1.0 (Educational tool; +https://studypath.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.status} ${response.statusText}` }, { status: 422 });
    }

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    let text: string;

    if (contentType.includes("text/html") || contentType.includes("xhtml")) {
      // Extract meaningful text from HTML
      text = html
        // Remove script and style elements
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        // Remove nav, header, footer, sidebar
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        // Remove HTML tags
        .replace(/<[^>]+>/g, " ")
        // Decode entities
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean whitespace
        .replace(/\s+/g, " ")
        .trim();
    } else {
      // Plain text
      text = html.trim();
    }

    // Truncate to reasonable length
    if (text.length > 50000) {
      text = text.slice(0, 50000);
    }

    if (text.length < 50) {
      return NextResponse.json({ error: "Could not extract meaningful content from this URL." }, { status: 422 });
    }

    return NextResponse.json({ text, length: text.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch URL";
    if (message.includes("timeout")) {
      return NextResponse.json({ error: "Request timed out. The URL may be slow or unreachable." }, { status: 408 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
