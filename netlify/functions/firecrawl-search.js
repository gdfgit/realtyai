const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'Firecrawl API key not configured', success: false }) };
  }

  try {
    const body = JSON.parse(event.body);

    // ─── MODE 1: Single page scrape (for RPR PDFs, etc.) ────────────
    if (body.scrapeUrl) {
      console.log('[Firecrawl] Scraping URL:', body.scrapeUrl);
      const scrapeBody = {
        url: body.scrapeUrl,
        formats: body.formats || ['markdown'],
        waitFor: body.waitFor || 5000,
      };
      if (body.parsers) scrapeBody.parsers = body.parsers;
      if (body.onlyMainContent !== undefined) scrapeBody.onlyMainContent = body.onlyMainContent;

      const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scrapeBody),
      });

      const data = await res.json();
      console.log('[Firecrawl] Scrape result:', data.success ? 'OK' : 'Failed', '| Content length:', (data.data?.markdown || '').length);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ─── MODE 2: Search (existing behavior) ─────────────────────────
    const { query, limit, scrapeOptions } = body;
    if (!query) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'No query provided', success: false }) };
    }

    console.log('[Firecrawl] Searching:', query, '| Limit:', limit || 5);

    const searchBody = {
      query,
      limit: limit || 5,
    };
    if (scrapeOptions) {
      searchBody.scrapeOptions = scrapeOptions;
    }

    const res = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody),
    });

    const data = await res.json();
    console.log('[Firecrawl] Search results:', data.success ? (data.data?.length || 0) : 'Failed');
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (error) {
    console.error('[Firecrawl] Error:', error.message);
    return { statusCode: 200, headers, body: JSON.stringify({ error: error.message, success: false }) };
  }
};
