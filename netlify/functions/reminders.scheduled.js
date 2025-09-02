import twilio from "twilio";
import { getStore } from "@netlify/blobs";

export const config = { schedule: "@every 15m" };

const APPTS_KEY = "extra_appts_v1";

export default async () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, FATHER_PHONE, REMIND_PATIENT } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
    return { ok:false, error:"Missing Twilio env" };
  }
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const store = getStore({ name: "appointments-store" });

  let extra = [];
  try {
    const txt = await store.get(APPTS_KEY);
    extra = txt ? JSON.parse(txt) : [];
  } catch {}

  const now = Date.now();
  const windowStart = now + 60*60*1000;    // قبل الموعد بساعة
  const windowEnd   = now + 2*60*60*1000;  // إلى ساعتين
  const candidates = (extra||[]).filter(a => {
    const t = new Date(a.iso).getTime();
    return t >= windowStart && t <= windowEnd;
  });

  let reminded = 0;
  for (const apt of candidates) {
    const whenTxt = new Date(apt.iso).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });
    const msg = `تذكير بالموعد: ${apt.clinic} • ${apt.doctor} • ${whenTxt}\nالفرع: ${apt.city} — ${apt.branch}`;
    if (REMIND_PATIENT === "true" && FATHER_PHONE) {
      await client.messages.create({ to: FATHER_PHONE, from: TWILIO_FROM, body: msg });
      reminded++;
    }
  }
  return { ok:true, reminded };
};