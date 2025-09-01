// netlify/functions/reminders.scheduled.js
import twilio from "twilio";
import { getStore } from "@netlify/blobs";
export const handler = async function() {
  try {
    const store = getStore({ name: "appointments-store" });
    const extra = await store.getJSON("extra_appts.json") || [];
    const cfg = await store.getJSON("dx_config.json") || {days:[1,3,6],hour:17,minute:30,city:'الرياض',branch:'السويدي'};
    const base = [
      { clinic:'العظام', doctor:'الدكتور قمر جليل اختر', iso:'2025-09-02T08:30:00+03:00', city:'الرياض', branch:'السويدي' },
      { clinic:'المسالك البولية', doctor:'الدكتور طارق الزهراني', iso:'2025-09-02T09:20:00+03:00', city:'الرياض', branch:'السويدي' },
      { clinic:'القلب', doctor:'الدكتور خالد محمد الحربي', iso:'2025-09-04T19:45:00+03:00', city:'الرياض', branch:'السويدي' }
    ];
    const now = new Date(); const dxList=[]; let cursor=now;
    for(let i=0;i<6;i++){const candidates=(cfg.days||[1,3,6]).map(d=>{const base=new Date(cursor); const cur=base.getDay(); let add=(d-cur+7)%7; const t=new Date(base); t.setHours(cfg.hour||17,cfg.minute||30,0,0); if(add===0 && t<=base) add=7; t.setDate(t.getDate()+add); return t;}); const soon=candidates.sort((a,b)=>a-b)[0]; dxList.push({ clinic:'غسيل الكلى', doctor:'—', iso:soon.toISOString(), city:cfg.city||'الرياض', branch:cfg.branch||'السويدي' }); cursor=new Date(soon.getTime()+1000);}
    const all=[...base, ...extra, ...dxList].sort((a,b)=> new Date(a.iso)-new Date(b.iso));
    const nowms=Date.now(); const in2hStart=nowms+2*60*60*1000-7*60*1000; const in2hEnd=nowms+2*60*60*1000+7*60*1000;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const from = process.env.TWILIO_FROM; const patient = process.env.FATHER_PHONE; const remindPatient = (process.env.REMIND_PATIENT || "true") === "true";
    for (const a of all) { const t=new Date(a.iso).getTime(); if(t>=in2hStart && t<=in2hEnd) { const msg = `تذكير: موعد ${a.clinic} ${a.doctor!=='—' ? 'مع '+a.doctor : ''} في ${new Date(a.iso).toLocaleString("ar-SA")} - ${a.city} / ${a.branch}`; if (remindPatient && patient && from) { await client.messages.create({ to: patient, from, body: msg }); } } }
    return { statusCode: 200, body: JSON.stringify({ ok: true, checked: all.length }) };
  } catch (e) { return { statusCode: 500, body: e.message || "scheduled error" }; }
}
