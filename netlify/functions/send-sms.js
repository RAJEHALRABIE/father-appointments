import twilio from "twilio";

export const config = { path: "/.netlify/functions/send-sms" };

export default async (req, context) => {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
      return new Response(JSON.stringify({ ok:false, error: "Missing Twilio env vars" }), { status: 500 });
    }
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const body = await req.json();
    const to = body?.to;
    const text = body?.text;
    if (!to || !text) {
      return new Response(JSON.stringify({ ok:false, error: "Missing to/text" }), { status: 400 });
    }
    await client.messages.create({ to, from: TWILIO_FROM, body: text });
    return new Response(JSON.stringify({ ok:true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: e?.message || String(e) }), { status: 500 });
  }
};
