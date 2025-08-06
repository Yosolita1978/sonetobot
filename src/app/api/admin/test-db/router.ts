import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { getRandomPoem, insertPoems, fixNullUsedValues } from '@/lib/supabase'
import { scrapePoems } from '@/lib/scraper'
import { reformatAsSonnet } from '@/lib/mastodon'
import { NewPoem } from '@/types/poem'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.username !== process.env.AUTHORIZED_GITHUB_USERNAME) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }

    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'test_sonnet_format':
        // Get a fresh poem from scraper instead of database
        const freshPoems = await scrapePoems();
        if (!freshPoems || freshPoems.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'No poems found during fresh scraping for testing.' 
          }, { status: 404 });
        }
        
        const freshPoem = freshPoems[0]; // Get the first freshly scraped poem
        
        // Format complete Mastodon post with title, author, hashtags
        const mastodonPost = `«${freshPoem.title}»\n\n${freshPoem.excerpt}\n\n— ${freshPoem.author}\n\n#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura`;
        
        return NextResponse.json({
          success: true,
          original: freshPoem.excerpt,  // This should have line breaks from intelligent scraper
          formatted: mastodonPost       // Complete Mastodon post with title + author + hashtags
        });

      case 'scrape_and_save':
        const poems = await scrapePoems();
        if (!poems || poems.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'No poems found during scraping' 
          }, { status: 400 });
        }
        const newPoems: NewPoem[] = poems.map(p => ({ 
          ...p, 
          scraped_date: new Date().toISOString() 
        }));
        const savedCount = await insertPoems(newPoems);
        return NextResponse.json({ 
          success: true, 
          message: `Scraped ${poems.length} and saved ${savedCount} new poems.` 
        });

      case 'fix_null_used':
        const fixedCount = await fixNullUsedValues();
        return NextResponse.json({
          success: true,
          message: `Fixed ${fixedCount} poems with null 'used' values, setting them to false.`
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: `Unknown action: ${action}.` 
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'API POST Error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
