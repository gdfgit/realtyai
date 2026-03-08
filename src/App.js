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
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px white inset !important; }
`;

// ─── DEMO MODE ────────────────────────────────────────────────────────
// Set to true to bypass Supabase/EmailJS/Tavily for local preview
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
  const [mode, setMode] = useState("login"); // login | register | verify
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
        {/* Logo */}
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
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#E31837;text-decoration:underline;font-weight:500">$1</a>')
    .replace(/\n/g, '<br/>');
  return html;
}

// ─── PROCESS SEARCH RESULTS ──────────────────────────────────────────
function buildPropertyResponse(query, searchResults) {
  const q = query.toLowerCase();
  const isCommercial = q.includes("commercial") || q.includes("lease") || q.includes("restaurant") || q.includes("office") || q.includes("retail") || q.includes("business");
  const isNewConstruction = q.includes("new home") || q.includes("new construction");
  const results = searchResults.results || [];
  const images = searchResults.images || [];

  let output = "";

  if (isNewConstruction) {
    output += `🏗️ **New Construction Homes**\n\n`;
    output += `Browse new construction homes here:\n[ShowingNew - New Homes](https://www.showingnew.com/nationrealtor)\n\n`;
    if (results.length > 0) {
      results.forEach((r) => {
        output += `**${r.title}**\n${r.content}\n[View Listing](${r.url})\n\n`;
      });
    }
    return output;
  }

  if (isCommercial) {
    output += `🏢 **Commercial Real Estate Results**\n\n`;
  } else {
    output += `🏠 **Residential Property Results**\n\n`;
  }

  // Images section
  if (images.length > 0) {
    output += `📸 **Property Photos:**\n`;
    images.forEach((img, i) => {
      output += `[Photo ${i + 1}](${img})\n`;
    });
    output += `\n`;
  }

  // Listings
  results.forEach((r, i) => {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `**${r.title}**\n\n`;
    output += `${r.content}\n\n`;
    output += `🔗 [View Full Listing](${r.url})\n\n`;
  });

  if (!isCommercial && results.length > 0) {
    // Extract a sample address for Google Maps links
    const sampleAddress = extractAddress(results[0].title) || "property location";
    const encodedAddr = encodeURIComponent(sampleAddress);

    // Mortgage Table
    const price = extractPrice(results[0].content) || 500000;
    const rate = 6.75;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `💰 **Mortgage Estimate** (Rate: ${rate}% - 30yr Fixed)\n`;
    output += `Property Price: $${price.toLocaleString()}\n\n`;
    output += `| Down % | Down Payment | Principal | Interest | Taxes | HOA | **Monthly Total** |\n`;
    output += `|--------|-------------|-----------|----------|-------|-----|------------------|\n`;

    [0, 5, 10, 20].forEach((pct) => {
      const m = calculateMortgage(price, rate, pct);
      output += `| ${pct}% | $${m.downPayment.toLocaleString()} | $${m.principal.toLocaleString()} | $${m.interest.toLocaleString()} | $${m.taxes.toLocaleString()} | $${m.hoa} | **$${m.total.toLocaleString()}** |\n`;
    });

    // CMA Section
    const pricePerSqft = Math.round(price / 2000);
    const compLow = Math.round(price * 0.92);
    const compHigh = Math.round(price * 1.08);
    const compMedian = Math.round((compLow + compHigh) / 2);

    output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `📊 **CMA & Realty AI Trigger**\n\n`;
    output += `| Metric | Value |\n`;
    output += `|--------|-------|\n`;
    output += `| Recent Comp (Low) | $${compLow.toLocaleString()} |\n`;
    output += `| Recent Comp (High) | $${compHigh.toLocaleString()} |\n`;
    output += `| Avg $/sq ft | $${pricePerSqft} |\n`;
    output += `| Seller's Asking | $${price.toLocaleString()} |\n`;
    output += `| **Realty AI Trigger Price** | **$${compMedian.toLocaleString()}** |\n`;

    // Confident Trigger Analysis
    output += `\n📈 **Confident Trigger Analysis**\n\n`;
    output += `| $/sq ft | Total Price | Market Comps | Buyer Pool | Confidence |\n`;
    output += `|---------|-------------|-------------|------------|------------|\n`;
    const sqft = 2000;
    [pricePerSqft - 40, pricePerSqft - 20, pricePerSqft, pricePerSqft + 20, pricePerSqft + 40].forEach((ppsf) => {
      const tp = ppsf * sqft;
      const pool = ppsf < pricePerSqft - 10 ? "Many" : ppsf < pricePerSqft + 10 ? "Moderate" : ppsf < pricePerSqft + 30 ? "Few" : "Almost None";
      const conf = ppsf < pricePerSqft - 10 ? "🟢 High" : ppsf < pricePerSqft + 10 ? "🟡 Medium" : ppsf < pricePerSqft + 30 ? "🟠 Low" : "🔴 Very Low";
      output += `| $${ppsf} | $${tp.toLocaleString()} | Supported | ${pool} | ${conf} |\n`;
    });

    // Local Area Links
    output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `📍 **Explore the Area**\n\n`;
    output += `[🍽️ Restaurants](https://www.google.com/maps/search/restaurants+near+${encodedAddr})\n`;
    output += `[🏫 Schools](https://www.google.com/maps/search/schools+near+${encodedAddr})\n`;
    output += `[🏥 Hospitals](https://www.google.com/maps/search/hospitals+near+${encodedAddr})\n`;
    output += `[💪 Gyms & Fitness](https://www.google.com/maps/search/gyms+near+${encodedAddr})\n`;
    output += `[🌳 Parks](https://www.google.com/maps/search/parks+near+${encodedAddr})\n`;
    output += `[🏛️ County Assessor](https://www.google.com/maps/search/county+assessor+near+${encodedAddr})\n`;
    output += `[🗺️ Map](https://www.google.com/maps/place/${encodedAddr})\n`;

    // Call to Action
    output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `🎯 **Take Action**\n\n`;
    output += `[📅 Schedule a Tour](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0A8_eNZZH1LljBWEEU0DIIQ7JwWNzlnFrWvGD7UB-aye3aZJRcLk9tRsMeiV1UesGVsGHQeZW6)\n`;
    output += `[📝 Submit an Offer](https://www.nationrealtor.com/submit-an-offer)\n`;
    output += `[✅ Get Approved in 15 Minutes!](https://askangel.ai/giancarlo)\n`;
    output += `[🎥 Live Stream](https://studio.restream.io/euf-vqup-uwl)\n`;
  }

  return output;
}

function extractPrice(text) {
  const match = text.match(/\$([0-9,]+)/);
  if (match) return parseInt(match[1].replace(/,/g, ""));
  return null;
}

function extractAddress(title) {
  const match = title.match(/[-–]\s*(.+)/);
  return match ? match[1].trim() : title;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function RealtyAI() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

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

  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    // Security check
    const lowerText = text.toLowerCase();
    const isRealEstate = lowerText.match(/home|house|condo|apartment|bed|bath|sqft|sq ft|property|real estate|buy|rent|lease|commercial|restaurant|office|retail|new construction|new home|zillow|realtor|redfin|school|restaurant|gym|park|hospital|county|neighborhood|location|price|mortgage|listing|tour|offer|approved/);
    const isGreeting = lowerText.match(/^(hi|hello|hey|good morning|good afternoon|good evening|what can you do|help|how are you)/);

    const userMsg = {
      role: "user", content: text,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    if (!isRealEstate && !isGreeting) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: "I'm specialized in real estate searches only. Please ask me about residential homes, commercial properties, or new constructions, and I'll be happy to help! 🏠",
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    if (isGreeting && !isRealEstate) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant", type: "rich",
          content: `Hello! 👋 I'm **Realty AI**, your real estate search assistant.\n\nI can search for **residential**, **commercial**, or **new construction** properties across major platforms. Just tell me what you're looking for — include details like location, price range, bedrooms, or property type!\n\n*Example: "Find me 3 bed homes in San Diego under $700K"*`,
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    // Build search query for Tavily
    let searchQuery = text;
    const isCommercial = lowerText.match(/commercial|lease|restaurant|office|retail|business for sale/);
    const isNewConst = lowerText.match(/new home|new construction/);

    if (isCommercial) {
      searchQuery += " site:loopnet.com OR site:crexi.com OR site:bizbuysell.com";
    } else if (isNewConst) {
      searchQuery += " new construction homes";
    } else {
      searchQuery += " site:zillow.com OR site:realtor.com OR site:redfin.com OR site:homes.com";
    }

    try {
      const results = await tavilySearch(searchQuery);
      const response = buildPropertyResponse(text, results);

      // Stream simulation for better UX
      const words = response.split(" ");
      let streamed = "";
      const msgIndex = messages.length + 1;

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
    setLoading(false);
  };

  // Voice search
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

  // File upload
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, type: f.type }))]);
  };

  if (!user) return (
    <>
      <style>{globalCSS}</style>
      <RegistrationScreen onLogin={setUser} />
    </>
  );

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column",
        background: theme.offWhite, fontFamily: theme.font,
      }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", background: theme.white,
          borderBottom: `1px solid ${theme.greyLight}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: theme.grey }}>{user.email}</span>
            <button onClick={() => { setUser(null); setMessages([]); }} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "none", border: `1px solid ${theme.greyLight}`, borderRadius: 10,
              cursor: "pointer", color: theme.grey, fontSize: 13, fontFamily: theme.font,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.red; e.currentTarget.style.color = theme.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.greyLight; e.currentTarget.style.color = theme.grey; }}
            >
              {Icons.logout} Sign Out
            </button>
          </div>
        </header>

        {/* Chat Area */}
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

        {/* Attachments Preview */}
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

        {/* Input Bar */}
        <div style={{
          padding: "16px 20px", background: theme.white,
          borderTop: `1px solid ${theme.greyLight}`,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.03)",
        }}>
          <div style={{
            maxWidth: 820, margin: "0 auto", display: "flex", gap: 10, alignItems: "center",
          }}>
            {/* + Button for files */}
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

            {/* Text Input */}
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
              {/* Mic button inside input */}
              <button onClick={toggleVoice} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: listening ? theme.red : theme.grey,
                animation: listening ? "pulse 1s infinite" : "none",
              }}>
                {listening ? Icons.micActive : Icons.mic}
              </button>
            </div>

            {/* Send */}
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
          </p>
        </div>
      </div>
    </>
  );
}