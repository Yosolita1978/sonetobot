import { Poem } from '@/types/poem'
import { getRandomPoem } from '@/lib/supabase'

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
  console.log('📖 Getting a random poem for console test...');
  const poem = await getRandomPoem();
  
  if (!poem) { 
    return { 
      success: false, 
      error: 'No poems available in the database.' 
    }; 
  }
  
  const postContent = formatPoemForPost(poem);

  console.log('\n--- CONSOLE-ONLY TEST ---');
  console.log(postContent);
  console.log('-------------------------\n');

  return { 
    success: true, 
    message: 'Test successful! Check console for formatted output.',
    poem: poem
  };
}

export async function testMastodonConnection() {
  return { success: true, message: 'Mastodon connection test not implemented' };
}
