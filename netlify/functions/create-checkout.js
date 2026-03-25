const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { email, plan, name } = JSON.parse(event.body);

    if (!email || !plan) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing email or plan" }) };
    }

    const priceId = plan === "yearly" ? PRICES.yearly : PRICES.monthly;
    if (!priceId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid plan" }) };
    }

    // Check if customer already exists in Stripe
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email, name: name || email.split("@")[0] });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.URL || "https://realtyaii.netlify.app"}?upgraded=true`,
      cancel_url: `${process.env.URL || "https://realtyaii.netlify.app"}?upgraded=false`,
      metadata: { email, plan },
      subscription_data: {
        metadata: { email, plan },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
