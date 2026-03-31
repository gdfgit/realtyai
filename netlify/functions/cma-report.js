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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'Anthropic API key not configured', content: [] }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const systemText = body.system || '';
    const messages = body.messages || [];
    const maxTokens = body.max_tokens || 1000;

    if (!messages || messages.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: 'Missing messages', content: [] }),
      };
    }

    console.log('[CMA] Generating report...');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemText,
        messages: messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[CMA] Anthropic API error:', res.status, errText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ error: 'Claude API error: ' + res.status, content: [] }),
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
    console.error('[CMA] Function error:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'CMA report failed: ' + error.message, content: [] }),
    };
  }
};
