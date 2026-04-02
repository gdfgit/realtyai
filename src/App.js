import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG & CONSTANTS ───────────────────────────────────────────────
const SUPABASE_URL = "https://guqytcsovjqmbomyacyd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RBY52Obs_adPGMsKM3bMjA_ifz6WF2H";
const EMAILJS_SERVICE_ID = "service_rh6uozl";
const EMAILJS_TEMPLATE_ID = "template_b6xnvkj";
const EMAILJS_PUBLIC_KEY = "xElMdZFRvZqh8-bIw";

// *** FIRECRAWL: API key moved server-side to Netlify env var FIRECRAWL_API_KEY ***

// ─── STYLES ───────────────────────────────────────────────────────────
const theme = {
  red: "#E31837",
  redDark: "#B71230",
  redLight: "#FF3050",
  white: "#FFFFFF",
  offWhite: "#F8F5F2",
  grey: "#6B7280",
  greyLight: "#E5E7EB",
  dark: "#1A1A1A",
  shadow: "0 4px 24px rgba(227,24,55,0.10)",
  shadowHover: "0 8px 32px rgba(227,24,55,0.18)",
  radius: "14px",
  radiusSm: "10px",
  font: "'DM Sans', 'Segoe UI', sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
  // *** SIDEBAR: Dark sidebar colors ***
  sidebarBg: "#1a1a2e",
  sidebarBorder: "rgba(255,255,255,0.06)",
  sidebarText: "rgba(255,255,255,0.8)",
  sidebarTextMuted: "rgba(255,255,255,0.35)",
  sidebarTextDim: "rgba(255,255,255,0.25)",
  sidebarCardBg: "rgba(255,255,255,0.05)",
  sidebarCardBorder: "rgba(255,255,255,0.07)",
};

// ─── ICONS (inline SVGs) ─────────────────────────────────────────────
const Icons = {
  send: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3.4 20.4l18.6-8.4L3.4 3.6v6.6l12 1.8-12 1.8v6.6z" fill="currentColor"/></svg>
  ),
  mic: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 19v4m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  micActive: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="#E31837" stroke="#E31837" strokeWidth="2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/><path d="M12 19v4m-4 0h8" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  plus: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
  ),
  home: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  eye: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  eyeOff: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  check: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  bot: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><path d="M12 4v4M8 4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  user: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  spinner: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="10" stroke="#E31837" strokeWidth="3" strokeDasharray="50 20" strokeLinecap="round"/></svg>
  ),
  logout: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  file: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
  ),
  // *** SIDEBAR: Agent SVG icons (red stroke, no emojis) ***
  agentSell: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#E31837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#E31837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  agentOffer: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#E31837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#E31837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  agentApproved: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#E31837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  agentLive: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#E31837" strokeWidth="2"/><path d="M8 21h8M12 17v4" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="10" r="2" fill="#E31837"/></svg>
  ),
  // *** SIDEBAR: Hamburger menu icon for mobile ***
  menu: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  // *** SIDEBAR: Dropdown chevron ***
  chevronDown: (
    <svg width="12" height="12" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  // *** SIDEBAR: Account menu icons ***
  editProfile: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
  ),
  subscription: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M1 10h22" stroke="currentColor" strokeWidth="1.5"/></svg>
  ),
  searchHistory: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  settings: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
  ),
  plusSmall: (
    <svg width="10" height="10" fill="none" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  // *** VOICE MODE: Icons ***
  voiceOn: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="#E31837" stroke="#E31837" strokeWidth="1.5"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/><path d="M12 19v4m-4 0h8" stroke="#E31837" strokeWidth="2" strokeLinecap="round"/><circle cx="19" cy="5" r="4" fill="#4CAF50"/><path d="M17.5 5l1 1 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  voiceOff: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 19v4m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  stopSpeaking: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>
  ),
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${theme.font}; background: ${theme.offWhite}; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  @keyframes slideIn { from { opacity:0; transform: translateX(-20px); } to { opacity:1; transform: translateX(0); } }
  @keyframes dotBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px white inset !important; }
  /* *** SIDEBAR: Mobile overlay *** */
  @media (max-width: 768px) {
    .sidebar-overlay { display: block !important; }
    .sidebar-panel { position: fixed !important; left: -280px; z-index: 10000 !important; transition: left 0.3s ease !important; }
    .sidebar-panel.open { left: 0 !important; }
  }
  @media (min-width: 769px) {
    .sidebar-overlay { display: none !important; }
    .sidebar-panel { position: relative !important; left: 0 !important; }
    .mobile-menu-btn { display: none !important; }
  }
`;

// ─── DEMO MODE ────────────────────────────────────────────────────────
const DEMO_MODE = false;

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────
async function supabaseRequest(path, options = {}) {
  if (DEMO_MODE) return { data: null, error: null };
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  return { data, error: res.ok ? null : data };
}

// ─── EMAIL VERIFICATION ───────────────────────────────────────────────
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
  if (DEMO_MODE) return { status: 200 };
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: { email, verification_code: code, to_name: email.split("@")[0] },
    }),
  });
  return res;
}

// ─── FIRECRAWL SEARCH ───────────────────────────────
async function firecrawlSearch(query, options = {}) {
  if (DEMO_MODE) {
    return generateDemoResults(query);
  }
  try {
    const requestBody = {
      query,
      limit: options.limit || 5,
    };

    // Only include scrapeOptions if explicitly passed
    // Without scrapeOptions: fast search (2-3 sec), returns title + url + description
    // With scrapeOptions: slower (10-20 sec), returns full page markdown
    if (options.scrapeOptions) {
      requestBody.scrapeOptions = options.scrapeOptions;
    }

    const res = await fetch("/.netlify/functions/firecrawl-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) {
      console.error("[Firecrawl] API error:", res.status, res.statusText);
      return { results: [], images: [], error: `API error: ${res.status}` };
    }
    const data = await res.json();
    if (data.error || data.success === false) {
      console.error("[Firecrawl] Error response:", data.error);
      return { results: [], images: [], error: data.error };
    }
    // Normalize Firecrawl response to match the shape our app expects:
    // Firecrawl returns: { success, data: [{ url, title, description, markdown? }] }
    // Our app expects: { results: [{ url, title, content }], images: [] }
   const fcResults = (data.data && data.data.web) ? data.data.web : (Array.isArray(data.data) ? data.data : []);
    const results = fcResults.map(r => ({
      url: r.url || "",
      title: r.title || "",
      // Use markdown if available (when scrapeOptions was used), otherwise description
      content: r.markdown || r.description || "",
      // Include JSON extraction data if available
      json: r.json || null,
    }));
    // Extract image URLs from markdown content (only present if scrapeOptions was used)
    const images = [];
    fcResults.forEach(r => {
      const text = r.markdown || "";
      if (text) {
        // Find markdown image references: ![alt](url)
        const imgMatches = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g) || [];
        imgMatches.forEach(m => {
          const urlMatch = m.match(/\((https?:\/\/[^\s)]+)\)/);
          if (urlMatch && urlMatch[1]) {
            const imgUrl = urlMatch[1];
            if (imgUrl.match(/\.(jpg|jpeg|png|webp)/i) &&
                !imgUrl.includes('logo') && !imgUrl.includes('icon') &&
                !imgUrl.includes('favicon') && !imgUrl.includes('avatar') &&
                !imgUrl.includes('sprite') && images.length < 6) {
              images.push(imgUrl);
            }
          }
        });
        // Also look for HTML img src attributes in markdown
        const htmlImgMatches = text.match(/src=["'](https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*)["']/gi) || [];
        htmlImgMatches.forEach(m => {
          const urlMatch = m.match(/src=["'](https?:\/\/[^"'\s]+)["']/i);
          if (urlMatch && urlMatch[1] && images.length < 6) {
            const imgUrl = urlMatch[1];
            if (!imgUrl.includes('logo') && !imgUrl.includes('icon') &&
                !imgUrl.includes('favicon') && !images.includes(imgUrl)) {
              images.push(imgUrl);
            }
          }
        });
      }
    });
    console.log("[Firecrawl] Results:", results.length, "| Images found:", images.length);
    return { results, images };
  } catch (e) {
    console.error("[Firecrawl] Fetch failed:", e);
    return { results: [], images: [], error: e.message };
  }
}

// ─── FETCH DAILY MORTGAGE RATE ────────────────────────────────────────
async function fetchMortgageRate() {
  try {
   const res = await firecrawlSearch("today's 30 year fixed mortgage rate MND daily mortgage rate index", {
      limit: 3,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    });
    const allContent = (res.results || []).map(r => r.content).join(" ");
    const rateMatch = allContent.match(/(?:30[- ]?year[- ]?fixed|30[- ]?yr)[^]*?(\d\.\d{1,2})%/i)
      || allContent.match(/(\d\.\d{1,2})%[^]*?(?:30[- ]?year|30[- ]?yr|fixed)/i)
      || allContent.match(/(?:average|current|today)[^]*?(\d\.\d{1,2})%/i);
    if (rateMatch) return parseFloat(rateMatch[1]);
    const anyRate = allContent.match(/(\d\.\d{1,2})%/);
    if (anyRate) {
      const r = parseFloat(anyRate[1]);
      if (r > 3 && r < 12) return r;
    }
  } catch (e) {
    console.log("Could not fetch mortgage rate, using fallback");
  }
  return 6.75;
}

// ─── DETECT IF QUERY IS A SPECIFIC ADDRESS ────────────────────────────
function isSpecificAddress(query) {
  return /^\d+\s+[A-Za-z]/i.test(query.trim()) &&
    /\b(st|street|ave|avenue|blvd|boulevard|dr|drive|ln|lane|rd|road|ct|court|way|pl|place|cir|circle|pkwy|parkway)\b/i.test(query);
}

function generateDemoResults(query) {
  const q = query.toLowerCase();
  const isCommercial = q.includes("commercial") || q.includes("lease") || q.includes("restaurant") || q.includes("office") || q.includes("retail");
  const isNewConstruction = q.includes("new home") || q.includes("new construction");

  if (isNewConstruction) {
    return {
      results: [
        { title: "New Construction Homes", url: "https://www.showingnew.com/nationrealtor", content: "Browse new construction homes available in your area." },
      ],
      images: [],
    };
  }

  if (isCommercial) {
    return {
      results: [
        { title: "Restaurant Space for Lease - Downtown", url: "https://www.loopnet.com/listing/example1", content: "2,500 sq ft restaurant space, fully equipped kitchen, high foot traffic area. $4,500/mo NNN." },
        { title: "Retail Storefront - Main Street", url: "https://www.crexi.com/listing/example2", content: "1,800 sq ft retail space on Main St. Great visibility. $3,200/mo." },
        { title: "Business for Sale - Italian Restaurant", url: "https://www.bizbuysell.com/listing/example3", content: "Established Italian restaurant, 15 years in business. Revenue $850K/year. Asking $275,000." },
      ],
      images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"],
    };
  }

  return {
    results: [
      { title: "4 Bed, 3 Bath Home - 123 Oak Lane, San Diego, CA 92101", url: "https://www.zillow.com/homedetails/example1", content: "Beautiful 4 bedroom, 3 bathroom home with 2,450 sq ft. Updated kitchen with granite countertops, hardwood floors throughout. Large backyard with pool. Listed at $875,000." },
      { title: "3 Bed, 2 Bath Condo - 456 Palm Ave, San Diego, CA 92102", url: "https://www.realtor.com/realestateandhomes-detail/example2", content: "Modern 3 bedroom, 2 bath condo in the heart of downtown. 1,650 sq ft with panoramic city views. In-unit laundry, secure parking. $625,000." },
      { title: "5 Bed, 4 Bath Estate - 789 Vista Dr, San Diego, CA 92103", url: "https://www.redfin.com/CA/San-Diego/example3", content: "Stunning 5 bedroom estate on a hill with ocean views. 3,800 sq ft, gourmet kitchen, home theater, 3-car garage. $1,450,000." },
      { title: "2 Bed, 2 Bath Townhome - 321 Elm St, San Diego, CA 92104", url: "https://www.homes.com/property/example4", content: "Charming townhome with 1,200 sq ft. Open floor plan, private patio, community pool. Walking distance to shops and restaurants. $485,000." },
    ],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    ],
  };
}

// ─── MORTGAGE CALCULATOR (accurate P&I, extracted taxes & HOA) ────────
function calculateMortgage(price, rate, downPct, monthlyTax, hoaAmount) {
  const downPayment = price * (downPct / 100);
  const loanAmount = price - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numPayments = 30 * 12;
  // Standard amortization formula — exact P&I payment
  const monthlyPI = monthlyRate > 0
    ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;
  const hoa = hoaAmount || 0;
  const tax = monthlyTax || 0;
  return {
    downPayment: Math.round(downPayment),
    monthlyPI: Math.round(monthlyPI),
    taxes: Math.round(tax),
    hoa,
    total: Math.round(monthlyPI + tax + hoa),
    loanAmount: Math.round(loanAmount),
  };
}

// ─── EXTRACT PROPERTY TAX FROM CONTENT ────────────────────────────────
// Priority: 1) Extract actual annual tax from listing page, 2) Fall back to state average rate
function extractPropertyTax(content, price, address) {
  // Try to extract actual annual tax amount from listing content
  if (content) {
    // Zillow/Redfin patterns: "Property Tax: $5,234", "Annual tax: $5,234", "Tax assessed: $5,234"
    const taxMatch = content.match(/(?:property\s*tax|annual\s*tax|tax\s*(?:assessed|amount|paid|history))\s*[:.]?\s*\$\s*([\d,]+)/i)
      || content.match(/\$\s*([\d,]+)\s*(?:\/?\s*(?:yr|year|annually))\s*(?:tax|property)/i)
      || content.match(/(?:tax|taxes)\s*[:.]?\s*\$\s*([\d,]+)\s*(?:\/?\s*(?:yr|year|annually))/i)
      || content.match(/(?:property\s*tax|tax\s*amount)\s*\$\s*([\d,]+)/i);
    if (taxMatch) {
      const annualTax = parseInt(taxMatch[1].replace(/,/g, ''));
      // Sanity check: tax should be between $500 and $100,000/year
      if (annualTax >= 500 && annualTax <= 100000) {
        return { monthlyTax: Math.round(annualTax / 12), annualTax, source: 'listing' };
      }
    }
  }

  // Fallback: use state average effective tax rate
  const stateRates = {
    'AL': 0.0040, 'AK': 0.0119, 'AZ': 0.0062, 'AR': 0.0062, 'CA': 0.0071,
    'CO': 0.0051, 'CT': 0.0198, 'DE': 0.0057, 'FL': 0.0089, 'GA': 0.0092,
    'HI': 0.0028, 'ID': 0.0063, 'IL': 0.0197, 'IN': 0.0085, 'IA': 0.0157,
    'KS': 0.0141, 'KY': 0.0086, 'LA': 0.0055, 'ME': 0.0136, 'MD': 0.0109,
    'MA': 0.0123, 'MI': 0.0154, 'MN': 0.0110, 'MS': 0.0080, 'MO': 0.0097,
    'MT': 0.0074, 'NE': 0.0173, 'NV': 0.0060, 'NH': 0.0186, 'NJ': 0.0240,
    'NM': 0.0080, 'NY': 0.0172, 'NC': 0.0080, 'ND': 0.0098, 'OH': 0.0157,
    'OK': 0.0090, 'OR': 0.0097, 'PA': 0.0153, 'RI': 0.0163, 'SC': 0.0057,
    'SD': 0.0128, 'TN': 0.0067, 'TX': 0.0168, 'UT': 0.0058, 'VT': 0.0190,
    'VA': 0.0082, 'WA': 0.0098, 'WV': 0.0058, 'WI': 0.0176, 'WY': 0.0057,
    'DC': 0.0056,
  };
  const stateMatch = (address || "").match(/\b([A-Z]{2})\s*\d{5}\b/)
    || (address || "").match(/,\s*([A-Z]{2})\s*$/i)
    || (address || "").match(/,\s*([A-Z]{2})\b/i);
  let taxRate = 0.0110; // national average fallback
  let stateName = "";
  if (stateMatch) {
    stateName = stateMatch[1].toUpperCase();
    if (stateRates[stateName]) taxRate = stateRates[stateName];
  }
  const annualTax = Math.round(price * taxRate);
  return { monthlyTax: Math.round(annualTax / 12), annualTax, taxRate, stateName, source: 'estimated' };
}

// ─── EXTRACT HOA FROM CONTENT ─────────────────────────────────────────
function extractHOA(content) {
  if (!content) return null;
  const hoaMatch = content.match(/HOA\s*(?:fee|dues?)?\s*[:.]?\s*\$\s*([\d,]+)/i)
    || content.match(/\$([\d,]+)\s*\/?\s*(?:mo|month)\s*HOA/i)
    || content.match(/HOA\s*[:.]?\s*\$([\d,]+)\s*(?:\/?\s*(?:mo|month))?/i)
    || content.match(/homeowners?\s*association\s*[:.]?\s*\$([\d,]+)/i);
  if (hoaMatch) {
    const amount = parseInt(hoaMatch[1].replace(/,/g, ''));
    if (amount > 0 && amount < 5000) return amount;
  }
  if (content.match(/no\s*HOA/i) || content.match(/HOA\s*[:.]?\s*(?:none|n\/a|\$0)/i)) {
    return 0;
  }
  return null; // unknown
}

// ─── TYPING ANIMATION ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "12px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: theme.red,
          animation: `dotBounce 1.4s infinite ease-in-out both`,
          animationDelay: `${i * 0.16}s`,
        }} />
      ))}
    </div>
  );
}

// ─── REGISTRATION COMPONENT ──────────────────────────────────────────
function RegistrationScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentCode, setSentCode] = useState("");

  const handleRegister = async () => {
    if (!firstName || !lastName || !phone || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    const fullName = `${firstName} ${lastName}`;
    setLoading(true); setError("");
    if (DEMO_MODE) {
      const demoCode = generateCode();
      setSentCode(demoCode);
      setMode("verify");
      setLoading(false);
      return;
    }
    try {
      const { error: dbErr } = await supabaseRequest("/users?email=eq." + encodeURIComponent(email), { method: "GET" });
      const vCode = generateCode();
      setSentCode(vCode);
      await supabaseRequest("/users", {
        method: "POST",
        body: JSON.stringify({ email, password, name: fullName, phone, verification_code: vCode, verified: false }),
      });
      await sendVerificationEmail(email, vCode);
      setMode("verify");
    } catch (e) { setError("Registration failed. Try again."); }
    setLoading(false);
  };

  const handleVerify = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (DEMO_MODE) {
      if (code === sentCode) { onLogin({ email, name: fullName }); }
      else { setError("Invalid code. Try again."); }
      return;
    }
    setLoading(true); setError("");
    try {
      const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(email)}&verification_code=eq.${code}`, { method: "GET" });
      if (data && data.length > 0) {
        await supabaseRequest(`/users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ verified: true }) });
        onLogin({ email, name: data[0].name || fullName });
      } else { setError("Invalid verification code."); }
    } catch { setError("Verification failed."); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    if (DEMO_MODE) {
      onLogin({ email, name: email.split("@")[0] });
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`, { method: "GET" });
      if (data && data.length > 0 && data[0].verified) {
        onLogin({ email, name: data[0].name });
      } else { setError("Invalid credentials or unverified account."); }
    } catch { setError("Login failed."); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", border: `2px solid ${theme.greyLight}`, borderRadius: theme.radiusSm,
    fontSize: 15, fontFamily: theme.font, outline: "none", transition: "border-color 0.2s",
    background: theme.white,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${theme.offWhite} 0%, #fff 50%, ${theme.offWhite} 100%)`,
      padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 440, background: theme.white, borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)", padding: "48px 36px",
        animation: "fadeUp 0.5s ease-out",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Realty AI" style={{
            width: 100, height: 100, borderRadius: 20,
            boxShadow: "0 8px 24px rgba(227,24,55,0.25)", marginBottom: 16,
          }} />
          <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 700, color: theme.dark, marginBottom: 4 }}>
            Realty AI
          </h1>
          <p style={{ color: theme.grey, fontSize: 14 }}>
            {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Verify your email"}
          </p>
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: theme.radiusSm,
            padding: "10px 14px", marginBottom: 16, color: "#B91C1C", fontSize: 13,
          }}>{error}</div>
        )}

        {mode === "verify" ? (
          <>
            <p style={{ color: theme.grey, fontSize: 14, marginBottom: 8, textAlign: "center" }}>
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            {DEMO_MODE && (
              <p style={{ color: theme.red, fontSize: 13, marginBottom: 16, textAlign: "center", background: "#FEF2F2", padding: 8, borderRadius: 8 }}>
                Demo Mode — Your code is: <strong>{sentCode}</strong>
              </p>
            )}
            <input
              style={{ ...inputStyle, textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: 600 }}
              placeholder="000000" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onFocus={(e) => e.target.style.borderColor = theme.red}
              onBlur={(e) => e.target.style.borderColor = theme.greyLight}
            />
            <button onClick={handleVerify} disabled={loading} style={{
              width: "100%", padding: 16, background: theme.red, color: theme.white,
              border: "none", borderRadius: theme.radiusSm, fontSize: 16, fontWeight: 600,
              fontFamily: theme.font, cursor: "pointer", marginTop: 20,
              boxShadow: "0 4px 16px rgba(227,24,55,0.3)", transition: "all 0.2s",
            }}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </>
        ) : (
          <>
            {mode === "register" && (
              <>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>First Name</label>
                  <input style={inputStyle} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = theme.red}
                    onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Last Name</label>
                  <input style={inputStyle} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = theme.red}
                    onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Phone Number</label>
                <input style={inputStyle} type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = theme.red}
                  onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
              </div>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && mode === "login") handleLogin(); }}
                onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { mode === "login" ? handleLogin() : handleRegister(); } }}
                  onFocus={(e) => e.target.style.borderColor = theme.red}
                  onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: theme.grey,
                }}>{showPass ? Icons.eyeOff : Icons.eye}</button>
              </div>
            </div>
            <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{
              width: "100%", padding: 16, background: theme.red, color: theme.white,
              border: "none", borderRadius: theme.radiusSm, fontSize: 16, fontWeight: 600,
              fontFamily: theme.font, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(227,24,55,0.3)", transition: "all 0.2s",
            }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: theme.grey }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                style={{ background: "none", border: "none", color: theme.red, fontWeight: 600, cursor: "pointer", fontFamily: theme.font, fontSize: 14 }}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CHAT MESSAGE COMPONENT ──────────────────────────────────────────
function ChatMessage({ msg, index, profilePhoto, userInitials }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex", gap: 12, maxWidth: 820, margin: "0 auto",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeUp 0.35s ease-out", animationDelay: `${index * 0.05}s`,
      animationFillMode: "backwards", padding: "4px 0",
    }}>
      {/* Avatar: logo for AI, photo/initials for user */}
      {isUser ? (
        profilePhoto ? (
          <img src={profilePhoto} alt="" style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0, objectFit: "cover",
          }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: theme.dark,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme.white, fontSize: 13, fontWeight: 700,
          }}>{userInitials || Icons.user}</div>
        )
      ) : (
        <img src="/logo.png" alt="Realty AI" style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          boxShadow: "0 3px 12px rgba(227,24,55,0.2)",
        }} />
      )}
      <div style={{
        background: isUser ? theme.dark : theme.white,
        color: isUser ? theme.white : theme.dark,
        padding: "14px 18px", borderRadius: 16,
        borderTopRightRadius: isUser ? 4 : 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        maxWidth: "80%", fontSize: 14.5, lineHeight: 1.65,
        boxShadow: isUser ? "none" : theme.shadow,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.type === "rich" ? <RichContent content={msg.content} /> : msg.content}
        {msg.attachments && msg.attachments.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {msg.attachments.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)",
                padding: "4px 10px", borderRadius: 8, fontSize: 12,
              }}>
                {Icons.file} {a.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RICH CONTENT RENDERER ───────────────────────────────────────────
function RichContent({ content }) {
  if (typeof content === "string") {
    return <div dangerouslySetInnerHTML={{ __html: formatText(content) }} />;
  }
  return content;
}

function formatText(text) {
  let html = text;

  const lines = html.split('\n');
  let inTable = false;
  let tableHTML = '';
  let headerDone = false;
  const processed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        headerDone = false;
        tableHTML = '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0;"><table style="width:100%;min-width:320px;border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;">';
      }
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        headerDone = true;
        continue;
      }
      const cells = line.split('|').filter(c => c.trim() !== '');
      if (!headerDone) {
        tableHTML += '<tr>';
        cells.forEach(c => {
          tableHTML += `<th style="background:#E31837;color:#fff;padding:10px 12px;text-align:left;font-weight:600;border:1px solid #c41230;">${c.trim().replace(/\*\*/g,'')}</th>`;
        });
        tableHTML += '</tr>';
      } else {
        tableHTML += '<tr>';
        cells.forEach((c, ci) => {
          const val = c.trim().replace(/\*\*/g,'');
          const bg = ci === 0 ? 'background:#FEF2F2;font-weight:600;' : '';
          tableHTML += `<td style="padding:8px 12px;border:1px solid #E5E7EB;${bg}">${val}</td>`;
        });
        tableHTML += '</tr>';
      }
    } else {
      if (inTable) {
        tableHTML += '</table></div>';
        processed.push(tableHTML);
        inTable = false;
        tableHTML = '';
        headerDone = false;
      }
      processed.push(line);
    }
  }
  if (inTable) {
    tableHTML += '</table></div>';
    processed.push(tableHTML);
  }

  html = processed.join('\n');

  html = html.replace(/\{\{IMG:(.*?)\}\}/g, '<img src="$1" style="width:100%;max-width:280px;height:180px;object-fit:cover;border-radius:10px;margin:4px;" onerror="this.style.display=\'none\'" />');
  html = html.replace(/━+/g, '<hr style="border:none;border-top:2px solid #E5E7EB;margin:12px 0;"/>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#E31837;text-decoration:underline;font-weight:500">$1</a>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

// ─── CLEAN CONTENT ─────────────────────────────────────────────
function cleanContent(rawContent) {
  if (!rawContent) return "";
  let text = rawContent;
  text = text.replace(/#{1,4}\s*[A-Za-z\s&]+\n?/g, '');
  text = text.replace(/\$[\d,]+\/sq\s*ft\s*/g, '');
  text = text.replace(/All mortgage lending products[\s\S]*?(?=\n\n|\Z)/gi, '');
  text = text.replace(/Redfin Corporation[\s\S]*?(?=\n\n|\Z)/gi, '');
  text = text.replace(/If you are using a screen reader[\s\S]*?(?=\n\n|\Z)/gi, '');
  text = text.replace(/This site is not authorized[\s\S]*?(?=\n\n|\Z)/gi, '');
  text = text.replace(/NMLS\s*#\d+[^.]*\./gi, '');
  text = text.replace(/Licensed in \d+ states\.[^.]*\./gi, '');
  text = text.replace(/\|\s*\|/g, '');
  text = text.replace(/\|\s*\d+\s+\$[\d,]+\s+\d+\s+bed.*?\|/g, '');
  text = text.replace(/Show more\s*\.{0,3}/gi, '');
  text = text.replace(/View estimated energy.*$/gim, '');
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  const sentences = text.split(/\.\s+/);
  let cleaned = "";
  for (const s of sentences) {
    if (cleaned.length > 300) break;
    if (s.trim().length > 10) cleaned += s.trim() + ". ";
  }
  return cleaned.trim() || text.substring(0, 300).trim();
}

// ─── EXTRACT LOCATION FROM QUERY ──────────────────────────────────────
function extractLocationFromQuery(query) {
  const cityState = query.match(/(?:in|near|around)\s+([A-Za-z\s]+(?:,\s*[A-Z]{2})?)/i);
  if (cityState) return cityState[1].trim();
  const zip = query.match(/\b\d{5}\b/);
  if (zip) return zip[0];
  return "";
}

// ─── PROCESS SEARCH RESULTS ──────────────────────────────────────────
function buildPropertyResponse(query, searchResults, mortgageRate, isAddressSearch) {
  const q = query.toLowerCase();
  const isCommercial = q.includes("commercial") || q.includes("lease") || q.includes("restaurant") || q.includes("office") || q.includes("retail") || q.includes("business");
  const isNewConstruction = q.includes("new home") || q.includes("new construction");
  const results = searchResults.results || [];
  const images = searchResults.images || [];
  const rate = mortgageRate || 6.75;

  const exactAddress = isAddressSearch ? query.trim() : "";
  const location = isAddressSearch ? exactAddress : extractLocationFromQuery(query);
  const mapAddress = exactAddress || location || extractAddress(results[0]?.title || "") || "property location";
  const encodedAddr = encodeURIComponent(mapAddress);

  let output = "";

  if (isNewConstruction) {
    output += `🏗️ **New Construction Homes**\n\n`;
    output += `Browse new construction homes here:\n[ShowingNew - New Homes](https://www.showingnew.com/nationrealtor)\n\n`;
    if (results.length > 0) {
      results.forEach((r) => {
        output += `**${r.title}**\n[View Listing](${r.url})\n\n`;
      });
    }
    return output;
  }

if (isAddressSearch) {
    output += `🏠 **Property Details**\n\n`;
    output += `**${exactAddress}**\n\n`;

    // Extract property details from content
    const allContent = results.map(r => r.content || "").join(" ") + " " + results.map(r => r.title || "").join(" ");
    const price = extractPrice(allContent) || 500000;
    const sqft = extractSqft(allContent) || 2000;
    const bedsMatch = allContent.match(/(\d+)\s*(?:beds?|bedrooms?|br)\b/i);
    const bathsMatch = allContent.match(/([\d.]+)\s*(?:baths?|bathrooms?|ba)\b/i);
    const yearMatch = allContent.match(/(?:built\s*(?:in\s*)?|year\s*built\s*[:.]?\s*)(\d{4})/i);
    const lotMatch = allContent.match(/([\d,.]+)\s*(?:acre|sq\s*ft\s*lot|lot\s*size)/i);
    const typeMatch = allContent.match(/\b(single\s*family|condo|townhouse|townhome|multi\s*family|duplex|triplex|manufactured)\b/i);

    const beds = bedsMatch ? bedsMatch[1] : null;
    const baths = bathsMatch ? bathsMatch[1] : null;
    const yearBuilt = yearMatch ? yearMatch[1] : null;
    const lotSize = lotMatch ? lotMatch[1] : null;
    const propType = typeMatch ? typeMatch[1] : null;

    // Show property summary
    output += `💰 **Price: $${price.toLocaleString()}**\n\n`;
    let details = [];
    if (beds) details.push(`🛏️ ${beds} Beds`);
    if (baths) details.push(`🛁 ${baths} Baths`);
    if (sqft) details.push(`📐 ${sqft.toLocaleString()} sqft`);
    if (yearBuilt) details.push(`📅 Built ${yearBuilt}`);
    if (propType) details.push(`🏠 ${propType}`);
    if (lotSize) details.push(`🌳 ${lotSize} acres lot`);
    if (details.length > 0) output += details.join("  ·  ") + `\n\n`;

    if (images.length > 0) {
      output += `📸 **Property Photos**\n\n`;
      images.forEach((img) => { output += `{{IMG:${img}}}\n`; });
      output += `\n`;
    }
    const reSites = results.filter(r => r.url.match(/zillow|realtor\.com|redfin|homes\.com/i));
    const bestResult = reSites[0] || results[0];
    if (bestResult) {
      output += `🔗 [View Full Listing](${bestResult.url})\n\n`;
    }

    output += buildMortgageTable(price, rate, exactAddress, allContent);
    output += buildCMATable(price, sqft);
    output += buildConfidentTrigger(price, sqft);
    output += buildAreaLinks(exactAddress, encodedAddr);
    return output;
  }
  if (isCommercial) {
    output += `🏢 **Commercial Real Estate Results**\n\n`;
  } else {
    output += `🏠 **Residential Property Results**\n\n`;
  }

  if (images.length > 0) {
    output += `📸 **Property Photos**\n\n`;
    images.forEach((img) => { output += `{{IMG:${img}}}\n`; });
    output += `\n`;
  }

  if (results.length === 0) {
    output += `⚠️ **No listings found for this search.**\n\n`;
    output += `This could be due to:\n`;
    output += `• No matching properties in this area/price range\n`;
    output += `• Temporary search service issue\n\n`;
    output += `**Try refining your search** — add a city, state, price range, or bedroom count.\n`;
    output += `*Example: "3 bed homes in Las Vegas under $500K"*\n`;
    return output;
  }

  results.forEach((r) => {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `**${r.title}**\n\n`;
    output += `🔗 [View Full Listing](${r.url})\n\n`;
  });

  if (!isCommercial && results.length > 0) {
    const allContent = results.map(r => r.content || "").join(" ");
    const price = extractPrice(allContent) || 500000;
    const sqft = extractSqft(allContent) || 2000;
    output += buildMortgageTable(price, rate, mapAddress, allContent);
    output += buildCMATable(price, sqft);
    output += buildConfidentTrigger(price, sqft);
    output += buildAreaLinks(mapAddress, encodedAddr);
  }

  if (isCommercial && results.length > 0) {
    output += buildAreaLinks(mapAddress, encodedAddr);
  }

  return output;
}

// ─── TABLE BUILDERS ───────────────────────────────────────────────────
function buildMortgageTable(price, rate, address, content) {
  const taxInfo = extractPropertyTax(content, price, address);
  const hoa = extractHOA(content);
  const hoaDisplay = hoa !== null ? hoa : 0;

  let o = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  o += `💰 **Mortgage Estimate** (Rate: ${rate}% — 30yr Fixed, via MND Daily Index)\n`;
  o += `Property Price: $${price.toLocaleString()}`;
  // Show tax source
  if (taxInfo.source === 'listing') {
    o += ` | Taxes: $${taxInfo.annualTax.toLocaleString()}/yr (from listing)`;
  } else if (taxInfo.stateName) {
    o += ` | Taxes: $${taxInfo.annualTax.toLocaleString()}/yr est. (${taxInfo.stateName} avg ${(taxInfo.taxRate * 100).toFixed(2)}%)`;
  }
  if (hoa !== null) o += ` | HOA: ${hoa > 0 ? '$' + hoa + '/mo' : 'None'}`;
  else o += ` | HOA: N/A`;
  o += `\n\n`;
  o += `| Down | Down Pmt | P&I | Taxes | HOA | Total/mo |\n`;
  o += `|------|----------|-----|-------|-----|----------|\n`;
  [0, 3.5, 5, 10, 20].forEach((pct) => {
    const m = calculateMortgage(price, rate, pct, taxInfo.monthlyTax, hoaDisplay);
    o += `| ${pct}% | $${m.downPayment.toLocaleString()} | $${m.monthlyPI.toLocaleString()} | $${m.taxes.toLocaleString()} | ${m.hoa > 0 ? '$' + m.hoa.toLocaleString() : '—'} | $${m.total.toLocaleString()} |\n`;
  });
  return o;
}

function buildCMATable(price, sqft) {
  const pricePerSqft = Math.round(price / sqft);
  const compLow = Math.round(price * 0.92);
  const compHigh = Math.round(price * 1.08);
  const compMedian = Math.round((compLow + compHigh) / 2);

  let o = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  o += `📊 **CMA & Realty AI Trigger**\n\n`;
  o += `| Metric | Value |\n`;
  o += `|--------|-------|\n`;
  o += `| Comp Low | $${compLow.toLocaleString()} |\n`;
  o += `| Comp High | $${compHigh.toLocaleString()} |\n`;
  o += `| Avg $/sqft | $${pricePerSqft} |\n`;
  o += `| Asking Price | $${price.toLocaleString()} |\n`;
  o += `| AI Trigger | $${compMedian.toLocaleString()} |\n`;
  return o;
}

function buildConfidentTrigger(price, sqft) {
  const pricePerSqft = Math.round(price / sqft);
  let o = `\n📈 **Confident Trigger Analysis**\n\n`;
  o += `| $/sqft | Price | Buyers | Confidence |\n`;
  o += `|--------|-------|--------|------------|\n`;
  [pricePerSqft - 40, pricePerSqft - 20, pricePerSqft, pricePerSqft + 20, pricePerSqft + 40].forEach((ppsf) => {
    const tp = ppsf * sqft;
    const pool = ppsf < pricePerSqft - 10 ? "Many" : ppsf < pricePerSqft + 10 ? "Moderate" : ppsf < pricePerSqft + 30 ? "Few" : "Almost None";
    const conf = ppsf < pricePerSqft - 10 ? "🟢 High" : ppsf < pricePerSqft + 10 ? "🟡 Medium" : ppsf < pricePerSqft + 30 ? "🟠 Low" : "🔴 Very Low";
    o += `| $${ppsf} | $${tp.toLocaleString()} | ${pool} | ${conf} |\n`;
  });
  return o;
}

// *** SIDEBAR CHANGE: Schedule a Tour moved here from buildCallToAction ***
function buildAreaLinks(address, encodedAddr) {
  let o = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  o += `📍 **Explore the Area** — ${address}\n\n`;
  o += `[🍽️ Restaurants](#amenity-restaurant-${encodedAddr})\n`;
  o += `[🏫 Schools](#amenity-school-${encodedAddr})\n`;
  o += `[🏥 Hospitals](#amenity-hospital-${encodedAddr})\n`;
  o += `[💪 Gyms & Fitness](#amenity-gym-${encodedAddr})\n`;
  o += `[🌳 Parks](#amenity-park-${encodedAddr})\n`;
  o += `[🏛️ County Assessor](#amenity-assessor-${encodedAddr})\n`;
  o += `[🗺️ Map](#amenity-map-${encodedAddr})\n`;
  o += `[📊 CMA Report](#cma-report-${encodedAddr})\n`;
  o += `[📅 Schedule a Tour](#schedule-tour)\n`;
  return o;
}

// *** SIDEBAR CHANGE: Agent links removed — they now live in the sidebar ***
// buildCallToAction is no longer called from buildPropertyResponse
// The agents are accessible via sidebar buttons, and Schedule a Tour is in buildAreaLinks

function extractPrice(text) {
  const matches = text.match(/\$([0-9,]+(?:,\d{3})*)/g);
  if (matches) {
    const prices = matches.map(m => parseInt(m.replace(/[$,]/g, ""))).filter(p => p > 50000);
   if (prices.length > 0) return prices[0];
  }
  return null;
}

function extractSqft(text) {
  const match = text.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);
  if (match) return parseInt(match[1].replace(/,/g, ""));
  return null;
}

function extractAddress(title) {
  const match = title.match(/[-–]\s*(.+)/);
  return match ? match[1].trim() : title;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function RealtyAI() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('realtyai_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachments, setAttachments] = useState([]);
  // *** VOICE MODE ***
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(window.speechSynthesis);
  const voiceModeRef = useRef(false); // ref to avoid stale closure in callbacks
  const [showMortgageAgent, setShowMortgageAgent] = useState(false);
  const [showOfferAgent, setShowOfferAgent] = useState(false);
  const [showListingAgent, setShowListingAgent] = useState(false);
  const [showTourAgent, setShowTourAgent] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [searchCount, setSearchCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeBillingCycle, setUpgradeBillingCycle] = useState("monthly");
  // *** SIDEBAR: New state ***
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  // *** All user data loaded from Supabase on login — defaults are clean ***
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  // *** AMENITY PANELS ***
  const [showAmenityPanel, setShowAmenityPanel] = useState(false);
  const [amenityType, setAmenityType] = useState(""); // restaurant, school, hospital, gym, park, map, assessor
  const [amenityAddress, setAmenityAddress] = useState("");
  const [amenityResults, setAmenityResults] = useState([]);
  const [amenityLoading, setAmenityLoading] = useState(false);
  const [amenityCenter, setAmenityCenter] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  // *** CMA REPORT PANEL ***
  const [showCMAPanel, setShowCMAPanel] = useState(false);
  const [cmaAddress, setCmaAddress] = useState("");
  const [cmaLoading, setCmaLoading] = useState(false);
  const [cmaReport, setCmaReport] = useState("");
  // *** Counters — all from Supabase ***
  const [listingCount, setListingCount] = useState(0);
  const [offerCount, setOfferCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);

  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const offerIframeRef = useRef(null);
  const listingIframeRef = useRef(null);
  const tourIframeRef = useRef(null);
  // *** SIDEBAR: Dropdown ref for click-outside ***
  const dropdownRef = useRef(null);
  // *** AMENITY PANELS: Request ref for click handler closure ***
  const amenityRequestRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  // *** SIDEBAR: Close dropdown on click outside ***
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch plan + all user data on load
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}&select=plan,search_count,search_reset_date,profile_photo_url,listing_count,offer_count,approval_count,search_history`, { method: "GET" });
        if (data && data.length > 0) {
          setUserPlan(data[0].plan || "free");
          // Load profile photo
          if (data[0].profile_photo_url) {
            setProfilePhoto(data[0].profile_photo_url);
          } else {
            setProfilePhoto(null);
          }
          // Load counts from Supabase
          setListingCount(data[0].listing_count || 0);
          setOfferCount(data[0].offer_count || 0);
          setApprovalCount(data[0].approval_count || 0);
          // Load search history from Supabase
          if (data[0].search_history) {
            try { setSearchHistory(JSON.parse(data[0].search_history)); } catch { setSearchHistory([]); }
          } else {
            setSearchHistory([]);
          }
          // Monthly search count reset
          const resetDate = new Date(data[0].search_reset_date || Date.now());
          const now = new Date();
          if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
            setSearchCount(0);
            await supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}`, {
              method: "PATCH", body: JSON.stringify({ search_count: 0, search_reset_date: now.toISOString() }),
            });
          } else {
            setSearchCount(data[0].search_count || 0);
          }
        }
      } catch (e) { console.error("Plan fetch error:", e); }
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "true") {
        setUserPlan("plus");
        window.history.replaceState({}, "", window.location.pathname);
      }
    })();
  }, [user]);

  // Welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: "assistant",
        type: "rich",
        content: `👋 **Welcome to Realty AI, ${user.name || "there"}!**\n\nI'm your AI-powered real estate assistant. I can help you:\n\n🏠 **Residential** — Search homes on Zillow, Realtor.com, Redfin & Homes.com\n🏢 **Commercial** — Find spaces on LoopNet, Crexi & BizBuySell\n🏗️ **New Construction** — Browse brand new homes\n\nJust tell me what you're looking for! For example:\n• *"3 bedroom homes in San Diego under $800K"*\n• *"Restaurant space for lease in Miami"*\n• *"New construction homes in Austin, TX"*`,
      }]);
    }
  }, [user]);

  // Intercept agent link clicks
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;

      if (href === '#mortgage-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowMortgageAgent(true);
      }
      if (href === '#offer-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowOfferAgent(true);
      }
      if (href === '#listing-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowListingAgent(true);
      }
      if (href === '#schedule-tour') {
        e.preventDefault();
        setShowTourAgent(true);
      }
      // *** CMA REPORT: Intercept CMA hash links ***
      if (href.startsWith('#cma-report-')) {
        e.preventDefault();
        const encodedAddress = href.substring(12); // remove '#cma-report-'
        const address = decodeURIComponent(encodedAddress);
        setCmaAddress(address);
        setShowCMAPanel(true);
        setCmaReport("");
        setCmaLoading(true);
        // Auto-generate the report
        generateCMAReport(address);
      }
      // *** AMENITY PANELS: Intercept amenity hash links ***
      if (href.startsWith('#amenity-')) {
        e.preventDefault();
        const parts = href.substring(9); // remove '#amenity-'
        const dashIdx = parts.indexOf('-');
        if (dashIdx > 0) {
          const type = parts.substring(0, dashIdx);
          const encodedAddress = parts.substring(dashIdx + 1);
          const address = decodeURIComponent(encodedAddress);
          // Set state directly (avoids stale closure)
          setAmenityType(type);
          setAmenityAddress(address);
          setShowAmenityPanel(true);
          setAmenityResults([]);
          setAmenityCenter(null);
          setAmenityLoading(true);
          // Store in ref so the fetch effect can pick it up
          amenityRequestRef.current = { type, address };
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userPlan]);

  // Listen for close messages from agent iframes
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data === 'closeMortgageAgent') {
        setShowMortgageAgent(false);
      }
      if (e.data?.type === 'NAVIGATE' && e.data.to === 'dashboard') {
        setShowOfferAgent(false);
        setShowListingAgent(false);
        setShowTourAgent(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    const lowerText = text.toLowerCase();
    const isNonRealEstate = lowerText.match(/^(write me a poem|tell me a joke|what is the meaning of life|who is the president|write code|help me with math|translate|recipe|cook|weather forecast|stock market|crypto|bitcoin|sports score|movie review|book summary|play a game)/);
    const isGreeting = lowerText.match(/^(hi|hello|hey|good morning|good afternoon|good evening|what can you do|help|how are you)/);

    if (userPlan === "free" && !isGreeting && !isNonRealEstate && searchCount >= 50) {
      setMessages((prev) => [...prev,
        { role: "user", content: text },
        { role: "assistant", type: "rich", content: "🔒 **You've reached your 50 free searches this month.**\n\nUpgrade to **Realty AI Plus** for unlimited searches plus full access to the Mortgage Agent, Offer Agent, and Listing Agent.\n\n💰 Starting at just **$25/month** (billed annually)." }
      ]);
      setInput("");
      setShowUpgradeModal(true);
      return;
    }
    const hasAddress = lowerText.match(/\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|dr|drive|ln|lane|rd|road|ct|court|way|pl|place|cir|circle|pkwy|parkway)|(\d{5})|([a-z]+,?\s*(ca|ny|tx|fl|az|nv|wa|or|co|il|ga|nc|sc|va|md|pa|nj|oh|mi|ma|ct|mn|wi|mo|tn|in|al|la|ky|ok|ut|ia|ar|ms|ks|ne|nm|id|hi|me|nh|ri|mt|de|sd|nd|ak|vt|wy|wv|dc))\b/i);

    const userMsg = {
      role: "user", content: text,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    if (isNonRealEstate && !hasAddress) {
      const rejectMsg = "I'm specialized in real estate searches only. Please ask me about residential homes, commercial properties, new constructions, or give me a property address and I'll look it up for you!";
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: rejectMsg + " 🏠",
        }]);
        if (voiceModeRef.current) speakText(rejectMsg);
        setLoading(false);
      }, 600);
      return;
    }

    if (isGreeting && !hasAddress) {
      const greetMsg = "Hello! I'm Realty AI, your real estate search assistant. I can search for residential, commercial, or new construction properties across major platforms. Just tell me what you're looking for, include details like location, price range, bedrooms, or property type!";
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: `Hello! 👋 I'm **Realty AI**, your real estate search assistant.\n\nI can search for **residential**, **commercial**, or **new construction** properties across major platforms. Just tell me what you're looking for — include details like location, price range, bedrooms, or property type!\n\n*Example: "Find me 3 bed homes in San Diego under $700K"*\n*Example: "123 Main St, Los Angeles, CA"*`,
        }]);
        if (voiceModeRef.current) speakText(greetMsg);
        setLoading(false);
      }, 600);
      return;
    }

    let searchQuery = text;
    const isCommercial = lowerText.match(/commercial|lease|restaurant|office|retail|business for sale/);
    const isNewConst = lowerText.match(/new home|new construction/);
    const isAddress = isSpecificAddress(text);

    if (isCommercial) {
      searchQuery += " site:loopnet.com OR site:crexi.com OR site:bizbuysell.com";
    } else if (isNewConst) {
      searchQuery += " new construction homes";
    } else if (isAddress) {
      searchQuery = `"${text}" zillow OR realtor.com OR redfin`;
    } else {
      searchQuery += " site:zillow.com OR site:realtor.com OR site:redfin.com OR site:homes.com";
    }

    try {
      const [results, mortgageRate] = await Promise.all([
        firecrawlSearch(searchQuery, isAddress ? {
          limit: 3,
          scrapeOptions: { formats: ["markdown", "links"], onlyMainContent: true }
        } : { limit: 5 }),
        fetchMortgageRate(),
      ]);

      // Log Firecrawl response for debugging
      if (results.error) {
        console.error("Firecrawl returned error:", results.error);
      }
      console.log("Firecrawl results count:", (results.results || []).length);

      const response = buildPropertyResponse(text, results, mortgageRate, isAddress);

      // *** Track search in history — save to Supabase ***
      const queryType = isCommercial ? "Commercial" : isNewConst ? "New Construction" : "Residential";
      const newEntry = { query: text, type: queryType, time: new Date().toISOString(), resultCount: (results.results || []).length };
      setSearchHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, 100);
        // Save to Supabase
        supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}`, {
          method: "PATCH", body: JSON.stringify({ search_history: JSON.stringify(updated) }),
        }).catch(() => {});
        return updated;
      });

      const words = response.split(" ");
      let streamed = "";

      setMessages((prev) => [...prev, { role: "assistant", type: "rich", content: "", streaming: true }]);

      for (let i = 0; i < words.length; i += 4) {
        streamed += words.slice(i, i + 4).join(" ") + " ";
        const current = streamed;
        await new Promise((r) => setTimeout(r, 20));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", type: "rich", content: current, streaming: i + 4 < words.length };
          return updated;
        });
      }
      // *** VOICE MODE: Speak the response aloud ***
      if (voiceModeRef.current) {
        speakText(response);
      }
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "assistant", type: "rich",
        content: "I encountered an issue searching for properties. Please try again with more specific criteria like location, price range, or property type.",
      }]);
    }
    if (userPlan === "free") {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      try {
        await supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}`, {
          method: "PATCH", body: JSON.stringify({ search_count: newCount }),
        });
      } catch (e) { console.error("Search count update error:", e); }
    }
    setLoading(false);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, type: f.type }))]);
  };

  // *** SIDEBAR: Handle profile photo upload — saves to Supabase ***
  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Resize image before storing (keep under 500KB for Supabase text field)
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200; // 200x200 max
          let w = img.width, h = img.height;
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const photoData = canvas.toDataURL('image/jpeg', 0.8);
          setProfilePhoto(photoData);
          // saved to Supabase above
          // Save to Supabase
          if (user?.email) {
            supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}`, {
              method: "PATCH",
              body: JSON.stringify({ profile_photo_url: photoData }),
            }).catch((err) => console.error("Photo save error:", err));
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // *** SIDEBAR: Agent click handler (used by sidebar buttons) ***
  const handleAgentClick = (agent) => {
    setSidebarOpen(false); // close mobile sidebar
    if (agent === 'listing') {
      if (userPlan === 'free') { setShowUpgradeModal(true); return; }
      setShowListingAgent(true);
    } else if (agent === 'offer') {
      if (userPlan === 'free') { setShowUpgradeModal(true); return; }
      setShowOfferAgent(true);
    } else if (agent === 'mortgage') {
      if (userPlan === 'free') { setShowUpgradeModal(true); return; }
      setShowMortgageAgent(true);
    } else if (agent === 'live') {
      window.open('https://studio.restream.io/euf-vqup-uwl', '_blank');
    } else if (agent === 'cma') {
      setCmaAddress("");
      setCmaReport("");
      setCmaLoading(false);
      setShowCMAPanel(true);
    }
  };

  // *** SIDEBAR: User initials helper ***
  const userInitials = user ? (user.name || user.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2) : "U";

  // *** AMENITY PANELS: Config & fetch ***
  const amenityConfig = {
    restaurant: { label: "Restaurants", emoji: "🍽️", type: "restaurant", color: "#E31837" },
    school: { label: "Schools", emoji: "🏫", type: "school", color: "#3498DB" },
    hospital: { label: "Hospitals", emoji: "🏥", type: "hospital", color: "#27AE60" },
    gym: { label: "Gyms & Fitness", emoji: "💪", type: "gym", color: "#8E44AD" },
    park: { label: "Parks", emoji: "🌳", type: "park", color: "#2ECC71" },
    map: { label: "Map", emoji: "🗺️", type: "map", color: "#E67E22" },
    assessor: { label: "County Assessor", emoji: "🏛️", type: "assessor", color: "#34495E" },
  };

  const fetchNearbyPlaces = async (address, placeType) => {
    setAmenityLoading(true);
    setAmenityResults([]);
    setAmenityCenter(null);
    try {
      const res = await fetch('/.netlify/functions/nearby-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, type: placeType }),
      });
      const data = await res.json();
      if (data.results) {
        setAmenityResults(data.results);
        setAmenityCenter(data.center);
      }
    } catch (err) {
      console.error('Amenity fetch error:', err);
    }
    setAmenityLoading(false);
  };

  // Trigger fetch when amenity panel opens via click handler
  useEffect(() => {
    if (!showAmenityPanel || !amenityRequestRef.current) return;
    const { type, address } = amenityRequestRef.current;
    amenityRequestRef.current = null; // consume
    if (type !== 'assessor') {
      const googleType = amenityConfig[type]?.type || type;
      fetchNearbyPlaces(address, type === 'map' ? 'point_of_interest' : googleType);
    } else {
      setAmenityLoading(false);
    }
  }, [showAmenityPanel]);

  // *** CMA REPORT: Generate function ***
  const generateCMAReport = async (address) => {
    setCmaLoading(true);
    setCmaReport("");
    try {
      const cityMatch = address.match(/,\s*([A-Za-z\s]+),?\s*([A-Z]{2})\s*(\d{5})?/i);
      const city = cityMatch ? cityMatch[1].trim() : "";
      const state = cityMatch ? cityMatch[2].trim() : "";
      const zip = address.match(/\d{5}/)?.[0] || "";
      const area = city && state ? `${city}, ${state}` : zip || address;
      } catch (error) {
  console.error("Failed to parse address:", error);
  setCmaError("Unable to parse the provided address.");
  setCmaLoading(false);
}
    
      // ─── TRY RPR AGENT FIRST (MLS-quality data) ──────────────────────
      try {
        console.log("[CMA] Starting RPR agent...");
        // Step 1: Start the agent
        const startRes = await fetch("/.netlify/functions/rpr-cma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", address }),
        });
        const startJson = await startRes.json();

        if (startJson.success && startJson.jobId) {
          console.log("[CMA] RPR agent started:", startJson.jobId);

          // Step 2: Poll for completion (check every 5 seconds, up to 2 minutes)
          let attempts = 0;
          const maxAttempts = 24; // 24 * 5s = 2 minutes max
          while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000));
            attempts++;
            console.log("[CMA] Polling RPR agent... attempt", attempts);

            const statusRes = await fetch("/.netlify/functions/rpr-cma", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "status", jobId: startJson.jobId }),
            });
            const statusJson = await statusRes.json();

            if (statusJson.status === 'completed') {
              console.log("[CMA] RPR agent completed!");
              const agentResult = statusJson.data || statusJson.result;

              if (agentResult) {
                // Agent returned structured data — build report directly
                const s = agentResult.subject || {};
                const comps = agentResult.sold_comps || [];
                const active = agentResult.active_listings || [];
                const market = agentResult.market || {};

                let report = `🔒 **Data Source: RPR Agent — MLS-Quality Data**\n\n`;

                // Subject
                report += `📊 **SUBJECT PROPERTY**\n\n`;
                report += `| Field | Data |\n|-------|------|\n`;
                report += `| Address | ${s.address || address} |\n`;
                if (s.list_price) report += `| List Price | $${s.list_price.toLocaleString()} |\n`;
                if (s.rvm_value) report += `| RPR Value (RVM) | $${s.rvm_value.toLocaleString()} |\n`;
                if (s.cma_value) report += `| CMA Value | $${s.cma_value.toLocaleString()} |\n`;
                if (s.beds) report += `| Beds | ${s.beds} |\n`;
                if (s.baths) report += `| Baths | ${s.baths} |\n`;
                if (s.sqft) report += `| Sq Ft | ${s.sqft.toLocaleString()} |\n`;
                if (s.price_per_sqft) report += `| $/SqFt | $${s.price_per_sqft} |\n`;
                if (s.year_built) report += `| Year Built | ${s.year_built} |\n`;
                if (s.property_type) report += `| Type | ${s.property_type} |\n`;
                if (s.lot_size) report += `| Lot | ${s.lot_size} |\n`;
                if (s.tax_assessed_value) report += `| Tax Assessed | $${s.tax_assessed_value.toLocaleString()} |\n`;
                if (s.annual_tax) report += `| Annual Tax | $${s.annual_tax.toLocaleString()} |\n`;

                // Sold Comps
                report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                report += `🏘️ **RECENT SALES (Comparables)**\n\n`;
                if (comps.length > 0) {
                  report += `| Address | Sold Price | Beds | Baths | SqFt | $/SqFt |\n`;
                  report += `|---------|-----------|------|-------|------|--------|\n`;
                  comps.forEach(c => {
                    report += `| ${(c.address || '—').substring(0, 35)} | $${(c.sold_price || 0).toLocaleString()} | ${c.beds || '—'} | ${c.baths || '—'} | ${c.sqft ? c.sqft.toLocaleString() : '—'} | ${c.price_per_sqft ? '$' + c.price_per_sqft : '—'} |\n`;
                  });
                  const avgPrice = Math.round(comps.reduce((a, c) => a + (c.sold_price || 0), 0) / comps.length);
                  const avgPpsf = comps.filter(c => c.price_per_sqft).length > 0
                    ? Math.round(comps.filter(c => c.price_per_sqft).reduce((a, c) => a + c.price_per_sqft, 0) / comps.filter(c => c.price_per_sqft).length) : null;
                  report += `\n**Comp Average: $${avgPrice.toLocaleString()}**`;
                  if (avgPpsf) report += ` **| Avg $/SqFt: $${avgPpsf}**`;
                  report += `\n`;
                } else {
                  report += `No sold comps returned by agent.\n`;
                }

                // Active Listings
                if (active.length > 0) {
                  report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                  report += `🏠 **ACTIVE LISTINGS (Competition)**\n\n`;
                  report += `| Address | Asking Price | Beds | Baths | SqFt |\n`;
                  report += `|---------|-------------|------|-------|------|\n`;
                  active.forEach(c => {
                    report += `| ${(c.address || '—').substring(0, 35)} | $${(c.asking_price || 0).toLocaleString()} | ${c.beds || '—'} | ${c.baths || '—'} | ${c.sqft ? c.sqft.toLocaleString() : '—'} |\n`;
                  });
                }

                // Market
                report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                report += `📈 **MARKET OVERVIEW**\n\n`;
                report += `| Metric | Value |\n|--------|-------|\n`;
                if (market.median_sold_price) report += `| Median Sold Price | $${market.median_sold_price.toLocaleString()} |\n`;
                if (market.median_list_price) report += `| Median List Price | $${market.median_list_price.toLocaleString()} |\n`;
                if (market.avg_days_on_market) report += `| Avg Days on Market | ${market.avg_days_on_market} days |\n`;
                if (market.sold_to_list_ratio) report += `| Sold-to-List Ratio | ${market.sold_to_list_ratio} |\n`;
                if (market.price_trend) report += `| Price Trend | ${market.price_trend} |\n`;
                if (market.months_of_inventory) report += `| Months of Inventory | ${market.months_of_inventory} |\n`;

                // Estimated Value
                const compPrices = comps.map(c => c.sold_price).filter(p => p > 0);
                const estValue = s.cma_value || s.rvm_value ||
                  (compPrices.length > 0 ? Math.round(compPrices.reduce((a, b) => a + b, 0) / compPrices.length) : null)
                  || s.list_price;
                if (estValue) {
                  report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                  report += `💰 **ESTIMATED VALUE**\n\n`;
                  report += `| Metric | Value |\n|--------|-------|\n`;
                  report += `| **Estimated Value** | **$${estValue.toLocaleString()}** |\n`;
                  report += `| Value Range | $${Math.round(estValue * 0.95).toLocaleString()} — $${Math.round(estValue * 1.05).toLocaleString()} |\n`;
                }

                setCmaReport(report);
                setCmaLoading(false);
                return;
              }
              break;
            } else if (statusJson.status === 'failed') {
              console.log("[CMA] RPR agent failed");
              break;
            }
            // Still processing — continue polling
          }
        }
      } catch (rprErr) {
        console.log("[CMA] RPR agent error:", rprErr.message);
      }
        } else {
      // ─── FALLBACK: Firecrawl Search (public data) ───────────────────
      console.log("[CMA] Using Firecrawl search fallback...");
      const [subjectRes, compsRes, marketRes] = await Promise.all([
        firecrawlSearch(`${address} zillow redfin property details`, {
          limit: 2,
          scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
        }),
        firecrawlSearch(`recently sold homes near ${address} ${zip}`, {
          limit: 5,
          scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
        }),
        firecrawlSearch(`${area} ${zip} housing market statistics median home price days on market 2026`, {
          limit: 5,
        }),
      ]);

      // ─── PARSE SUBJECT PROPERTY ──────────────────────────────────────
      const subjectAll = (subjectRes.results || []).map(r => (r.content || "") + " " + (r.title || "")).join(" ");
      const subjectPrice = extractPrice(subjectAll);
      const subjectSqft = extractSqft(subjectAll);
      const subjectBeds = subjectAll.match(/(\d+)\s*(?:beds?|bedrooms?|bd|br)\b/i);
      const subjectBaths = subjectAll.match(/([\d.]+)\s*(?:baths?|bathrooms?|ba)\b/i);
      const subjectYear = subjectAll.match(/(?:built\s*(?:in\s*)?|year\s*built\s*[:.]?\s*)(\d{4})/i);
      const subjectType = subjectAll.match(/\b(Single Family|Condo|Townhouse|Townhome|Multi Family|Duplex)\b/i);
      const subjectLot = subjectAll.match(/([\d,.]+)\s*(?:acres?|sqft?\s*lot|lot\s*size)/i);
      const zestMatch = subjectAll.match(/Zestimate[^$]*?\$([\d,]+)/i) || subjectAll.match(/Redfin\s*Estimate[^$]*?\$([\d,]+)/i);
      const zestimate = zestMatch ? parseInt(zestMatch[1].replace(/,/g, '')) : null;

      // ─── PARSE COMPS FROM SCRAPED PAGES ──────────────────────────────
      // Each search result is a page (Zillow/Redfin listing or search results page)
      // We need to extract INDIVIDUAL properties from each page's markdown
      const comps = [];

      (compsRes.results || []).forEach(r => {
        const content = r.content || "";
        const title = r.title || "";

        // Strategy 1: Try to parse the page as a single property listing
        // (when the search result IS an individual property page)
        const singlePrice = extractPrice(content + " " + title);
        const singleSqft = extractSqft(content);
        const singleBeds = content.match(/(\d+)\s*(?:beds?|bedrooms?|bd|br)\b/i);
        const singleBaths = content.match(/([\d.]+)\s*(?:baths?|bathrooms?|ba)\b/i);
        // Extract actual address from Zillow/Redfin title format: "123 Main St, City, ST - Zillow"
        const titleParts = title.split(/\s*[|\-–—]\s*/);
        const titleAddr = titleParts[0]?.trim() || "";
        const hasStreetNum = /^\d+\s+/.test(titleAddr);

        if (singlePrice && singlePrice > 50000 && singlePrice !== subjectPrice && hasStreetNum) {
          comps.push({
            address: titleAddr.substring(0, 40),
            price: singlePrice,
            beds: singleBeds ? parseInt(singleBeds[1]) : null,
            baths: singleBaths ? parseFloat(singleBaths[1]) : null,
            sqft: singleSqft || null,
          });
        }

        // Strategy 2: Parse listing cards from search results pages
        // Zillow/Redfin search results contain multiple properties in patterns like:
        // "123 Main St ... $500,000 ... 3 bd 2 ba 1,500 sqft"
        // Split by address patterns (street number at start of line)
        const lines = content.split('\n');
        let currentProp = {};
        lines.forEach(line => {
          const addrStart = line.match(/^[#*\s]*(\d+\s+[A-Za-z][A-Za-z\s]*(?:St|Ave|Dr|Ln|Rd|Ct|Way|Pl|Blvd|Cir|Pkwy|Ter|Loop)[^,]*,?\s*[A-Za-z]*)/i);
          if (addrStart) {
            // Save previous property if it had data
            if (currentProp.address && currentProp.price && currentProp.price !== subjectPrice) {
              comps.push(currentProp);
            }
            currentProp = { address: addrStart[1].trim().substring(0, 40) };
          }
          // Extract data from current line
          const linePrice = extractPrice(line);
          if (linePrice && linePrice > 50000) currentProp.price = linePrice;
          const lineBeds = line.match(/(\d+)\s*(?:bd|beds?|br)\b/i);
          if (lineBeds) currentProp.beds = parseInt(lineBeds[1]);
          const lineBaths = line.match(/([\d.]+)\s*(?:ba|baths?)\b/i);
          if (lineBaths) currentProp.baths = parseFloat(lineBaths[1]);
          const lineSqft = extractSqft(line);
          if (lineSqft) currentProp.sqft = lineSqft;
          const lineSold = line.match(/sold\s*(?:on|:)?\s*(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
          if (lineSold) currentProp.sold_date = lineSold[1];
        });
        // Don't forget the last one
        if (currentProp.address && currentProp.price && currentProp.price !== subjectPrice) {
          comps.push(currentProp);
        }
      });

      // Deduplicate comps by address
      const uniqueComps = [];
      const seenAddrs = new Set();
      comps.forEach(c => {
        const key = (c.address || "").substring(0, 15).toLowerCase();
        if (!seenAddrs.has(key) && key.length > 3) {
          seenAddrs.add(key);
          uniqueComps.push(c);
        }
      });

      // ─── PARSE MARKET DATA ───────────────────────────────────────────
      const marketAll = (marketRes.results || []).map(r => (r.content || "") + " " + (r.title || "")).join(" ");
      const medianMatch = marketAll.match(/median\s*(?:home|list|sale|sold?)?\s*price\s*[:.]?\s*\$([\d,]+)/i)
        || marketAll.match(/\$([\d,]+)\s*median/i);
      const domMatch = marketAll.match(/(?:average|median)?\s*(\d+)\s*days?\s*(?:on\s*market|DOM)/i);
      const inventoryMatch = marketAll.match(/([\d,]+)\s*(?:homes?\s*(?:for\s*sale|listed|available)|active\s*listings)/i);
      const trendMatch = marketAll.match(/(?:prices?\s*(?:have\s*)?)(increased|decreased|risen|fallen|grew|dropped|up|down|stable|rising|falling)\s*(?:by\s*)?([\d.]+)?%?/i);

      // ─── CALCULATE ESTIMATED VALUE ───────────────────────────────────
      const compPrices = uniqueComps.map(c => c.price).filter(p => p > 50000);
      const compPpsfs = uniqueComps.filter(c => c.price && c.sqft).map(c => Math.round(c.price / c.sqft));
      const avgCompPrice = compPrices.length > 0 ? Math.round(compPrices.reduce((a, b) => a + b, 0) / compPrices.length) : null;
      const avgPpsf = compPpsfs.length > 0 ? Math.round(compPpsfs.reduce((a, b) => a + b, 0) / compPpsfs.length) : null;
      const estimatedValue = avgPpsf && subjectSqft ? avgPpsf * subjectSqft
        : avgCompPrice ? avgCompPrice
        : zestimate ? zestimate
        : subjectPrice;

      // ─── BUILD THE REPORT ────────────────────────────────────────────
      let report = "";

      // Subject Property
      report += `📊 **SUBJECT PROPERTY**\n\n`;
      report += `| Field | Data |\n`;
      report += `|-------|------|\n`;
      report += `| Address | ${address} |\n`;
      if (subjectPrice) report += `| List Price | $${subjectPrice.toLocaleString()} |\n`;
      if (subjectBeds) report += `| Beds | ${subjectBeds[1]} |\n`;
      if (subjectBaths) report += `| Baths | ${subjectBaths[1]} |\n`;
      if (subjectSqft) report += `| Sq Ft | ${subjectSqft.toLocaleString()} |\n`;
      if (subjectPrice && subjectSqft) report += `| $/SqFt | $${Math.round(subjectPrice / subjectSqft)} |\n`;
      if (subjectYear) report += `| Year Built | ${subjectYear[1]} |\n`;
      if (subjectType) report += `| Type | ${subjectType[1]} |\n`;
      if (subjectLot) report += `| Lot | ${subjectLot[0]} |\n`;
      if (zestimate) report += `| Zestimate | $${zestimate.toLocaleString()} |\n`;

      // Recent Sales
      report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `🏘️ **RECENT SALES (Comparables)**\n\n`;
      if (uniqueComps.length > 0) {
        report += `| Address | Sold Price | Beds | Baths | SqFt | $/SqFt |\n`;
        report += `|---------|-----------|------|-------|------|--------|\n`;
        uniqueComps.slice(0, 6).forEach(c => {
          const ppsf = (c.price && c.sqft) ? `$${Math.round(c.price / c.sqft)}` : '—';
          report += `| ${(c.address || '—')} | $${c.price.toLocaleString()} | ${c.beds || '—'} | ${c.baths || '—'} | ${c.sqft ? c.sqft.toLocaleString() : '—'} | ${ppsf} |\n`;
        });
        if (avgCompPrice) report += `\n**Comp Average: $${avgCompPrice.toLocaleString()}**`;
        if (avgPpsf) report += ` **| Avg $/SqFt: $${avgPpsf}**`;
        report += `\n`;
      } else {
        report += `No comparable sales data found for ${area}.\n`;
      }

      // Market Overview
      report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `📈 **MARKET OVERVIEW — ${area}**\n\n`;
      report += `| Metric | Value |\n`;
      report += `|--------|-------|\n`;
      if (medianMatch) report += `| Median Home Price | $${medianMatch[1]} |\n`;
      if (domMatch) report += `| Avg Days on Market | ${domMatch[1]} days |\n`;
      if (inventoryMatch) report += `| Active Listings | ${inventoryMatch[1]} |\n`;
      if (trendMatch) report += `| Price Trend | ${trendMatch[1]}${trendMatch[2] ? ' ' + trendMatch[2] + '%' : ''} |\n`;
      if (uniqueComps.length > 0) report += `| Comps Analyzed | ${uniqueComps.length} properties |\n`;
      if (!medianMatch && !domMatch && !inventoryMatch && !trendMatch && uniqueComps.length === 0) {
        report += `| Data | Limited market data for this area |\n`;
      }

      // Estimated Value
      report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `💰 **ESTIMATED VALUE**\n\n`;
      report += `| Metric | Value |\n`;
      report += `|--------|-------|\n`;
      if (estimatedValue) {
        const lowEst = Math.round(estimatedValue * 0.95);
        const highEst = Math.round(estimatedValue * 1.05);
        report += `| **Estimated Value** | **$${estimatedValue.toLocaleString()}** |\n`;
        report += `| Value Range | $${lowEst.toLocaleString()} — $${highEst.toLocaleString()} |\n`;
      }
      if (zestimate) report += `| Zestimate | $${zestimate.toLocaleString()} |\n`;
      if (avgCompPrice) report += `| Comp Average | $${avgCompPrice.toLocaleString()} |\n`;
      if (avgPpsf) report += `| Avg Comp $/SqFt | $${avgPpsf} |\n`;
      if (avgPpsf && subjectSqft) report += `| Value at Avg $/SqFt | $${(avgPpsf * subjectSqft).toLocaleString()} |\n`;
      if (subjectPrice && estimatedValue) {
        const diff = subjectPrice - estimatedValue;
        const pct = ((diff / estimatedValue) * 100).toFixed(1);
        if (diff > 0) {
          report += `| List vs Estimate | +$${diff.toLocaleString()} (+${pct}%) — **Over estimated value** |\n`;
        } else if (diff < 0) {
          report += `| List vs Estimate | -$${Math.abs(diff).toLocaleString()} (${pct}%) — **Under estimated value** |\n`;
        }
      }

      setCmaReport(report);
    } catch (e) {
      console.error("CMA Report error:", e);
      setCmaReport("Error generating CMA report: " + e.message + "\n\nPlease try again.");
    }
    setCmaLoading(false);
  };

  // *** VOICE MODE: Core functions ***
  const stripMarkdown = (text) => {
    if (!text) return "";
    let clean = text;
    clean = clean.replace(/\{\{IMG:.*?\}\}/g, '');
    clean = clean.replace(/━+/g, '');
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
    clean = clean.replace(/\*(.*?)\*/g, '$1');
    clean = clean.replace(/#{1,4}\s*/g, '');
    clean = clean.replace(/\|[^|]+\|/g, '');
    clean = clean.replace(/[-]{3,}/g, '');
    clean = clean.replace(/[🏠🏢🏗️📸💰📊📈📍🍽️🏫🏥💪🌳🏛️🗺️📅🎯📝✅🎥👋🔒🔗✓●🟢🟡🟠🔴]/g, '');
    clean = clean.replace(/\n{2,}/g, '. ');
    clean = clean.replace(/\n/g, '. ');
    clean = clean.replace(/\.\s*\.\s*/g, '. ');
    clean = clean.replace(/\s{2,}/g, ' ');
    return clean.trim();
  };

  const speakText = useCallback((text) => {
    if (!text || !voiceModeRef.current) return;
    const synth = speechSynthRef.current;
    synth.cancel(); // stop any ongoing speech

    const clean = stripMarkdown(text);
    if (!clean || clean.length < 3) return;

    // Split into chunks (speechSynthesis has a ~200 char limit on some browsers)
    const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > 180) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current) chunks.push(current.trim());

    setIsSpeaking(true);

    // Pick a good voice
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.name.includes("Google US English")) ||
      voices.find(v => v.name.includes("Samantha")) ||
      voices.find(v => v.lang.startsWith("en") && v.localService) ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];

    chunks.forEach((chunk, i) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (preferred) utterance.voice = preferred;

      if (i === chunks.length - 1) {
        utterance.onend = () => {
          setIsSpeaking(false);
          // Auto-listen after AI finishes speaking (full duplex)
          if (voiceModeRef.current) {
            setTimeout(() => {
              if (voiceModeRef.current && !loading) {
                startVoiceListening();
              }
            }, 500);
          }
        };
      }
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    });
  }, [loading]);

  const stopSpeaking = () => {
    speechSynthRef.current.cancel();
    setIsSpeaking(false);
  };

  const toggleVoiceMode = () => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    voiceModeRef.current = newMode;
    if (!newMode) {
      // Turning off — stop everything
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setListening(false);
      }
    } else {
      // Turning on — start listening immediately
      startVoiceListening();
    }
  };

  const startVoiceListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      // Auto-send after voice input in voice mode
      if (voiceModeRef.current) {
        setTimeout(() => {
          document.getElementById('realtyai-send-btn')?.click();
        }, 300);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // Load voices (some browsers load them async)
  useEffect(() => {
    const loadVoices = () => speechSynthRef.current.getVoices();
    loadVoices();
    if (speechSynthRef.current.onvoiceschanged !== undefined) {
      speechSynthRef.current.onvoiceschanged = loadVoices;
    }
    // Cleanup: stop speech on unmount
    return () => speechSynthRef.current.cancel();
  }, []);

  if (!user) return (
    <>
      <style>{globalCSS}</style>
      <RegistrationScreen onLogin={async (userData) => {
        setUser(userData);
        localStorage.setItem('realtyai_user', JSON.stringify(userData));
        try {
          const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(userData.email)}&select=plan,search_count,search_reset_date,profile_photo_url,listing_count,offer_count,approval_count,search_history`, { method: "GET" });
          if (data && data.length > 0) {
            setUserPlan(data[0].plan || "free");
            // Load profile photo
            setProfilePhoto(data[0].profile_photo_url || null);
            // Load all counts
            setListingCount(data[0].listing_count || 0);
            setOfferCount(data[0].offer_count || 0);
            setApprovalCount(data[0].approval_count || 0);
            // Load search history
            if (data[0].search_history) {
              try { setSearchHistory(JSON.parse(data[0].search_history)); } catch { setSearchHistory([]); }
            } else {
              setSearchHistory([]);
            }
            // Monthly search count reset
            const resetDate = new Date(data[0].search_reset_date || Date.now());
            const now = new Date();
            if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
              setSearchCount(0);
              await supabaseRequest(`/users?email=eq.${encodeURIComponent(userData.email)}`, {
                method: "PATCH", body: JSON.stringify({ search_count: 0, search_reset_date: now.toISOString() }),
              });
            } else {
              setSearchCount(data[0].search_count || 0);
            }
          }
        } catch (e) { console.error("Plan fetch error:", e); }
        const params = new URLSearchParams(window.location.search);
        if (params.get("upgraded") === "true") {
          setUserPlan("plus");
          window.history.replaceState({}, "", window.location.pathname);
        }
      }} />
    </>
  );

  return (
    <>
      <style>{globalCSS}</style>
      {/* *** SIDEBAR CHANGE: Outer wrapper is now flex ROW instead of flex COLUMN *** */}
      <div style={{ height: "100vh", display: "flex", flexDirection: "row", fontFamily: theme.font }}>

        {/* *** SIDEBAR: Mobile overlay backdrop *** */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)", zIndex: 9999,
            }}
          />
        )}

        {/* ═══ SIDEBAR ═══ */}
        <aside
          className={`sidebar-panel ${sidebarOpen ? 'open' : ''}`}
          style={{
            width: 250, height: "100vh", background: theme.sidebarBg,
            borderRight: `1px solid ${theme.sidebarBorder}`,
            display: "flex", flexDirection: "column", flexShrink: 0,
            zIndex: 10001,
          }}
        >
          {/* Brand Header */}
          <div style={{
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: `1px solid ${theme.sidebarBorder}`,
          }}>
            <img src="/logo.png" alt="Realty AI" style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: ".2px" }}>Realty AI</div>
              <div style={{ fontSize: 10.5, color: theme.sidebarTextMuted }}>AI Real Estate Assistant</div>
            </div>
          </div>

          {/* User Account Card */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.sidebarBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="" style={{
                  width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
                  border: "1.5px solid rgba(255,255,255,0.12)", flexShrink: 0,
                }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 13, flexShrink: 0,
                  border: "1.5px solid rgba(255,255,255,0.1)",
                }}>{userInitials}</div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "#fff" }}>{user.name || "User"}</div>
                <div style={{ fontSize: 11, color: theme.sidebarTextMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "Searches", value: searchCount },
                { label: "Approvals", value: approvalCount },
                { label: "Listings", value: listingCount },
                { label: "Offers", value: offerCount },
              ].map((stat, i) => (
                <div key={i} onClick={() => { setSidebarOpen(false); setShowSearchHistory(true); }} style={{
                  flex: 1, background: theme.sidebarCardBg, border: `1px solid ${theme.sidebarCardBorder}`,
                  borderRadius: 8, padding: "7px 6px", textAlign: "center", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.sidebarCardBg}
                >
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{stat.value}</div>
                  <div style={{ fontSize: 9, color: theme.sidebarTextMuted, letterSpacing: ".3px", marginTop: 1 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agents */}
          <div style={{ padding: "14px 16px", flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "1.5px", color: theme.sidebarTextDim, marginBottom: 12,
            }}>Agents</div>
            {[
              { icon: Icons.agentSell, label: "Sell your property", agent: "listing" },
              { icon: Icons.agentOffer, label: "Submit an offer", agent: "offer" },
              { icon: Icons.agentApproved, label: "Get approved", agent: "mortgage" },
              { icon: Icons.agentLive, label: "Live stream", agent: "live" },
              { icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" stroke="#E31837" strokeWidth="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="#E31837" strokeWidth="1.5" opacity="0.5"/></svg>, label: "CMA Report", agent: "cma" },
            ].map((item, i) => (
              <div key={i} onClick={() => handleAgentClick(item.agent)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                cursor: "pointer", transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                {item.icon}
                <span style={{ fontSize: 14, fontWeight: 500, color: theme.sidebarText }}>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ═══ MAIN CONTENT COLUMN (header + chat + input) ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: theme.offWhite, minWidth: 0 }}>

          {/* Header */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 24px", background: theme.white,
            borderBottom: `1px solid ${theme.greyLight}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile hamburger */}
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                background: "none", border: "none", cursor: "pointer", color: theme.dark,
                padding: 4, display: "flex",
              }}>{Icons.menu}</button>
              <img src="/logo.png" alt="Realty AI" style={{
                width: 42, height: 42, borderRadius: 12,
                boxShadow: "0 3px 10px rgba(227,24,55,0.2)",
              }} />
              <div>
                <h1 style={{ fontFamily: theme.fontDisplay, fontSize: 20, fontWeight: 700, color: theme.dark, lineHeight: 1.2 }}>
                  Realty AI
                </h1>
                <p style={{ fontSize: 11, color: theme.grey, fontWeight: 500 }}>AI Real Estate Assistant</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }} ref={dropdownRef}>
              {/* New Search button */}
              <button onClick={() => {
                setMessages([{
                  role: "assistant", type: "rich",
                  content: `👋 **Welcome to Realty AI, ${user.name || "there"}!**\n\nI'm your AI-powered real estate assistant. I can help you:\n\n🏠 **Residential** — Search homes on Zillow, Realtor.com, Redfin & Homes.com\n🏢 **Commercial** — Find spaces on LoopNet, Crexi & BizBuySell\n🏗️ **New Construction** — Browse brand new homes\n\nJust tell me what you're looking for! For example:\n• *"3 bedroom homes in San Diego under $800K"*\n• *"Restaurant space for lease in Miami"*\n• *"New construction homes in Austin, TX"*`,
                }]);
                setInput("");
                setLoading(false);
              }} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", background: "transparent",
                border: `1.5px solid ${theme.greyLight}`, borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: theme.font, color: theme.grey,
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.red; e.currentTarget.style.color = theme.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.greyLight; e.currentTarget.style.color = theme.grey; }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                New Search
              </button>
              {/* Plan badge */}
              {userPlan === "plus" && (
                <div style={{
                  fontSize: 10, fontWeight: 700, background: "#4CAF50", color: "#fff",
                  padding: "3px 10px", borderRadius: 4, letterSpacing: ".4px", textTransform: "uppercase",
                }}>PLUS</div>
              )}
              {/* Email dropdown trigger */}
              <span
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                style={{ fontSize: 13, color: theme.grey, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {user.email} {Icons.chevronDown}
              </span>

              {/* *** Account Dropdown *** */}
              {showAccountDropdown && (
                <div style={{
                  position: "absolute", top: 36, right: 0, width: 240,
                  background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden",
                  animation: "fadeUp 0.15s ease-out",
                }}>
                  {/* Profile section */}
                  <div style={{
                    padding: 14, borderBottom: "1px solid #f0f0f0",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{ position: "relative" }}>
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="" style={{
                          width: 42, height: 42, borderRadius: "50%", objectFit: "cover",
                          border: "1.5px solid #e5e5e5",
                        }} />
                      ) : (
                        <div style={{
                          width: 42, height: 42, borderRadius: "50%", background: "#f0f0f0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#999", fontWeight: 700, fontSize: 14, border: "1.5px solid #e5e5e5",
                        }}>{userInitials}</div>
                      )}
                      <label style={{
                        position: "absolute", bottom: -2, right: -2,
                        width: 18, height: 18, background: theme.red, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff", cursor: "pointer",
                      }}>
                        {Icons.plusSmall}
                        <input type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
                      </label>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "#333" }}>{user.name || "User"}</div>
                      <div style={{ fontSize: 11, color: theme.red, cursor: "pointer" }}>Upload photo</div>
                    </div>
                  </div>
                  {/* Menu items */}
                  <div style={{ padding: 4 }}>
                    {[
                      { icon: Icons.subscription, label: "Manage subscription", action: () => setShowUpgradeModal(true) },
                      { icon: Icons.searchHistory, label: "Search history", action: () => setShowSearchHistory(true) },
                      { icon: Icons.settings, label: "Account settings", action: () => { setEditName(user.name || ""); setShowAccountSettings(true); } },
                    ].map((item, i) => (
                      <div key={i} onClick={() => { setShowAccountDropdown(false); item.action && item.action(); }} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#444",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >{item.icon} {item.label}</div>
                    ))}
                  </div>
                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid #f0f0f0", padding: 4 }}>
                    <div onClick={() => {
                      localStorage.removeItem('realtyai_user');
                      setProfilePhoto(null);
                      setSearchHistory([]);
                      setSearchCount(0);
                      setListingCount(0);
                      setOfferCount(0);
                      setApprovalCount(0);
                      setUserPlan("free");
                      setEditPhone("");
                      setEditLocation("");
                      setUser(null); setMessages([]); setShowAccountDropdown(false);
                    }} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                      borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#e74c3c",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >{Icons.logout} Sign out</div>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Chat Area — UNCHANGED */}
          <div ref={chatRef} style={{
            flex: 1, overflowY: "auto", padding: "24px 20px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} index={i} profilePhoto={profilePhoto} userInitials={userInitials} />
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 12, maxWidth: 820, margin: "0 auto", animation: "fadeUp 0.3s ease-out" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                  background: theme.red, display: "flex", alignItems: "center", justifyContent: "center", color: theme.white,
                }}>{Icons.bot}</div>
                <div style={{
                  background: theme.white, padding: "14px 18px", borderRadius: 16,
                  borderTopLeftRadius: 4, boxShadow: theme.shadow,
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Attachments Preview — UNCHANGED */}
          {attachments.length > 0 && (
            <div style={{
              padding: "8px 24px", background: theme.white, borderTop: `1px solid ${theme.greyLight}`,
              display: "flex", gap: 8, flexWrap: "wrap",
            }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6, background: "#FEF2F2",
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, color: theme.dark,
                }}>
                  {Icons.file} {a.name}
                  <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} style={{
                    background: "none", border: "none", cursor: "pointer", color: theme.red, fontSize: 16, lineHeight: 1,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar — UNCHANGED */}
          <div style={{
            padding: "16px 20px", background: theme.white,
            borderTop: `1px solid ${theme.greyLight}`,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              maxWidth: 820, margin: "0 auto", display: "flex", gap: 10, alignItems: "center",
            }}>
              <button onClick={() => fileRef.current?.click()} style={{
                width: 42, height: 42, borderRadius: 12, border: `2px solid ${theme.greyLight}`,
                background: theme.white, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: theme.grey,
                flexShrink: 0, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.red; e.currentTarget.style.color = theme.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.greyLight; e.currentTarget.style.color = theme.grey; }}
              >
                {Icons.plus}
              </button>
              <input ref={fileRef} type="file" multiple hidden
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFiles} />

              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Search properties... (e.g., 3 bed homes in San Diego)"
                  style={{
                    width: "100%", padding: "13px 52px 13px 18px",
                    border: `2px solid ${theme.greyLight}`, borderRadius: 14,
                    fontSize: 15, fontFamily: theme.font, outline: "none",
                    transition: "border-color 0.2s", background: theme.offWhite,
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.red}
                  onBlur={(e) => e.target.style.borderColor = theme.greyLight}
                />
                <button onClick={toggleVoice} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: listening ? theme.red : theme.grey,
                  animation: listening ? "pulse 1s infinite" : "none",
                }}>
                  {listening ? Icons.micActive : Icons.mic}
                </button>
              </div>

              <button id="realtyai-send-btn" onClick={handleSend} disabled={loading} style={{
                width: 48, height: 48, borderRadius: 14, border: "none",
                background: theme.red, color: theme.white, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 3px 12px rgba(227,24,55,0.25)",
                transition: "all 0.2s", opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = theme.redDark; }}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.red}
              >
                {loading ? Icons.spinner : Icons.send}
              </button>
            </div>

            {/* *** VOICE MODE: Toggle + Status Bar *** */}
            <div style={{
              maxWidth: 820, margin: "4px auto 0", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}>
              <button onClick={toggleVoiceMode} title={voiceMode ? "Turn off voice mode" : "Turn on voice mode"} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                background: voiceMode ? "rgba(227,24,55,0.08)" : "transparent",
                border: `1.5px solid ${voiceMode ? theme.red : theme.greyLight}`,
                borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: theme.font, transition: "all 0.2s",
                color: voiceMode ? theme.red : theme.grey,
              }}
              onMouseEnter={(e) => { if (!voiceMode) { e.currentTarget.style.borderColor = theme.red; e.currentTarget.style.color = theme.red; } }}
              onMouseLeave={(e) => { if (!voiceMode) { e.currentTarget.style.borderColor = theme.greyLight; e.currentTarget.style.color = theme.grey; } }}
              >
                {voiceMode ? Icons.voiceOn : Icons.voiceOff}
                {voiceMode ? "Voice On" : "Voice Mode"}
              </button>

              {/* Speaking indicator + stop button */}
              {isSpeaking && (
                <button onClick={stopSpeaking} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  background: "rgba(227,24,55,0.08)", border: `1.5px solid ${theme.red}`,
                  borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  fontFamily: theme.font, color: theme.red, animation: "pulse 1.5s infinite",
                }}>
                  {Icons.stopSpeaking} Stop
                </button>
              )}

              {/* Listening indicator */}
              {voiceMode && listening && !isSpeaking && (
                <span style={{
                  fontSize: 12, color: theme.red, fontWeight: 600,
                  animation: "pulse 1s infinite", display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.red, display: "inline-block" }}></span>
                  Listening...
                </span>
              )}
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#999", marginTop: 8 }}>
              Realty AI searches Zillow, Realtor.com, Redfin, Homes.com, LoopNet, Crexi & BizBuySell
              {userPlan === "free" && (
                <span style={{ display: "block", marginTop: 2, color: searchCount >= 40 ? theme.red : "#999" }}>
                  {50 - searchCount} searches remaining this month · <button onClick={() => setShowUpgradeModal(true)} style={{ background: "none", border: "none", color: theme.red, cursor: "pointer", fontFamily: theme.font, fontSize: 11, fontWeight: 600, textDecoration: "underline" }}>Upgrade to Plus</button>
                </span>
              )}
              {userPlan === "plus" && (
                <span style={{ display: "block", marginTop: 2, color: "#27ae60" }}>
                  ✓ Realty AI Plus — Unlimited searches
                </span>
              )}
            </p>
          </div>
        </div>{/* END main content column */}
      </div>{/* END outer flex row */}

      {/* Mortgage Agent Overlay — UNCHANGED */}
      {showMortgageAgent && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMortgageAgent(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 1200,
            height: window.innerWidth <= 768 ? '100%' : '92vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Get Approved!</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { const iframe = document.querySelector('iframe[title="Mortgage Application"]'); if (iframe) { iframe.contentWindow.postMessage('RESET_AGENT', '*'); iframe.src = iframe.src; } }} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: theme.red, minHeight: 32, whiteSpace: 'nowrap' }}>🔄 Start Over</button>
                <button onClick={() => setShowMortgageAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 32, whiteSpace: 'nowrap' }}>✕ Close</button>
              </div>
            </div>
            <iframe src="/mortgage-agent.html" style={{ width: '100%', height: 'calc(100% - 49px)', border: 'none' }} title="Mortgage Application" />
          </div>
        </div>
      )}

      {/* Offer Agent Overlay — UNCHANGED */}
      {showOfferAgent && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowOfferAgent(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 1200,
            height: window.innerWidth <= 768 ? '100%' : '92vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Submit an Offer</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { if (offerIframeRef.current) { offerIframeRef.current.contentWindow.postMessage('RESET_AGENT', '*'); offerIframeRef.current.src = offerIframeRef.current.src; } }} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: theme.red, minHeight: 32, whiteSpace: 'nowrap' }}>🔄 Start Over</button>
                <button onClick={() => setShowOfferAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 32, whiteSpace: 'nowrap' }}>✕ Close</button>
              </div>
            </div>
            <iframe ref={offerIframeRef} src="/offer-agent.html" style={{ width: '100%', height: 'calc(100% - 49px)', border: 'none' }} title="Submit an Offer" />
          </div>
        </div>
      )}

      {/* Listing Agent Overlay — UNCHANGED */}
      {showListingAgent && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowListingAgent(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 1200,
            height: window.innerWidth <= 768 ? '100%' : '92vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Sell Your Property</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { if (listingIframeRef.current) { listingIframeRef.current.contentWindow.postMessage('RESET_AGENT', '*'); listingIframeRef.current.src = listingIframeRef.current.src; } }} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: theme.red, minHeight: 32, whiteSpace: 'nowrap' }}>🔄 Start Over</button>
                <button onClick={() => setShowListingAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 32, whiteSpace: 'nowrap' }}>✕ Close</button>
              </div>
            </div>
            <iframe ref={listingIframeRef} src="/listing-agent.html" style={{ width: '100%', height: 'calc(100% - 49px)', border: 'none' }} title="Sell Your Property" />
          </div>
        </div>
      )}

      {/* Tour Agent Overlay — UNCHANGED */}
      {showTourAgent && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTourAgent(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 1200,
            height: window.innerWidth <= 768 ? '100%' : '92vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Schedule a Tour</span>
              </div>
              <button onClick={() => setShowTourAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555', minHeight: 36 }}>✕ Close</button>
            </div>
            <iframe ref={tourIframeRef} src="/schedule-tour.html" style={{ width: '100%', height: 'calc(100% - 49px)', border: 'none' }} title="Schedule a Tour" />
          </div>
        </div>
      )}

      {/* *** CMA REPORT PANEL *** */}
      {showCMAPanel && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCMAPanel(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 1000,
            height: window.innerWidth <= 768 ? '100%' : '92vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: '#fff', borderBottom: '1px solid #E5E7EB',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.red, fontFamily: theme.font }}>
                  📊 CMA Report
                </span>
              </div>
              <button onClick={() => setShowCMAPanel(false)} style={{
                background: 'none', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: theme.font, color: '#555', minHeight: 32,
              }}>✕ Close</button>
            </div>

            {/* Address Input */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0,
            }}>
              <input
                value={cmaAddress}
                onChange={(e) => setCmaAddress(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && cmaAddress.trim()) { setCmaReport(""); setCmaLoading(true); generateCMAReport(cmaAddress.trim()); } }}
                placeholder="Enter property address (e.g., 123 Main St, Las Vegas, NV 89141)"
                style={{
                  flex: 1, padding: '12px 16px', border: '2px solid #E5E7EB', borderRadius: 10,
                  fontSize: 14, fontFamily: theme.font, outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                onClick={() => { if (cmaAddress.trim()) { setCmaReport(""); setCmaLoading(true); generateCMAReport(cmaAddress.trim()); } }}
                disabled={cmaLoading || !cmaAddress.trim()}
                style={{
                  padding: '12px 20px', background: theme.red, color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: cmaLoading ? 'not-allowed' : 'pointer', fontFamily: theme.font,
                  opacity: cmaLoading || !cmaAddress.trim() ? 0.6 : 1,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {cmaLoading ? 'Generating...' : 'Generate CMA'}
              </button>
            </div>

            {/* Report Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Loading State */}
              {cmaLoading && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ marginBottom: 16 }}>{Icons.spinner}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.dark, fontFamily: theme.fontDisplay, marginBottom: 8 }}>
                    Generating CMA Report
                  </h3>
                  <p style={{ fontSize: 14, color: theme.grey, marginBottom: 4 }}>
                    Searching comparable sales, active listings, and market data...
                  </p>
                  <p style={{ fontSize: 12, color: '#bbb' }}>
                    This may take 10-15 seconds
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    {['Comps', 'Active Listings', 'Market Trends', 'AI Analysis'].map((step, i) => (
                      <div key={i} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(227,24,55,0.08)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          animation: `pulse 1.5s infinite`, animationDelay: `${i * 0.3}s`,
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.red }} />
                        </div>
                        <span style={{ fontSize: 10, color: theme.grey }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State (no address yet, opened from sidebar) */}
              {!cmaLoading && !cmaReport && !cmaAddress && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📊</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.dark, fontFamily: theme.fontDisplay, marginBottom: 8 }}>
                    Comparative Market Analysis
                  </h3>
                  <p style={{ fontSize: 14, color: theme.grey, lineHeight: 1.6 }}>
                    Enter a property address above to generate a professional CMA report with comparable sales, active listings, market trends, and an AI-powered value estimate.
                  </p>
                </div>
              )}

              {/* Report Rendered */}
              {!cmaLoading && cmaReport && (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(227,24,55,0.05), rgba(227,24,55,0.02))',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 20,
                    border: '1px solid rgba(227,24,55,0.1)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>📊</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: theme.red }}>CMA Report</span>
                    </div>
                    <span style={{ fontSize: 13, color: theme.dark, fontWeight: 600 }}>{cmaAddress}</span>
                    <span style={{ fontSize: 11, color: theme.grey, display: 'block', marginTop: 4 }}>
                      Generated {new Date().toLocaleDateString()} · Powered by Firecrawl + Claude AI
                    </span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: theme.dark }}>
                    <RichContent content={cmaReport} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 20px', borderTop: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>
                Data sourced from Zillow, Redfin, Realtor.com · For informational purposes only
              </span>
              {cmaReport && (
                <button onClick={() => { setCmaReport(""); setCmaLoading(true); generateCMAReport(cmaAddress); }} style={{
                  padding: '6px 14px', background: 'transparent', border: '1px solid #E5E7EB',
                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: theme.font, color: theme.grey,
                }}>🔄 Regenerate</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* *** ACCOUNT SETTINGS MODAL *** */}
      {showAccountSettings && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 12px 20px', overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAccountSettings(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 480, width: '100%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s ease-out',
            overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.dark, fontFamily: theme.fontDisplay, margin: 0 }}>Account Settings</h2>
              <button onClick={() => setShowAccountSettings(false)} style={{
                background: 'none', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '4px 12px', fontSize: 13, cursor: 'pointer', color: '#555',
              }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Profile Photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e5e5' }} />
                  ) : (
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#999', fontWeight: 700, fontSize: 22, border: '2px solid #e5e5e5',
                    }}>{userInitials}</div>
                  )}
                  <label style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 24, height: 24, background: theme.red, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff', cursor: 'pointer',
                  }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    <input type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
                  </label>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: theme.dark }}>{user.name || "User"}</div>
                  <div style={{ fontSize: 12, color: theme.grey }}>{user.email}</div>
                </div>
              </div>

              {/* Editable Fields */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.dark, marginBottom: 4 }}>Full Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{
                  width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 10,
                  fontSize: 14, fontFamily: theme.font, outline: 'none',
                }} onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.dark, marginBottom: 4 }}>Email</label>
                <input value={user.email} disabled style={{
                  width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 10,
                  fontSize: 14, fontFamily: theme.font, outline: 'none', background: '#f9f9f9', color: '#999',
                }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.dark, marginBottom: 4 }}>Phone</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(555) 123-4567" style={{
                  width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 10,
                  fontSize: 14, fontFamily: theme.font, outline: 'none',
                }} onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.dark, marginBottom: 4 }}>Location</label>
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Las Vegas, NV" style={{
                  width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 10,
                  fontSize: 14, fontFamily: theme.font, outline: 'none',
                }} onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
              </div>

              {/* Subscription Card */}
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
                padding: '14px 16px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.dark }}>Current Plan</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
                    background: userPlan === 'plus' ? '#4CAF50' : '#E5E7EB',
                    color: userPlan === 'plus' ? '#fff' : '#666',
                    textTransform: 'uppercase', letterSpacing: '.4px',
                  }}>{userPlan === 'plus' ? 'PLUS' : 'FREE'}</span>
                </div>
                {userPlan === 'plus' ? (
                  <p style={{ fontSize: 12, color: theme.grey, margin: 0 }}>Unlimited searches, all agents unlocked</p>
                ) : (
                  <button onClick={() => { setShowAccountSettings(false); setShowUpgradeModal(true); }} style={{
                    width: '100%', padding: 10, background: theme.red, color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: theme.font,
                  }}>Upgrade to Plus</button>
                )}
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => {
                  // Save name
                  const updated = { ...user, name: editName || user.name };
                  setUser(updated);
                  localStorage.setItem('realtyai_user', JSON.stringify(updated));
                  // Save phone & location
                  // phone saved in state
                  // location saved in state
                  // Update name in Supabase
                  if (editName && editName !== user.name) {
                    supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}`, {
                      method: "PATCH", body: JSON.stringify({ name: editName }),
                    }).catch(() => {});
                  }
                  setShowAccountSettings(false);
                }} style={{
                  flex: 1, padding: 12, background: theme.red, color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: theme.font,
                }}>Save Changes</button>
                <button onClick={() => setShowAccountSettings(false)} style={{
                  flex: 1, padding: 12, background: 'transparent', color: theme.grey,
                  border: `1px solid ${theme.greyLight}`, borderRadius: 10, fontSize: 14,
                  cursor: 'pointer', fontFamily: theme.font,
                }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* *** SEARCH HISTORY MODAL *** */}
      {showSearchHistory && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 12px 20px', overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearchHistory(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s ease-out',
            overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.dark, fontFamily: theme.fontDisplay, margin: 0 }}>Search History</h2>
              <button onClick={() => setShowSearchHistory(false)} style={{
                background: 'none', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '4px 12px', fontSize: 13, cursor: 'pointer', color: '#555',
              }}>✕</button>
            </div>

            {/* Stats summary */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
              {[
                { label: 'Searches', value: searchCount, color: theme.red },
                { label: 'Approvals', value: approvalCount, color: '#3498DB' },
                { label: 'Listings', value: listingCount, color: '#8E44AD' },
                { label: 'Offers', value: offerCount, color: '#27AE60' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: '#f9f9f9', borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: theme.grey, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {searchHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.grey }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>🔍</div>
                  <p style={{ fontSize: 14 }}>No searches yet this session.</p>
                  <p style={{ fontSize: 12, color: '#bbb' }}>Your searches will appear here as you use Realty AI.</p>
                </div>
              ) : (
                searchHistory.map((s, i) => (
                  <div key={i} onClick={() => {
                    setShowSearchHistory(false);
                    setInput(s.query);
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px',
                    borderBottom: '1px solid #f5f5f5', cursor: 'pointer', borderRadius: 8,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: s.type === 'Commercial' ? 'rgba(52,152,219,0.1)' : s.type === 'New Construction' ? 'rgba(46,204,113,0.1)' : 'rgba(227,24,55,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {s.type === 'Commercial' ? '🏢' : s.type === 'New Construction' ? '🏗️' : '🏠'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: theme.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.query}</div>
                      <div style={{ fontSize: 11, color: theme.grey, marginTop: 2 }}>
                        {s.type} · {s.resultCount} results · {new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* *** AMENITY PANEL OVERLAY *** */}
      {showAmenityPanel && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAmenityPanel(false); }}
        >
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '95%',
            maxWidth: window.innerWidth <= 768 ? '100%' : 900,
            height: window.innerWidth <= 768 ? '100%' : '88vh',
            background: '#fff',
            borderRadius: window.innerWidth <= 768 ? 0 : '16px 16px 0 0',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', background: '#fff', borderBottom: '1px solid #E5E7EB',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="Realty AI" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: amenityConfig[amenityType]?.color || theme.dark, fontFamily: theme.font }}>
                  {amenityConfig[amenityType]?.emoji} {amenityConfig[amenityType]?.label || 'Amenities'}
                </span>
                <span style={{ fontSize: 12, color: theme.grey, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  near {amenityAddress}
                </span>
              </div>
              <button onClick={() => setShowAmenityPanel(false)} style={{
                background: 'none', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: theme.font, color: '#555', minHeight: 32,
              }}>✕ Close</button>
            </div>

            {/* Panel Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
              {/* ─── MAP PANEL ─── */}
              {amenityType === 'map' && (
                <div style={{ width: '100%', height: '100%' }}>
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}&q=${encodeURIComponent(amenityAddress)}&zoom=15&maptype=roadmap`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Property Map"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}

              {/* ─── COUNTY ASSESSOR PANEL ─── */}
              {amenityType === 'assessor' && (
                <div style={{ padding: 24 }}>
                  <div style={{
                    background: '#F8F9FA', borderRadius: 16, padding: 28, textAlign: 'center',
                    border: '1px solid #E5E7EB', marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: theme.dark, fontFamily: theme.fontDisplay, marginBottom: 8 }}>
                      County Assessor Records
                    </h3>
                    <p style={{ fontSize: 14, color: theme.grey, marginBottom: 20, lineHeight: 1.6 }}>
                      Look up property tax records, assessed values, ownership history, and parcel information for:
                    </p>
                    <div style={{
                      background: '#fff', borderRadius: 10, padding: '12px 18px',
                      border: '1px solid #E5E7EB', fontSize: 15, fontWeight: 600,
                      color: theme.dark, marginBottom: 24,
                    }}>
                      {amenityAddress}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, margin: '0 auto' }}>
                      <a
                        href={`https://sandgate.co.clark.nv.us/assrrealprop/default.aspx`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '14px 20px', background: theme.red, color: '#fff',
                          borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                          boxShadow: '0 3px 12px rgba(227,24,55,0.25)', transition: 'all 0.2s',
                        }}
                      >
                        🏛️ Clark County Assessor (NV)
                      </a>
                      <a
                        href={`https://www.google.com/search?q=county+assessor+${encodeURIComponent(amenityAddress)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '14px 20px', background: '#fff', color: theme.dark,
                          borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                          border: '2px solid #E5E7EB', transition: 'all 0.2s',
                        }}
                      >
                        🔍 Search County Assessor for this Address
                      </a>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
                    County assessor records are public information. Data varies by county jurisdiction.
                  </p>
                </div>
              )}

              {/* ─── PLACES RESULTS (Restaurants, Schools, Hospitals, Gyms, Parks) ─── */}
              {amenityType !== 'map' && amenityType !== 'assessor' && (
                <div style={{ padding: 16 }}>
                  {/* Mini map at top */}
                  {amenityCenter && (
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/search?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}&q=${encodeURIComponent(amenityConfig[amenityType]?.label || amenityType)}+near+${encodeURIComponent(amenityAddress)}&zoom=13`}
                        style={{ width: '100%', height: 200, border: 'none' }}
                        title="Amenity Map"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Loading state */}
                  {amenityLoading && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ marginBottom: 12 }}>{Icons.spinner}</div>
                      <p style={{ fontSize: 14, color: theme.grey }}>
                        Searching for {amenityConfig[amenityType]?.label?.toLowerCase() || 'places'} near this property...
                      </p>
                    </div>
                  )}

                  {/* Results */}
                  {!amenityLoading && amenityResults.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 13, color: theme.grey, fontWeight: 600, padding: '0 4px 8px', borderBottom: '1px solid #f0f0f0' }}>
                        {amenityResults.length} {amenityConfig[amenityType]?.label?.toLowerCase() || 'places'} found nearby
                      </div>
                      {amenityResults.map((place, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: 12, padding: '14px 8px',
                          borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start',
                          animation: 'fadeUp 0.3s ease-out',
                          animationDelay: `${i * 0.04}s`, animationFillMode: 'backwards',
                        }}>
                          {/* Photo or Emoji Placeholder */}
                          {place.photoUrl ? (
                            <img src={place.photoUrl} alt={place.name} style={{
                              width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }} />
                          ) : (
                            <div style={{
                              width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                              background: `${amenityConfig[amenityType]?.color || theme.red}12`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 26,
                            }}>
                              {amenityConfig[amenityType]?.emoji || '📍'}
                            </div>
                          )}

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <h4 style={{ fontSize: 14.5, fontWeight: 600, color: theme.dark, margin: 0, lineHeight: 1.3 }}>
                                {place.name}
                              </h4>
                              <span style={{
                                fontSize: 12, color: amenityConfig[amenityType]?.color || theme.red,
                                fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                              }}>
                                {place.distance} mi
                              </span>
                            </div>
                            <p style={{ fontSize: 12.5, color: theme.grey, margin: '3px 0 6px', lineHeight: 1.3 }}>
                              {place.address}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              {/* Rating */}
                              {place.rating && (
                                <span style={{ fontSize: 12, color: '#F39C12', fontWeight: 600 }}>
                                  ★ {place.rating}
                                  <span style={{ color: '#bbb', fontWeight: 400, marginLeft: 3 }}>
                                    ({place.totalRatings})
                                  </span>
                                </span>
                              )}
                              {/* Price Level */}
                              {place.priceLevel !== null && place.priceLevel > 0 && (
                                <span style={{ fontSize: 12, color: '#27ae60', fontWeight: 600 }}>
                                  {'$'.repeat(place.priceLevel)}
                                </span>
                              )}
                              {/* Open/Closed */}
                              {place.isOpen !== null && (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                  background: place.isOpen ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                  color: place.isOpen ? '#27ae60' : '#e74c3c',
                                }}>
                                  {place.isOpen ? 'Open' : 'Closed'}
                                </span>
                              )}
                              {/* Directions Link */}
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ' + place.address)}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                  fontSize: 12, color: theme.red, fontWeight: 600,
                                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                                }}
                              >
                                📍 Directions
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {!amenityLoading && amenityResults.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.grey }}>
                      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>{amenityConfig[amenityType]?.emoji || '📍'}</div>
                      <p style={{ fontSize: 14, marginBottom: 8 }}>No {amenityConfig[amenityType]?.label?.toLowerCase() || 'places'} found nearby.</p>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(amenityConfig[amenityType]?.label || amenityType)}+near+${encodeURIComponent(amenityAddress)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: theme.red, fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Try searching on Google Maps →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Google Maps fallback */}
            {amenityType !== 'map' && amenityType !== 'assessor' && (
              <div style={{
                padding: '10px 20px', borderTop: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'center', flexShrink: 0,
              }}>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(amenityConfig[amenityType]?.label || amenityType)}+near+${encodeURIComponent(amenityAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: theme.grey, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  🗺️ View all on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal — UNCHANGED */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 12px 20px', overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s ease-out', overflow: 'hidden',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #E31837, #B71230)',
              padding: '28px 32px', color: '#fff', textAlign: 'center',
            }}>
              <img src="/logo.png" alt="Realty AI" style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: theme.fontDisplay, margin: 0 }}>Upgrade to Realty AI Plus</h2>
              <p style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Unlock the full power of AI-driven real estate</p>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 0, background: '#F3F4F6', borderRadius: 10, padding: 4, marginBottom: 24 }}>
                <button onClick={() => setUpgradeBillingCycle('monthly')} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: upgradeBillingCycle === 'monthly' ? '#fff' : 'transparent',
                  boxShadow: upgradeBillingCycle === 'monthly' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: theme.font,
                  color: upgradeBillingCycle === 'monthly' ? theme.dark : '#888',
                }}>Monthly — $29.95/mo</button>
                <button onClick={() => setUpgradeBillingCycle('yearly')} style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: upgradeBillingCycle === 'yearly' ? '#fff' : 'transparent',
                  boxShadow: upgradeBillingCycle === 'yearly' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: theme.font,
                  color: upgradeBillingCycle === 'yearly' ? theme.dark : '#888',
                }}>Annual — $25/mo</button>
              </div>
              {upgradeBillingCycle === 'yearly' && (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#27ae60', fontWeight: 600, marginTop: -16, marginBottom: 16 }}>
                  Save $59.40/year with annual billing
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { feature: 'Property searches', free: '50/month', plus: 'Unlimited' },
                  { feature: 'Mortgage Agent', free: '🔒', plus: '✅' },
                  { feature: 'Offer Agent (RPA)', free: '🔒', plus: '✅' },
                  { feature: 'Listing Agent', free: '🔒', plus: '✅' },
                  { feature: 'Document upload to Drive', free: '🔒', plus: '✅' },
                  { feature: 'PDF generation', free: '🔒', plus: '✅' },
                  { feature: 'Email notifications', free: '🔒', plus: '✅' },
                  { feature: 'Voice search', free: '✅', plus: '✅' },
                  { feature: 'Schedule a Tour', free: '✅', plus: '✅' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13,
                  }}>
                    <span style={{ color: theme.dark, fontWeight: 500 }}>{row.feature}</span>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <span style={{ width: 70, textAlign: 'center', color: '#999' }}>{row.free}</span>
                      <span style={{ width: 70, textAlign: 'center', color: '#27ae60', fontWeight: 600 }}>{row.plus}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 10, color: '#999', marginTop: -4 }}>
                  <span style={{ width: 70, textAlign: 'center' }}>FREE</span>
                  <span style={{ width: 70, textAlign: 'center', color: theme.red, fontWeight: 700 }}>PLUS</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/.netlify/functions/create-checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: user.email, name: user.name, plan: upgradeBillingCycle }),
                    });
                    const data = await res.json();
                    if (data.url) window.open(data.url, '_blank');
                    else alert('Error creating checkout session. Please try again.');
                  } catch (e) {
                    console.error('Checkout error:', e);
                    alert('Error connecting to payment system. Please try again.');
                  }
                }}
                style={{
                  width: '100%', padding: 16, background: theme.red, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  fontFamily: theme.font, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(227,24,55,0.3)', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#B71230'}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.red}
              >
                {upgradeBillingCycle === 'yearly' ? 'Upgrade — $300/year ($25/mo)' : 'Upgrade — $29.95/month'}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  width: '100%', padding: 12, background: 'transparent', color: '#999',
                  border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: theme.font, marginTop: 8,
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
