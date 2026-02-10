import { Poem } from '@/types/poem'
import { getRandomUnusedPoem, markPoemAsUsed } from '@/lib/supabase'

const MASTODON_MAX_CHARS = 500

// Truncate poem excerpt to fit within the character budget, cutting at complete lines
export function reformatAsSonnet(excerpt: string, maxChars: number): string {
  if (!excerpt) return '';

  // Clean up: max 2 consecutive line breaks, trim
  const text = excerpt
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length <= maxChars) return text;

  // Truncate at the last complete line that fits
  const lines = text.split('\n');
  let result = '';

  for (const line of lines) {
    const candidate = result ? `${result}\n${line}` : line;
    // Reserve 3 chars for the "..." suffix
    if (candidate.length > maxChars - 3) break;
    result = candidate;
  }

  return result ? `${result}\n...` : text.slice(0, maxChars - 3) + '...';
}

function formatPoemForPost(poem: Poem): string {
  const header = `«${poem.title}»\n\n`;
  const footer = `\n\n— ${poem.author}\n\n#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura`;

  // Calculate how much space the excerpt can use
  const overhead = header.length + footer.length;
  const excerptBudget = MASTODON_MAX_CHARS - overhead;

  const formattedExcerpt = reformatAsSonnet(poem.excerpt, excerptBudget);

  return `${header}${formattedExcerpt}${footer}`;
}

export async function postPoem(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  poem?: Poem;
  mastodonId?: string;
}> {
  try {
    // Get an unused poem from database
    const poem = await getRandomUnusedPoem();

    if (!poem) {
      return {
        success: false,
        error: 'No unused poems available in the database.'
      };
    }

    const postContent = formatPoemForPost(poem);

    // Post to Mastodon
    const mastodonResponse = await fetch(`${process.env.MASTODON_API_URL}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: postContent,
        visibility: 'public'
      })
    });

    if (!mastodonResponse.ok) {
      const errorData = await mastodonResponse.text();
      throw new Error(`Mastodon API error: ${mastodonResponse.status} ${errorData}`);
    }

    const mastodonData = await mastodonResponse.json();

    // Mark poem as used in database
    await markPoemAsUsed(poem.id);

    return {
      success: true,
      message: `Successfully posted "${poem.title}" by ${poem.author}`,
      poem: poem,
      mastodonId: mastodonData.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function testMastodonConnection(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const response = await fetch(`${process.env.MASTODON_API_URL}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Mastodon API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Connected to Mastodon as @${data.username}`
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}
