// Optional Supabase-backed submission history. Falls back to "disabled" (the
// frontend then uses browser localStorage) when env vars aren't set.
// Uses the SERVICE ROLE key, which must stay server-side only.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "app_submissions";

export const dbEnabled = Boolean(URL && KEY);

let client = null;
function db() {
  if (!dbEnabled) return null;
  if (!client) client = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export async function listSubmissions(limit = 50) {
  const { data, error } = await db()
    .from(TABLE)
    .select("id, dba, app_type, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []).map((r) => ({ id: r.id, dba: r.dba, appType: r.app_type, savedAt: r.updated_at }));
}

export async function getSubmission(id) {
  const { data, error } = await db().from(TABLE).select("data").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data ? data.data : null;
}

export async function upsertSubmission({ id, dba, appType, data }) {
  const row = { dba: dba || null, app_type: appType || null, data, updated_at: new Date().toISOString() };
  if (id) {
    const { data: out, error } = await db().from(TABLE).update(row).eq("id", id).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (out) return out.id;
    // row was deleted elsewhere — fall through to insert
  }
  const { data: out, error } = await db().from(TABLE).insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return out.id;
}

export async function deleteSubmission(id) {
  const { error } = await db().from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
