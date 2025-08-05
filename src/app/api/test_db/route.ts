import { NextResponse } from 'next/server'
import { getRandomPoem, insertPoems } from '@/lib/supabase' // Use getRandomPoem
import { scrapePoems } from '@/lib/scraper'
import { reformatAsSonnet } from '@/lib/mastodon'
import { NewPoem } from '@/types/poem'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'test_sonnet_format':
        console.log('🧪 Testing sonnet re-formatter on a random poem...');
        const poem = await getRandomPoem(); // Use the new function here
        if (!poem) {
          return NextResponse.json({ success: false, error: 'No poems in DB to test formatting.' }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            original: poem.excerpt,
            formatted: reformatAsSonnet(poem.excerpt)
        });

      case 'scrape_and_save':
        // ... (this part remains the same)
        const poems = await scrapePoems();
        if (!poems || poems.length === 0) {
          return NextResponse.json({ success: false, error: 'No poems found during scraping' }, { status: 400 });
        }
        const newPoems: NewPoem[] = poems.map(p => ({ ...p, scraped_date: new Date().toISOString() }));
        const savedCount = await insertPoems(newPoems);
        return NextResponse.json({ success: true, message: `Scraped ${poems.length} and saved ${savedCount} new poems.` });
        
      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}.` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'API POST Error: ' + (error instanceof Error ? error.message : 'Unknown error')}, { status: 500 });
  }
}