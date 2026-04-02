const fetch = require('node-fetch');

// RPR CMA via Firecrawl Interact
// Flow: Scrape RPR → Login → Search Address → Extract Property + Comps + Market Data

const FIRECRAWL_API = 'https://api.firecrawl.dev/v2';

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
  const RPR_EMAIL = process.env.RPR_EMAIL;
  const RPR_PASSWORD = process.env.RPR_PASSWORD;

  if (!FC_KEY || !RPR_EMAIL || !RPR_PASSWORD) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ error: 'RPR credentials or Firecrawl API key not configured', data: null }),
    };
  }

  let scrapeId = null;

  try {
    const { address } = JSON.parse(event.body);
    if (!address) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'No address provided', data: null }) };
    }

    console.log('[RPR-CMA] Starting for:', address);

    // ─── STEP 1: Scrape RPR login page with persistent profile ────────
    console.log('[RPR-CMA] Step 1: Scraping RPR with persistent profile...');
    const scrapeRes = await fetch(`${FIRECRAWL_API}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.narrpr.com',
        formats: ['markdown'],
        waitFor: 3000,
        profile: { name: 'rpr-session', saveChanges: true },
      }),
    });

    const scrapeData = await scrapeRes.json();
    if (!scrapeData.success) {
      console.error('[RPR-CMA] Scrape failed:', JSON.stringify(scrapeData));
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'Failed to load RPR', data: null }) };
    }

    scrapeId = scrapeData.data?.metadata?.scrapeId;
    if (!scrapeId) {
      console.error('[RPR-CMA] No scrapeId returned');
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'No scrapeId from RPR scrape', data: null }) };
    }

    console.log('[RPR-CMA] Got scrapeId:', scrapeId);

    // Check if already logged in (persistent profile may have saved session)
    const pageContent = scrapeData.data?.markdown || '';
    const isLoggedIn = pageContent.includes('My Markets') || pageContent.includes('Property Search') || pageContent.includes('Sign Out');

    // ─── STEP 2: Login if needed ──────────────────────────────────────
    if (!isLoggedIn) {
      console.log('[RPR-CMA] Step 2: Logging in to RPR...');
      const loginRes = await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Log in to RPR. Click "Sign In" or "Log In". Enter the email "${RPR_EMAIL}" in the email field and "${RPR_PASSWORD}" in the password field. Then click the sign in/submit button. Wait for the page to load after login.`,
          timeout: 30,
        }),
      });

      const loginData = await loginRes.json();
      console.log('[RPR-CMA] Login result:', loginData.success ? 'Success' : 'Failed');

      if (!loginData.success) {
        console.error('[RPR-CMA] Login failed:', JSON.stringify(loginData));
        // Try to continue anyway — the profile might still work
      }

      // Wait for dashboard to load
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('[RPR-CMA] Already logged in (persistent profile)');
    }

    // ─── STEP 3: Search for the property ──────────────────────────────
    console.log('[RPR-CMA] Step 3: Searching for property...');
    const searchRes = await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Search for the property at "${address}". Look for a search bar or location input field, type "${address}" and press Enter or click Search. Wait for the property results to load. If a property detail page appears, stay on it.`,
        timeout: 20,
      }),
    });

    const searchData = await searchRes.json();
    console.log('[RPR-CMA] Search result:', searchData.success ? 'Success' : 'Failed');

    // ─── STEP 4: Extract property details ─────────────────────────────
    console.log('[RPR-CMA] Step 4: Extracting property details...');
    const detailsRes = await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Extract ALL property information visible on this page. I need:
1. SUBJECT PROPERTY: address, list price or estimated value (RVM/AVM), beds, baths, sqft, year built, lot size, property type, tax assessed value
2. COMPARABLE SALES: Look for "Recently Sold", "Comparable Sales", "Nearby Sold" sections. For each comp, extract: full street address, sold price, sold date, beds, baths, sqft, distance from subject
3. MARKET DATA: median home price, average days on market, price trends, number of active listings
4. VALUATION: RPR's estimated value (RVM), Zestimate, or any automated valuation shown

Return ALL the data you can see on the page in a structured format.`,
        timeout: 30,
      }),
    });

    const detailsData = await detailsRes.json();
    console.log('[RPR-CMA] Details extraction:', detailsData.success ? 'Success' : 'Failed');

    // ─── STEP 5: Try to navigate to CMA/Comps section if available ────
    console.log('[RPR-CMA] Step 5: Looking for comparable sales...');
    const compsRes = await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Look for tabs or links labeled "Comps", "Comparable Sales", "Nearby Sold", "Recently Sold", "CMA", or "Valuation". Click on it if you find one. Then extract ALL comparable/sold properties with their full addresses, sold prices, sold dates, beds, baths, and square footage. Also look for any market statistics section and extract median price, days on market, and price trends.`,
        timeout: 30,
      }),
    });

    const compsData = await compsRes.json();
    console.log('[RPR-CMA] Comps extraction:', compsData.success ? 'Success' : 'Failed');

    // ─── STEP 6: Stop the interact session ────────────────────────────
    console.log('[RPR-CMA] Step 6: Stopping session...');
    try {
      await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${FC_KEY}` },
      });
    } catch (e) {
      console.log('[RPR-CMA] Session stop error (non-fatal):', e.message);
    }

    // ─── COMBINE ALL EXTRACTED DATA ───────────────────────────────────
    const allOutput = [
      detailsData?.output || '',
      compsData?.output || '',
      searchData?.output || '',
    ].join('\n\n');

    console.log('[RPR-CMA] Total output length:', allOutput.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          address,
          raw: allOutput,
          details: detailsData?.output || '',
          comps: compsData?.output || '',
          search: searchData?.output || '',
        },
      }),
    };

  } catch (error) {
    console.error('[RPR-CMA] Error:', error.message);

    // Try to clean up the session
    if (scrapeId) {
      try {
        await fetch(`${FIRECRAWL_API}/scrape/${scrapeId}/interact`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}` },
        });
      } catch (e) { /* ignore cleanup errors */ }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: 'RPR CMA failed: ' + error.message, data: null }),
    };
  }
};
