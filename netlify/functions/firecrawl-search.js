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
      body: JSON.stringify({ error: 'Firecrawl API key not configured', data: [] }),
    };
  }

  try {
    const { query, limit, scrapeOptions, lang, country } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing query', data: [] }),
      };
    }

    const requestBody = {
      query,
      limit: limit || 5,
      lang: lang || 'en',
      country: country || 'us',
    };

    // Add scrapeOptions if provided — this tells Firecrawl to also
    // scrape each search result page and return full markdown content
    if (scrapeOptions) {
      requestBody.scrapeOptions = scrapeOptions;
    }

    console.log('[Firecrawl] Searching:', query, '| limit:', requestBody.limit);

    const res = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Firecrawl] API error:', res.status, errText);
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({
          error: `Firecrawl API error: ${res.status}`,
          details: errText,
          data: [],
        }),
      };
    }

    const data = await res.json();
    console.log('[Firecrawl] Success — results:', (data.data || []).length);

    // Return the Firecrawl response directly
    // Shape: { success: true, data: [ { url, title, description, markdown, metadata, ... } ] }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[Firecrawl] Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Firecrawl search failed: ' + error.message, data: [] }),
    };
  }
};
