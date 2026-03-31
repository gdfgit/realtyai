// netlify/functions/firecrawl-search.js
// Server-side proxy for Firecrawl /v2/search API
// API key stored in Netlify env var: FIRECRAWL_API_KEY

const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const API_KEY = process.env.FIRECRAWL_API_KEY;
  if (!API_KEY) {
    console.error('FIRECRAWL_API_KEY not set in environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Firecrawl API key not configured', data: [] }),
    };
  }

  try {
    const { query, limit, scrapeOptions, lang, country } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing query', data: [] }),
      };
    }

    const requestBody = {
      query,
      limit: limit || 5,
      lang: lang || 'en',
      country: country || 'us',
    };

    // Only add scrapeOptions if explicitly requested
    // Default: NO scraping — just search results (fast, 2-3 seconds)
    // With scraping: slower (10-20 seconds) but gets full page content
    if (scrapeOptions) {
      requestBody.scrapeOptions = scrapeOptions;
    }

    console.log('[Firecrawl] Searching:', query, '| limit:', requestBody.limit, '| scrape:', !!scrapeOptions);

    // Set a timeout to avoid Netlify 504s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    const res = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Firecrawl] API error:', res.status, errText);
      return {
        statusCode: 200, // Return 200 so frontend doesn't crash
        headers,
        body: JSON.stringify({
          success: false,
          error: `Firecrawl API error: ${res.status}`,
          details: errText,
          data: [],
        }),
      };
    }

    const data = await res.json();
    console.log('[Firecrawl] Success — results:', (data.data || []).length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      console.error('[Firecrawl] Request timed out after 20s');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, error: 'Search timed out — try a simpler query', data: [] }),
      };
    }
    console.error('[Firecrawl] Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: 'Firecrawl search failed: ' + error.message, data: [] }),
    };
  }
};
