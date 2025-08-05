import axios from 'axios'
import he from 'he'
import { ScrapedPoem } from '@/types/poem'

function cleanRawText(rawHtml: string): string {
  if (!rawHtml) return ''
  // This function strips all HTML and collapses all whitespace into single spaces.
  const text = rawHtml.replace(/<[^>]*>/g, '');
  const decoded = he.decode(text);
  return decoded.replace(/\s+/g, ' ').trim(); 
}

export async function scrapePoems(): Promise<ScrapedPoem[]> {
  try {
    console.log('🔍 Fetching poems from palabravirtual.com...');
    
    const response = await axios.get('https://www.palabravirtual.com/index.php?ir=select_texto.php', {
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)' }
    });
    
    const poems: ScrapedPoem[] = [];
    const htmlContent = response.data;

    const spanPattern = /<span[^>]*inline-block[^>]*>([\s\S]*?)<\/span>/gi;
    const excerpts: string[] = [];
    let spanMatch;
    while ((spanMatch = spanPattern.exec(htmlContent)) !== null) {
      const cleanedExcerpt = cleanRawText(spanMatch[1]);
      if (cleanedExcerpt.length > 20) { excerpts.push(cleanedExcerpt); }
    }
    console.log(`📝 Found ${excerpts.length} valid excerpts`);

    const titlePattern = /<a[^>]*class="Conta"[^>]*href="[^"]*ver_texto[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
    const titles: string[] = [];
    let titleMatch;
    while ((titleMatch = titlePattern.exec(htmlContent)) !== null) {
      const cleanedTitle = cleanRawText(titleMatch[1]);
      if (cleanedTitle.length > 1 && !cleanedTitle.includes('►')) { titles.push(cleanedTitle); }
    }
    console.log(`📝 Found ${titles.length} valid titles`);

    const authorPattern = /<a[^>]*class="Conta"[^>]*href="[^"]*critzt[^"]*"[^>]*>\s*<b>\s*([^<]+)\s*<\/b><\/a>/gi;
    const authors: string[] = [];
    let authorMatch;
    while ((authorMatch = authorPattern.exec(htmlContent)) !== null) {
      const author = he.decode(authorMatch[1]).replace(/\s+/g, ' ').trim();
      if (author.length > 3) { authors.push(author); }
    }
    console.log(`📝 Found ${authors.length} valid authors`);

    const poemCount = Math.min(excerpts.length, titles.length, authors.length);
    console.log(`📝 Creating ${poemCount} poems`);
    
    for (let i = 0; i < poemCount; i++) {
        poems.push({ title: titles[i], author: authors[i], excerpt: excerpts[i] });
    }

    console.log(`📖 Total poems successfully extracted: ${poems.length}`);
    return poems;
    
  } catch (error: unknown) {
    console.error('❌ Scraping error:', error);
    return [];
  }
}

export async function testScraper() {
  try {
    const poems = await scrapePoems();
    return {
      success: poems.length > 0,
      poemsFound: poems.length,
      samplePoem: poems.length > 0 ? poems[0] : null
    }
  } catch (err) {
    return { success: false, poemsFound: 0 }
  }
}