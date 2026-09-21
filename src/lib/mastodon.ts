import { Poem } from '@/types/poem'
import { getRandomUnusedPoem, markPoemAsUsed } from '@/lib/supabase'

const MASTODON_MAX_CHARS = 500

// Truncate poem excerpt to fit within the character budget, cutting at complete lines
export function reformatAsSonnet(excerpt: string, maxChars: number): string {
  if (!excerpt) return '';
  if (maxChars <= 0) return '';

  // Clean up: max 2 consecutive line breaks, trim
  const text = excerpt
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length <= maxChars) return text;

  // Truncate at the last complete line that fits. Reserve space for "\n..." (4 chars).
  const suffix = '\n...';
  const lines = text.split('\n');
  let result = '';

  for (const line of lines) {
    const candidate = result ? `${result}\n${line}` : line;
    if (candidate.length > maxChars - suffix.length) break;
    result = candidate;
  }

  if (result) return `${result}${suffix}`;
  // Fallback: first line alone is too long — hard-truncate at character level
  return text.slice(0, Math.max(0, maxChars - 3)) + '...';
}

// Mastodon counts every link as 23 characters, whatever its real length
const MASTODON_URL_LENGTH = 23

const HASHTAGS = '#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura'

// "Sara de Ibáñez" -> "#SaraDeIbáñez"
function authorHashtag(author: string): string {
  const words = author.split(/\s+/).filter(word => word.length > 0)
  const joined = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .replace(/[^\p{L}\p{N}]/gu, '')
  return joined ? `#${joined}` : ''
}

type PostablePoem = Pick<Poem, 'title' | 'author' | 'excerpt' | 'url'>

export function formatPoemForPost(poem: PostablePoem): string {
  const header = `«${poem.title}»\n\n`;

  const linkLine = poem.url ? `\n\nPoema completo: ${poem.url}` : '';
  const tags = [authorHashtag(poem.author), HASHTAGS].filter(tag => tag).join(' ');
  const footer = `\n\n— ${poem.author}${linkLine}\n\n${tags}`;

  // Length of the footer as Mastodon counts it (the link counts as 23 chars)
  const footerCountedLength = poem.url
    ? footer.length - poem.url.length + MASTODON_URL_LENGTH
    : footer.length;

  // Calculate how much space the excerpt can use
  const excerptBudget = MASTODON_MAX_CHARS - header.length - footerCountedLength;

  let formattedExcerpt = reformatAsSonnet(poem.excerpt, excerptBudget);

  // Safety net: never send more than the Mastodon limit, even if something slipped through.
  // Trim the excerpt (not the whole post) so the link and hashtags stay intact.
  if (formattedExcerpt.length > excerptBudget) {
    formattedExcerpt = formattedExcerpt.slice(0, Math.max(0, excerptBudget - 3)) + '...';
  }

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
