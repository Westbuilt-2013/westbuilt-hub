import React, { useEffect, useState } from "react";
import { supabase as sb } from "../supabase.js";
import { T, sans, mono, Eyebrow, Pill } from "../brand.jsx";

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" }); } catch (e) { return d; }
}

function isNotSetUp(err) {
  const m = (err || "").toLowerCase();
  return m.includes("does not exist") || m.includes("schema cache");
}

export default function Purchasing({ acu, onBack }) {
  const [rows, setRows] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const load = async () => {
    setLoadErr("");
    if (!sb) { setLoadErr("Supabase is not configured."); setRows([]); return; }
    const { data, error } = await sb
      .from("purchase_orders")
      .select("acu_po_nbr, project_code, project_task, vendor, description, status, order_date, promised_date, total_amount, currency")
      .order("promised_date", { ascending: true, nullsFirst: false });
    if (error) { setLoadErr(error.message); setRows([]); return; }
    setRows(data || []);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setSyncing(true); setSyncMsg("");
    try {
      const res = await acu({ op: "sync" });
      setSyncMsg(`Synced ${res && res.synced != null ? res.synced : ""} orders.`);
      await load();
    } catch (e) {
      setSyncMsg(String((e && e.message) || e));
    }
    setSyncing(false);
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAhead = new Date(today.getTime() + 7 * 86400000);
  const open = (rows || []).filter((r) => (r.status || "").toLowerCase() !== "closed");
  const dueThisWeek = open.filter((r) => r.promised_date && new Date(r.promised_date) <= weekAhead);

  const panel = { background: T.panel, border: `1px solid ${T.line}`, borderRadius: 13, padding: "18px 20px", marginBottom: 16 };
  const th = { padding: "7px 10px", font: `700 10.5px/1 ${sans}`, letterSpacing: "0.1em", textTransform: "uppercase", color: T.faint, textAlign: "left" };
  const td = { padding: "9px 10px", font: `500 12.5px/1.4 ${sans}`, color: T.txt };

  const table = (list) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>PO #</th><th style={th}>Job / project</th><th style={th}>Vendor</th>
            <th style={th}>Status</th><th style={th}>Promised</th><th style={{ ...th, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.acu_po_nbr} style={{ borderTop: `1px solid ${T.line2}` }}>
              <td style={{ ...td, font: `700 12px/1.4 ${mono}`, color: T.navy }}>{r.acu_po_nbr}</td>
              <td style={td}>{r.project_code || "—"}{r.project_task ? ` / ${r.project_task}` : ""}</td>
              <td style={td}>{r.vendor || "—"}</td>
              <td style={td}>{r.status || "—"}</td>
              <td style={td}>{fmtDate(r.promised_date)}</td>
              <td style={{ ...td, textAlign: "right", font: `600 12px/1.4 ${mono}` }}>{r.total_amount != null ? `${r.currency || ""} ${Number(r.total_amount).toLocaleString()}` : "—"}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={6} style={{ ...td, color: T.faint, padding: "16px 10px" }}>Nothing here yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "34px 28px 48px", maxWidth: 1180, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.bluegum, font: `700 12.5px/1 ${sans}`, cursor: "pointer", padding: 0, marginBottom: 18 }}>
        &larr; Back to hub
      </button>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <Eyebrow>Purchasing &amp; Procurement</Eyebrow>
          <div style={{ font: `800 22px/1.2 ${sans}`, color: T.navy, marginTop: 7 }}>Purchase orders</div>
        </div>
        <button onClick={refresh} disabled={syncing}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", font: `700 12.5px/1 ${sans}`, cursor: syncing ? "default" : "pointer", opacity: syncing ? 0.6 : 1 }}>
          {syncing ? "Syncing…" : "Refresh from Acumatica"}
        </button>
      </div>

      {syncMsg && <div style={{ font: `600 12px/1.4 ${sans}`, color: T.mut, marginBottom: 14 }}>{syncMsg}</div>}

      {rows === null && !loadErr && <div style={{ font: `500 13px/1 ${sans}`, color: T.faint }}>Loading…</div>}

      {loadErr && isNotSetUp(loadErr) && (
        <div style={panel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Pill color={T.amber} bg={T.amberSoft}>Awaiting setup</Pill>
          </div>
          <div style={{ font: `500 13px/1.55 ${sans}`, color: T.mut }}>
            The purchase orders table hasn&rsquo;t been created yet &mdash; it lands once the Acumatica field mapping is
            confirmed. When that migration is applied and the sync is wired, this screen fills itself.
          </div>
        </div>
      )}
      {loadErr && !isNotSetUp(loadErr) && (
        <div style={{ ...panel, borderColor: T.red }}>
          <div style={{ font: `600 13px/1.5 ${sans}`, color: T.red }}>{loadErr}</div>
        </div>
      )}

      {rows !== null && !loadErr && (
        <>
          <div style={panel}>
            <div style={{ font: `800 14px/1 ${sans}`, color: T.navy, marginBottom: 12 }}>Due today &amp; this week</div>
            {table(dueThisWeek)}
          </div>
          <div style={panel}>
            <div style={{ font: `800 14px/1 ${sans}`, color: T.navy, marginBottom: 12 }}>All open POs</div>
            {table(open)}
          </div>
        </>
      )}
    </div>
  );
}
