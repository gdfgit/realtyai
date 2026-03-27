import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG & CONSTANTS ───────────────────────────────────────────────
const SUPABASE_URL = "https://guqytcsovjqmbomyacyd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RBY52Obs_adPGMsKM3bMjA_ifz6WF2H";
const EMAILJS_SERVICE_ID = "service_rh6uozl";
const EMAILJS_TEMPLATE_ID = "template_b6xnvkj";
const EMAILJS_PUBLIC_KEY = "xElMdZFRvZqh8-bIw";
const TAVILY_API_KEY = "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";

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

// ─── TAVILY SEARCH ────────────────────────────────────────────────────
async function tavilySearch(query) {
  if (DEMO_MODE) {
    return generateDemoResults(query);
  }
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      include_images: true,
      max_results: 8,
    }),
  });
  return res.json();
}

// ─── FETCH DAILY MORTGAGE RATE ────────────────────────────────────────
async function fetchMortgageRate() {
  try {
    const res = await tavilySearch("today's 30 year fixed mortgage rate MND daily mortgage rate index");
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

// ─── MORTGAGE CALCULATOR ──────────────────────────────────────────────
function calculateMortgage(price, rate, downPct) {
  const downPayment = price * (downPct / 100);
  const loanAmount = price - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numPayments = 30 * 12;
  const monthlyPI = monthlyRate > 0 ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1) : loanAmount / numPayments;
  const monthlyTax = (price * 0.0125) / 12;
  const hoa = 250;
  return {
    downPayment: Math.round(downPayment),
    principal: Math.round(monthlyPI * 0.3),
    interest: Math.round(monthlyPI * 0.7),
    taxes: Math.round(monthlyTax),
    hoa,
    total: Math.round(monthlyPI + monthlyTax + hoa),
    loanAmount: Math.round(loanAmount),
  };
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
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentCode, setSentCode] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
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
        body: JSON.stringify({ email, password, name, verification_code: vCode, verified: false }),
      });
      await sendVerificationEmail(email, vCode);
      setMode("verify");
    } catch (e) { setError("Registration failed. Try again."); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (DEMO_MODE) {
      if (code === sentCode) { onLogin({ email, name }); }
      else { setError("Invalid code. Try again."); }
      return;
    }
    setLoading(true); setError("");
    try {
      const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(email)}&verification_code=eq.${code}`, { method: "GET" });
      if (data && data.length > 0) {
        await supabaseRequest(`/users?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ verified: true }) });
        onLogin({ email, name: data[0].name || name });
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
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Full Name</label>
                <input style={inputStyle} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = theme.red}
                  onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = theme.red}
                onBlur={(e) => e.target.style.borderColor = theme.greyLight} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.dark, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
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
function ChatMessage({ msg, index }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex", gap: 12, maxWidth: 820, margin: "0 auto",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeUp 0.35s ease-out", animationDelay: `${index * 0.05}s`,
      animationFillMode: "backwards", padding: "4px 0",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: isUser ? theme.dark : theme.red,
        display: "flex", alignItems: "center", justifyContent: "center", color: theme.white,
        boxShadow: isUser ? "none" : "0 3px 12px rgba(227,24,55,0.2)",
      }}>
        {isUser ? Icons.user : Icons.bot}
      </div>
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

// ─── CLEAN TAVILY CONTENT ─────────────────────────────────────────────
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
    const allContent = results.map(r => r.content || "").join(" ") + " " + results.map(r => r.title || "").join(" ");
    const price = extractPrice(allContent) || 500000;
    const sqft = extractSqft(allContent) || 2000;
    output += buildMortgageTable(price, rate);
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

  results.forEach((r) => {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `**${r.title}**\n\n`;
    output += `🔗 [View Full Listing](${r.url})\n\n`;
  });

  if (!isCommercial && results.length > 0) {
    const allContent = results.map(r => r.content || "").join(" ");
    const price = extractPrice(allContent) || 500000;
    const sqft = extractSqft(allContent) || 2000;
    output += buildMortgageTable(price, rate);
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
function buildMortgageTable(price, rate) {
  let o = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  o += `💰 **Mortgage Estimate** (Rate: ${rate}% — 30yr Fixed, via MND Daily Index)\n`;
  o += `Property Price: $${price.toLocaleString()}\n\n`;
  o += `| Down | Down Pmt | P&I | Taxes | HOA | Total/mo |\n`;
  o += `|------|----------|-----|-------|-----|----------|\n`;
  [0, 5, 10, 20].forEach((pct) => {
    const m = calculateMortgage(price, rate, pct);
    o += `| ${pct}% | $${m.downPayment.toLocaleString()} | $${(m.principal + m.interest).toLocaleString()} | $${m.taxes.toLocaleString()} | $${m.hoa} | $${m.total.toLocaleString()} |\n`;
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
  o += `[🍽️ Restaurants](https://www.google.com/maps/search/restaurants+near+${encodedAddr})\n`;
  o += `[🏫 Schools](https://www.google.com/maps/search/schools+near+${encodedAddr})\n`;
  o += `[🏥 Hospitals](https://www.google.com/maps/search/hospitals+near+${encodedAddr})\n`;
  o += `[💪 Gyms & Fitness](https://www.google.com/maps/search/gyms+near+${encodedAddr})\n`;
  o += `[🌳 Parks](https://www.google.com/maps/search/parks+near+${encodedAddr})\n`;
  o += `[🏛️ County Assessor](https://www.google.com/maps/search/county+assessor+near+${encodedAddr})\n`;
  o += `[🗺️ Map](https://www.google.com/maps/search/${encodedAddr})\n`;
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
    if (prices.length > 0) return Math.max(...prices);
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
  const [profilePhoto, setProfilePhoto] = useState(null);

  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const offerIframeRef = useRef(null);
  const listingIframeRef = useRef(null);
  const tourIframeRef = useRef(null);
  // *** SIDEBAR: Dropdown ref for click-outside ***
  const dropdownRef = useRef(null);

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

  // Fetch plan on load
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(user.email)}&select=plan,search_count,search_reset_date`, { method: "GET" });
        if (data && data.length > 0) {
          setUserPlan(data[0].plan || "free");
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
      if (link && link.getAttribute('href') === '#mortgage-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowMortgageAgent(true);
      }
      if (link && link.getAttribute('href') === '#offer-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowOfferAgent(true);
      }
      if (link && link.getAttribute('href') === '#listing-agent') {
        e.preventDefault();
        if (userPlan === 'free') { setShowUpgradeModal(true); return; }
        setShowListingAgent(true);
      }
      if (link && link.getAttribute('href') === '#schedule-tour') {
        e.preventDefault();
        setShowTourAgent(true);
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
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: "I'm specialized in real estate searches only. Please ask me about residential homes, commercial properties, new constructions, or give me a property address and I'll look it up for you! 🏠",
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    if (isGreeting && !hasAddress) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: `Hello! 👋 I'm **Realty AI**, your real estate search assistant.\n\nI can search for **residential**, **commercial**, or **new construction** properties across major platforms. Just tell me what you're looking for — include details like location, price range, bedrooms, or property type!\n\n*Example: "Find me 3 bed homes in San Diego under $700K"*\n*Example: "123 Main St, Los Angeles, CA"*`,
        }]);
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
        tavilySearch(searchQuery),
        fetchMortgageRate(),
      ]);
      const response = buildPropertyResponse(text, results, mortgageRate, isAddress);

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

  // *** SIDEBAR: Handle profile photo upload ***
  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePhoto(ev.target.result);
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
    }
  };

  // *** SIDEBAR: User initials helper ***
  const userInitials = user ? (user.name || user.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2) : "U";

  if (!user) return (
    <>
      <style>{globalCSS}</style>
      <RegistrationScreen onLogin={async (userData) => {
        setUser(userData);
        localStorage.setItem('realtyai_user', JSON.stringify(userData));
        try {
          const { data } = await supabaseRequest(`/users?email=eq.${encodeURIComponent(userData.email)}&select=plan,search_count,search_reset_date`, { method: "GET" });
          if (data && data.length > 0) {
            setUserPlan(data[0].plan || "free");
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
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: theme.red,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
              letterSpacing: "-.5px",
            }}>RA</div>
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
                { label: "Listings", value: 3 },
                { label: "Offers", value: 1 },
              ].map((stat, i) => (
                <div key={i} style={{
                  flex: 1, background: theme.sidebarCardBg, border: `1px solid ${theme.sidebarCardBorder}`,
                  borderRadius: 8, padding: "7px 6px", textAlign: "center",
                }}>
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
                      { icon: Icons.editProfile, label: "Edit profile" },
                      { icon: Icons.subscription, label: "Manage subscription", action: () => setShowUpgradeModal(true) },
                      { icon: Icons.searchHistory, label: "Search history" },
                      { icon: Icons.settings, label: "Account settings" },
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
              <ChatMessage key={i} msg={msg} index={i} />
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

              <button onClick={handleSend} disabled={loading} style={{
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
                <div style={{ width: 28, height: 28, background: '#E31837', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>R</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Get Approved!</span>
              </div>
              <button onClick={() => setShowMortgageAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 36 }}>✕ Close</button>
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
                <div style={{ width: 28, height: 28, background: '#E31837', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>R</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Submit an Offer</span>
              </div>
              <button onClick={() => setShowOfferAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 36 }}>✕ Close</button>
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
                <div style={{ width: 28, height: 28, background: '#E31837', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>R</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: theme.font }}>Sell Your Property</span>
              </div>
              <button onClick={() => setShowListingAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: theme.font, color: '#555', minHeight: 36 }}>✕ Close</button>
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
                <div style={{ width: 28, height: 28, background: '#E31837', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>R</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Schedule a Tour</span>
              </div>
              <button onClick={() => setShowTourAgent(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555', minHeight: 36 }}>✕ Close</button>
            </div>
            <iframe ref={tourIframeRef} src="/schedule-tour.html" style={{ width: '100%', height: 'calc(100% - 49px)', border: 'none' }} title="Schedule a Tour" />
          </div>
        </div>
      )}

      {/* Upgrade Modal — UNCHANGED */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeUp 0.3s ease-out', overflow: 'hidden',
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
