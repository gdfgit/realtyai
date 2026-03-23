const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    },
    body: JSON.stringify(body)
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim().toLowerCase());
}

async function sendViaEmailJS({
  publicKey,
  privateKey,
  serviceId,
  templateId,
  templateParams
}) {
  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: templateParams
  };

  const response = await fetch(EMAILJS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`EmailJS ${response.status}: ${text}`);
  }

  return text;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed." });
  }

  const publicKey = process.env.EMAILJS_PUBLIC_KEY;      // xElMdZFRvZqh8-bIw
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;    // from Netlify env var
  const serviceId = process.env.EMAILJS_SERVICE_ID;      // your EmailJS service ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_0a5rcng";
  const confirmationEmail = process.env.CONFIRMATION_EMAIL || "natiorealtor@gmail.com";
  const fromEmail = process.env.FROM_EMAIL || "gdifaziorealtor@gmail.com";
  const fromName = process.env.FROM_NAME || "Giancarlo Di Fazio";

  if (!publicKey || !privateKey || !serviceId || !templateId) {
    return jsonResponse(500, {
      ok: false,
      error: "Missing EmailJS environment variables."
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body." });
  }

  const listingAgentEmail = String(body.listingAgentEmail || "").trim().toLowerCase();
  const listingAgentName = String(body.listingAgentName || "Listing Agent").trim();

  if (!isValidEmail(listingAgentEmail)) {
    return jsonResponse(400, {
      ok: false,
      error: "Valid listingAgentEmail is required."
    });
  }

  const commonParams = {
    from_name: fromName,
    from_email: fromEmail,
    reply_to: fromEmail,
    subject: body.subject || "Offer Notification",
    property_address: body.propertyAddress || "",
    offer_price: body.offerPrice || "",
    buyer_name: body.buyerName || "",
    buyer_email: body.buyerEmail || "",
    buyer_phone: body.buyerPhone || "",
    listing_agent_name: listingAgentName,
    listing_agent_email: listingAgentEmail,
    message: body.offerSummary || body.message || ""
  };

  try {
    // 1) Send to listing agent
    await sendViaEmailJS({
      publicKey,
      privateKey,
      serviceId,
      templateId,
      templateParams: {
        ...commonParams,
        to_email: listingAgentEmail,
        to_name: listingAgentName,
        email_type: "listing_agent_offer"
      }
    });

    // 2) Send confirmation to Nation Realtor
    await sendViaEmailJS({
      publicKey,
      privateKey,
      serviceId,
      templateId,
      templateParams: {
        ...commonParams,
        to_email: confirmationEmail,
        to_name: "Nation Realtor",
        email_type: "internal_confirmation"
      }
    });

    return jsonResponse(200, {
      ok: true,
      message: "Emails sent to listing agent and confirmation inbox."
    });
  } catch (err) {
    return jsonResponse(500, {
      ok: false,
      error: err.message || "Failed to send emails."
    });
  }
};
