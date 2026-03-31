// netlify/functions/cma-report.js
// Server-side proxy for Anthropic Claude API — generates CMA reports
// API key stored in Netlify env var: ANTHROPIC_API_KEY

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

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    console.error('ANTHROPIC_API_KEY not set in environment variables');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'Anthropic API key not configured', content: [] }),
    };
  }

  try {
    const { system, messages, max_tokens } = JSON.parse(event.body);

    if (!messages || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing messages', content: [] }),
      };
    }

    console.log('[CMA] Generating report...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 2000,
       system: system ? [{ type: "text", text: system }] : undefined,
        messages,
      }),
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error('[CMA] Anthropic API error:', res.status, errText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: `Claude API error: ${res.status}`, content: [] }),
      };
    }

    const data = await res.json();
    console.log('[CMA] Report generated successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[CMA] Request timed out');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: 'Report generation timed out. Try again.', content: [] }),
      };
    }
    console.error('[CMA] Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'CMA report failed: ' + error.message, content: [] }),
    };
  }
};
