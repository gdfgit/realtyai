// netlify/functions/send-offer-email.js
// Sends offer notification emails using EmailJS REST API (server-side)
// Bypasses iframe cross-origin issues with client-side EmailJS

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

  try {
    const body = JSON.parse(event.body);
    const { to_email, to_name, property_address, offer_price, message } = body;

    // Send via EmailJS REST API
    const emailjsPayload = {
      service_id: 'service_rh6uozl',
      template_id: 'template_0a5rcng',
      user_id: 'xElMdZFRvZqh8-bIw',
      template_params: {
        to_email: to_email || '',
        to_name: to_name || '',
        property_address: property_address || '',
        offer_price: offer_price || '',
        message: message || '',
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailjsPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('EmailJS API error:', res.status, errText);
      return {
        statusCode: res.status, headers,
        body: JSON.stringify({ error: 'EmailJS failed: ' + errText }),
      };
    }

    console.log('Email sent to:', to_email);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, to: to_email }),
    };

  } catch (err) {
    console.error('Send email error:', err.message);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
