import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch recent posts from your Mastodon account
    const response = await fetch(`${process.env.MASTODON_API_URL}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to verify Mastodon credentials: ${response.status}`);
    }

    const accountData = await response.json();
    const accountId = accountData.id;

    // Get recent statuses from the account
    const statusesResponse = await fetch(
      `${process.env.MASTODON_API_URL}/api/v1/accounts/${accountId}/statuses?limit=3&exclude_reblogs=true`, 
      {
        headers: {
          'Authorization': `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`
        }
      }
    );

    if (!statusesResponse.ok) {
      throw new Error(`Failed to fetch Mastodon posts: ${statusesResponse.status}`);
    }

    const posts = await statusesResponse.json();

    // Format posts for public display
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      content: decodeHtmlEntities(post.content.replace(/<[^>]*>/g, '')), // Strip HTML and decode entities
      url: post.url,
      created_at: post.created_at,
      // Extract poem title from content (assuming it's in quotes)
      poemTitle: extractPoemTitle(post.content)
    }));

    return NextResponse.json({
      success: true,
      posts: formattedPosts
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Mastodon posts'
    }, { status: 500 })
  }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(str: string): string {
  const htmlEntities: { [key: string]: string } = {
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&plusmn;': '±',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    '&times;': '×',
    '&divide;': '÷',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
    '&para;': '¶',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&bull;': '•',
    '&middot;': '·',
    '&laquo;': '«',
    '&raquo;': '»',
    '&acute;': '´',
    '&cedil;': '¸',
    '&uml;': '¨',
    '&macr;': '¯'
  };

  // First, handle named entities
  let decoded = str;
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Handle numeric entities (e.g., &#8220; &#8221; etc.)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Handle hex numeric entities (e.g., &#x201C; &#x201D; etc.)
  decoded = decoded.replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}

// Helper function to extract poem title from Mastodon post content
function extractPoemTitle(content: string): string {
  // Remove HTML tags first
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const decodedText = decodeHtmlEntities(plainText);
  
  // Look for text between « and » (our poem title format)
  const titleMatch = decodedText.match(/«([^»]+)»/);
  
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Fallback: look for text in quotes at the beginning
  const quoteMatch = decodedText.match(/^"([^"]+)"/);
  if (quoteMatch) {
    return quoteMatch[1].trim();
  }
  
  // Fallback: return first 50 characters
  return decodedText.substring(0, 50) + (decodedText.length > 50 ? '...' : '');
}
