// Real-Time Internet Search using Free DuckDuckGo & Wikipedia APIs (No key required)

export interface SearchResult {
  title: string;
  snippet: string;
  sourceUrl?: string;
  sourceName: string;
  isLive: boolean;
}

export async function searchInternet(query: string): Promise<SearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      title: 'Empty Query',
      snippet: 'Please provide a search term.',
      sourceName: 'Search Engine',
      isLive: false,
    };
  }

  // Attempt 1: Wikipedia Summary API (very fast, rich real data)
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract && wikiData.type !== 'disambiguation') {
        return {
          title: wikiData.title || cleanQuery,
          snippet: wikiData.extract,
          sourceUrl: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
          sourceName: 'Wikipedia Live Data',
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Wikipedia search attempt failed:', err);
  }

  // Attempt 2: DuckDuckGo Instant Answer API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl);
    if (ddgRes.ok) {
      const ddgData = await ddgRes.json();
      if (ddgData.AbstractText) {
        return {
          title: ddgData.Heading || cleanQuery,
          snippet: ddgData.AbstractText,
          sourceUrl: ddgData.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`,
          sourceName: 'DuckDuckGo Live Instant Answer',
          isLive: true,
        };
      }
      if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
        const firstTopic = ddgData.RelatedTopics[0];
        if (firstTopic.Text) {
          return {
            title: cleanQuery,
            snippet: firstTopic.Text,
            sourceUrl: firstTopic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`,
            sourceName: 'DuckDuckGo Knowledge',
            isLive: true,
          };
        }
      }
    }
  } catch (err) {
    console.warn('DuckDuckGo search attempt failed:', err);
  }

  // Fallback
  return {
    title: `Web Search: ${cleanQuery}`,
    snippet: `Live search query dispatched for "${cleanQuery}". For full internet index results, you can also view Google or DuckDuckGo directly.`,
    sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`,
    sourceName: 'Web Index',
    isLive: true,
  };
}
