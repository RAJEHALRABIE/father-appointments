// netlify/functions/send-sms.js
import twilio from "twilio";
export async function handler(event) {
  try {
    const { to, text } = JSON.parse(event.body || "{}");
    if (!to || !text) return { statusCode: 400, body: "Missing 'to' or 'text'" };
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const from = process.env.TWILIO_FROM;
    if (!from) return { statusCode: 500, body: "TWILIO_FROM not set" };
    const msg = await client.messages.create({ to, from, body: text });
    return { statusCode: 200, body: JSON.stringify({ sid: msg.sid }) };
  } catch (e) { return { statusCode: 500, body: e.message || "SMS error" }; }
}
