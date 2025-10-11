import { NextResponse } from "next/server"

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  }

  // Replace named entities
  let decoded = text.replace(/&[a-z]+;/gi, (match) => entities[match.toLowerCase()] || match)

  // Replace numeric entities (e.g., &#39;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))

  // Replace hex entities (e.g., &#x27;)
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(Number.parseInt(hex, 16)))

  return decoded
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MetadataBot/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: response.status })
    }

    const html = await response.text()

    // Extract title
    let title = ""
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      title = decodeHtmlEntities(titleMatch[1].trim())
    }

    // Try og:title if no title found
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      if (ogTitleMatch) {
        title = decodeHtmlEntities(ogTitleMatch[1].trim())
      }
    }

    // Extract description
    let description = ""

    // Try og:description first
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogDescMatch) {
      description = decodeHtmlEntities(ogDescMatch[1].trim())
    }

    // Try meta description if no og:description
    if (!description) {
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      if (metaDescMatch) {
        description = decodeHtmlEntities(metaDescMatch[1].trim())
      }
    }

    return NextResponse.json({ title, description })
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
