import twilio from "twilio";
import { getStore } from "@netlify/blobs";

export const config = {
  schedule: "@every 15m"
};

const APPTS_KEY = "extra_appts_v1";

export default async (event, context) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, FATHER_PHONE, REMIND_PATIENT } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
    return { ok:false, error:"Missing Twilio env" };
  }
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const store = getStore({ name: "appointments-store" });

  // Base appointments (must mirror client list). For flexibility we only remind for extra appts stored + future dialysis claims keys.
  let extra = [];
  try {
    const txt = await store.get(APPTS_KEY);
    extra = txt ? JSON.parse(txt) : [];
  } catch {}

  // Collect all appointments to check (from extra only; the base ones ثابتة ويمكن تذكيرها يدويًا إن رغبت)
  const now = Date.now();
  const in2h = now + 2 * 60 * 60 * 1000;
  const windowStart = now + 60 * 60 * 1000; // يبدأ التذكير قبل الموعد بساعة إلى ساعتين
  const candidates = (extra || []).filter(a => {
    const t = new Date(a.iso).getTime();
    return t >= windowStart && t <= in2h;
  });

  const messages = [];
  for (const apt of candidates) {
    const id = apt.iso;
    // assignee
    let assignee = "";
    try {
      assignee = await store.get(`assign_apt_${id}`) || "";
    } catch {}

    const whenTxt = new Date(apt.iso).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });
    const msg = `تذكير بالموعد: ${apt.clinic} • ${apt.doctor} • ${whenTxt}\nالفرع: ${apt.city} — ${apt.branch}\nالمرافق: ${assignee || "لا يوجد"}`;

    // Send to patient
    if (REMIND_PATIENT === "true" && FATHER_PHONE) {
      await client.messages.create({ to: FATHER_PHONE, from: TWILIO_FROM, body: msg });
      messages.push({ to: "FATHER", id });
    }
    // If there is an assignee number, we can't resolve it here (لا نعرف رقم الهاتف من الاسم)،
    // لذا نرسل فقط للمريض من خلال الجدولة. إشعار الاستبدال يُرسل لحظيًا من الواجهة الأمامية.
  }

  return { ok:true, reminded: messages.length };
};
