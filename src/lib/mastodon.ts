import { Poem } from '@/types/poem'
import { getRandomUnusedPoem, markPoemAsUsed } from '@/lib/supabase'

// This function formats poems for Mastodon display
export function reformatAsSonnet(flatText: string): string {
  if (!flatText) return '';
  
  // The text should already have line breaks from the scraper
  // Just ensure it's clean and properly formatted
  return flatText
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive line breaks
    .trim();
}

function formatPoemForPost(poem: Poem): string {
  // Format with proper line breaks for Mastodon
  const formattedExcerpt = reformatAsSonnet(poem.excerpt);
  
  return `«${poem.title}»\n\n${formattedExcerpt}\n\n— ${poem.author}\n\n#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura`;
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
