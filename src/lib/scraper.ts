import axios from 'axios'
import he from 'he'
import { ScrapedPoem } from '@/types/poem'

// Keep this for titles and authors
function cleanRawText(rawHtml: string): string {
  if (!rawHtml) return ''
  const text = rawHtml.replace(/<[^>]*>/g, '');
  const decoded = he.decode(text);
  return decoded.replace(/\s+/g, ' ').trim(); 
}

// Add intelligent line breaks to flat poetry text
function addIntelligentLineBreaks(flatText: string): string {
  if (!flatText) return '';
  
  // Clean up the text first
  let text = flatText.replace(/\s+/g, ' ').trim();
  
  // Spanish poetry line break patterns
  const lineBreakPatterns = [
    // Common Spanish poetry sentence endings that should start new lines
    { pattern: /(\w+[aeiouáéíóú][rn])\s+([A-ZÁÉÍÓÚÑ])/g, name: 'vowel-r/n + capital' },
    { pattern: /([.!?])\s+([A-ZÁÉÍÓÚÑ])/g, name: 'sentence end + capital' },
    { pattern: /(día|noche|luz|sol|luna|amor|corazón|alma|vida|muerte|tiempo|mano|ojos|agua|tierra|cielo|viento)\s+([A-ZÁÉÍÓÚÑ])/gi, name: 'poetry nouns + capital' },
    { pattern: /([,;:])\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[a-záéíóúñ]+)/g, name: 'punctuation + two words' },
  ];
  
  // Apply patterns to add line breaks
  lineBreakPatterns.forEach(({pattern, name}) => {
    text = text.replace(pattern, '$1\n$2');
  });
  
  // Handle conjunctions separately to preserve spaces
  const conjunctionPattern = /(\w+[aeiouáéíóú])\s+(como|que|cuando|donde|mientras|aunque|si|hasta|desde|para|por|con|sin|entre|sobre|bajo)\s/gi;
  text = text.replace(conjunctionPattern, '$1\n$2 ');  // Note the space after $2
  
  // Add stanza breaks (double line breaks) in strategic places
  const stanzaPatterns = [
    { pattern: /(\w+[.!?])\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[a-záéíóúñ]+\s+[a-záéíóúñ]+)/g, name: 'sentence end + 3 words' },
    { pattern: /(amor|muerte|tiempo|noche|día|corazón|alma)\s*[.!?]\s*([A-ZÁÉÍÓÚÑ])/gi, name: 'key words + sentence end' },
  ];
  
  stanzaPatterns.forEach(({pattern, name}) => {
    text = text.replace(pattern, '$1\n\n$2');
  });
  
  // Clean up multiple consecutive line breaks
  text = text
    .replace(/\n{3,}/g, '\n\n')  // Max 2 line breaks
    .replace(/\n\s+/g, '\n')     // Remove spaces after line breaks
    .trim();
  
  return text;
}

export async function scrapePoems(): Promise<ScrapedPoem[]> {
  try {
    const response = await axios.get('https://www.palabravirtual.com/index.php?ir=select_texto.php', {
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)' }
    });
    
    const poems: ScrapedPoem[] = [];
    const htmlContent = response.data;

    // Use intelligent line break detection
    const spanPattern = /<span[^>]*inline-block[^>]*>([\s\S]*?)<\/span>/gi;
    const excerpts: string[] = [];
    let spanMatch;
    while ((spanMatch = spanPattern.exec(htmlContent)) !== null) {
      const rawExcerpt = cleanRawText(spanMatch[1]); // Clean HTML first
      const structuredExcerpt = addIntelligentLineBreaks(rawExcerpt); // Then add line breaks
      
      if (structuredExcerpt.length > 20) { 
        excerpts.push(structuredExcerpt); 
      }
    }

    // Extract titles
    const titlePattern = /<a[^>]*class="Conta"[^>]*href="[^"]*ver_texto[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
    const titles: string[] = [];
    let titleMatch;
    while ((titleMatch = titlePattern.exec(htmlContent)) !== null) {
      const cleanedTitle = cleanRawText(titleMatch[1]);
      if (cleanedTitle.length > 1 && !cleanedTitle.includes('►')) { 
        titles.push(cleanedTitle); 
      }
    }

    // Extract authors
    const authorPattern = /<a[^>]*class="Conta"[^>]*href="[^"]*critzt[^"]*"[^>]*>\s*<b>\s*([^<]+)\s*<\/b><\/a>/gi;
    const authors: string[] = [];
    let authorMatch;
    while ((authorMatch = authorPattern.exec(htmlContent)) !== null) {
      const author = he.decode(authorMatch[1]).replace(/\s+/g, ' ').trim();
      if (author.length > 3) { 
        authors.push(author); 
      }
    }

    const poemCount = Math.min(excerpts.length, titles.length, authors.length);
    
    for (let i = 0; i < poemCount; i++) {
        poems.push({ 
          title: titles[i], 
          author: authors[i], 
          excerpt: excerpts[i]
        });
    }

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
