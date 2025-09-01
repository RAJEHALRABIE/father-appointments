import { getStore } from "@netlify/blobs";

export const config = { path: "/.netlify/functions/save-state" };

const APPTS_KEY = "extra_appts_v1";

export default async (req, context) => {
  try {
    const payload = await req.json();
    const { action } = payload || {};
    const store = getStore({ name: "appointments-store" });

    if (action === "save_appts") {
      const { appts } = payload || {};
      await store.set(APPTS_KEY, JSON.stringify(appts || []), { metadata: { updatedAt: Date.now() } });
      return new Response(JSON.stringify({ ok:true }), { status: 200 });
    }

    if (action === "assign") {
      const { type, id, assignee } = payload || {};
      if (!type || !id) {
        return new Response(JSON.stringify({ ok:false, error:"Missing type/id" }), { status: 400 });
      }
      await store.set(`assign_${type}_${id}`, assignee || "", { metadata: { updatedAt: Date.now() } });
      return new Response(JSON.stringify({ ok:true }), { status: 200 });
    }

    if (action === "get") {
      const { key } = payload || {};
      const v = await store.get(key);
      return new Response(JSON.stringify({ ok:true, value: v }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok:false, error:"Unknown action" }), { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: e?.message || String(e) }), { status: 500 });
  }
};
