// netlify/functions/save-state.js
import { getStore } from "@netlify/blobs";
export async function handler(event) {
  try {
    const { action, ...rest } = JSON.parse(event.body || "{}");
    const store = getStore({ name: "appointments-store" });
    if (action === "save_appts") { await store.setJSON("extra_appts.json", rest.appts || []); return { statusCode: 200, body: JSON.stringify({ ok: true }) }; }
    if (action === "assign") { const key = `assign_${rest.type}_${rest.id}`; await store.set(key, rest.assignee || ""); return { statusCode: 200, body: JSON.stringify({ ok: true }) }; }
    if (action === "save_dx_config") { await store.setJSON("dx_config.json", rest.cfg || {}); return { statusCode: 200, body: JSON.stringify({ ok: true }) }; }
    return { statusCode: 400, body: "Unknown action" };
  } catch (e) { return { statusCode: 500, body: e.message || "save-state error" }; }
}
