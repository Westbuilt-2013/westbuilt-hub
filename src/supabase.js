import { createClient } from "@supabase/supabase-js";
const cfg = (typeof window !== "undefined" && window.__WB_HUB_CONFIG) || {};
const url = cfg.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const key = cfg.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (url && key) ? createClient(url, key) : null;
export const SB_FUNCTIONS = (url || "").replace(/\/$/, "") + "/functions/v1";
export const LINKS = cfg.LINKS || {};
// Isolated client for admin actions that must NOT replace the acting user's own session.
export function makeTempClient() { return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }); }
