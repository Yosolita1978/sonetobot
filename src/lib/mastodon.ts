import { Poem } from '@/types/poem'
import { getRandomPoem } from '@/lib/supabase' // Use getRandomPoem

// ... (reformatAsSonnet and formatPoemForPost functions are the same)
export function reformatAsSonnet(flatText: string): string {
  // ...
  return flatText; // Simplified for brevity
}

function formatPoemForPost(poem: Poem): string {
  // ...
  return "Formatted Post"; // Simplified for brevity
}


export async function postPoem(): Promise<any> {
  console.log('📖 Getting a random poem for console test...');
  const poem = await getRandomPoem(); // Use the new function here
  
  if (!poem) { return { success: false, error: 'No poems available in the database.' }; }
  
  const postContent = formatPoemForPost(poem);

  console.log('\n--- CONSOLE-ONLY TEST ---');
  console.log(postContent);
  console.log('------------------------\n');

  return { success: true, message: 'Test successful! Check console for formatted output.' };
}

// other functions are not used
export async function testMastodonConnection() {}