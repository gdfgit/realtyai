const fetch = require('node-fetch');

// RPR CMA — Async approach using Firecrawl Agent
// Two modes:
// 1. action=start — kicks off Firecrawl agent to search RPR, returns job ID
// 2. action=status — polls for agent completion, returns data
// 3. action=fetch-pdf — fetches a known RPR PDF URL and returns parsed text

const FC_API = 'https://api.firecrawl.dev/v2';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const FC_KEY = process.env.FIRECRAWL_API_KEY;
  if (!FC_KEY) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'Firecrawl API key not configured' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const action = body.action || 'start';

    // ─── ACTION: START — Kick off Firecrawl Agent ─────────────────────
    if (action === 'start') {
      const address = body.address;
      if (!address) {
        return { statusCode: 200, headers, body: JSON.stringify({ error: 'No address provided' }) };
      }

      console.log('[RPR] Starting agent for:', address);

      // Use Firecrawl Agent to search RPR and extract CMA data
      const agentRes = await fetch(`${FC_API}/agent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Find comprehensive real estate CMA data for the property at "${address}". 
Search ONLY on Realtors Property Resource (narrpr.com) — this is a public real estate database with MLS-level data.
Go to https://www.narrpr.com and search for "${address}".
Extract from the RPR property page:
1. Subject property details: list price, RVM value (RPR's estimated value), CMA value, beds, baths, sqft, year built, lot size, property type, price per sqft
2. At least 5 recently SOLD comparable properties nearby: for each provide the full street address, sold price, sold date, beds, baths, sqft, price per sqft, and distance from subject
3. Active and pending listings nearby: for each provide address, list price, beds, baths, sqft, days on market
4. Market trends for the ZIP code: median sold price, median list price, average days on market, sold-to-list ratio, months of inventory, price trend
Extract real MLS data only. Do not make up data.`,
          schema: {
            type: 'object',
            properties: {
              subject: {
                type: 'object',
                properties: {
                  address: { type: 'string' },
                  list_price: { type: 'number' },
                  rvm_value: { type: 'number', description: 'RPR RVM estimated value' },
                  cma_value: { type: 'number', description: 'RPR CMA analysis value' },
                  beds: { type: 'number' },
                  baths: { type: 'number' },
                  sqft: { type: 'number' },
                  year_built: { type: 'number' },
                  lot_size: { type: 'string' },
                  property_type: { type: 'string' },
                  price_per_sqft: { type: 'number' },
                  tax_assessed_value: { type: 'number' },
                  annual_tax: { type: 'number' },
                },
              },
              sold_comps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: { type: 'string' },
                    sold_price: { type: 'number' },
                    sold_date: { type: 'string' },
                    beds: { type: 'number' },
                    baths: { type: 'number' },
                    sqft: { type: 'number' },
                    price_per_sqft: { type: 'number' },
                  },
                },
              },
              active_listings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: { type: 'string' },
                    asking_price: { type: 'number' },
                    beds: { type: 'number' },
                    baths: { type: 'number' },
                    sqft: { type: 'number' },
                  },
                },
              },
              market: {
                type: 'object',
                properties: {
                  median_sold_price: { type: 'number' },
                  median_list_price: { type: 'number' },
                  avg_days_on_market: { type: 'number' },
                  sold_to_list_ratio: { type: 'string' },
                  price_trend: { type: 'string' },
                  months_of_inventory: { type: 'number' },
                },
              },
            },
          },
        }),
      });

      const agentData = await agentRes.json();

      if (agentData.success && agentData.id) {
        console.log('[RPR] Agent started:', agentData.id);
        return {
          statusCode: 200, headers,
          body: JSON.stringify({ success: true, jobId: agentData.id, status: 'processing' }),
        };
      } else {
        console.error('[RPR] Agent start failed:', JSON.stringify(agentData).substring(0, 500));
        return {
          statusCode: 200, headers,
          body: JSON.stringify({ error: 'Failed to start RPR agent', details: agentData }),
        };
      }
    }

    // ─── ACTION: STATUS — Poll for agent completion ───────────────────
    if (action === 'status') {
      const jobId = body.jobId;
      if (!jobId) {
        return { statusCode: 200, headers, body: JSON.stringify({ error: 'No jobId provided' }) };
      }

      const statusRes = await fetch(`${FC_API}/agent/${jobId}`, {
        headers: { 'Authorization': `Bearer ${FC_KEY}` },
      });

      const statusData = await statusRes.json();
      console.log('[RPR] Agent status:', statusData.status);

      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          success: true,
          status: statusData.status,
          data: statusData.data || null,
          result: statusData.result || null,
        }),
      };
    }

    // ─── ACTION: FETCH-PDF — Fetch RPR PDF from public URL ────────────
    if (action === 'fetch-pdf') {
      const reportUrl = body.reportUrl;
      if (!reportUrl) {
        return { statusCode: 200, headers, body: JSON.stringify({ error: 'No reportUrl provided' }) };
      }

      console.log('[RPR] Fetching PDF:', reportUrl);

      const pdfRes = await fetch(reportUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      if (pdfRes.ok) {
        const text = await pdfRes.text();
        return {
          statusCode: 200, headers,
          body: JSON.stringify({ success: true, content: text.substring(0, 50000) }),
        };
      } else {
        return {
          statusCode: 200, headers,
          body: JSON.stringify({ error: 'PDF fetch failed: ' + pdfRes.status }),
        };
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) };

  } catch (error) {
    console.error('[RPR] Error:', error.message);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ error: 'RPR CMA failed: ' + error.message }),
    };
  }
};
