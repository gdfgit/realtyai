const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fetch = require("node-fetch");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://guqytcsovjqmbomyacyd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

async function updateUserPlan(email, plan, stripeCustomerId, stripeSubscriptionId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan,
        stripe_customer_id: stripeCustomerId || null,
        stripe_subscription_id: stripeSubscriptionId || null,
      }),
    }
  );
  return res.json();
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    // If webhook secret is set, verify signature
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      stripeEvent = JSON.parse(event.body);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, headers, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const email = session.metadata?.email || session.customer_email;
        const plan = session.metadata?.plan || "monthly";
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (email) {
          await updateUserPlan(email, "plus", customerId, subscriptionId);
          console.log(`Upgraded ${email} to plus (${plan})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;
        const email = subscription.metadata?.email;

        if (email) {
          await updateUserPlan(email, "free", customerId, null);
          console.log(`Downgraded ${email} to free (subscription cancelled)`);
        } else {
          // Look up customer to get email
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.email) {
            await updateUserPlan(customer.email, "free", customerId, null);
            console.log(`Downgraded ${customer.email} to free (subscription cancelled)`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = stripeEvent.data.object;
        const email = subscription.metadata?.email;
        const customerId = subscription.customer;

        // If subscription becomes past_due or unpaid, downgrade
        if (subscription.status === "past_due" || subscription.status === "unpaid" || subscription.status === "canceled") {
          const targetEmail = email || (await stripe.customers.retrieve(customerId)).email;
          if (targetEmail) {
            await updateUserPlan(targetEmail, "free", customerId, null);
            console.log(`Downgraded ${targetEmail} — status: ${subscription.status}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object;
        const customerId = invoice.customer;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.email) {
          console.log(`Payment failed for ${customer.email}`);
          // Optionally downgrade after X failed attempts
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
};
