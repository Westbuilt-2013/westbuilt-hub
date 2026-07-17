import React, { useEffect, useState } from "react";
import { supabase as sb } from "../supabase.js";

const C = { navy: "#193441", sage: "#849A8F", faint: "#6E8079", line: "#D6DFD9", white: "#FFFFFF" };

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" }); } catch (e) { return d; }
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

  const table = (list) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: C.faint, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.3 }}>
            <th style={{ padding: "6px 8px" }}>PO #</th>
            <th style={{ padding: "6px 8px" }}>Job / project</th>
            <th style={{ padding: "6px 8px" }}>Vendor</th>
            <th style={{ padding: "6px 8px" }}>Status</th>
            <th style={{ padding: "6px 8px" }}>Promised</th>
            <th style={{ padding: "6px 8px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.acu_po_nbr} style={{ borderTop: `1px solid ${C.line}` }}>
              <td style={{ padding: "8px" }}>{r.acu_po_nbr}</td>
              <td style={{ padding: "8px" }}>{r.project_code || "—"}{r.project_task ? ` / ${r.project_task}` : ""}</td>
              <td style={{ padding: "8px" }}>{r.vendor || "—"}</td>
              <td style={{ padding: "8px" }}>{r.status || "—"}</td>
              <td style={{ padding: "8px" }}>{fmtDate(r.promised_date)}</td>
              <td style={{ padding: "8px" }}>{r.total_amount != null ? `${r.currency || ""} ${r.total_amount}` : "—"}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "14px 8px", color: C.faint }}>None.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.sage, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>
        &larr; Back
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, color: C.navy, fontSize: 18 }}>Purchasing & Procurement</div>
        <button
          onClick={refresh}
          disabled={syncing}
          style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: syncing ? "default" : "pointer", opacity: syncing ? 0.6 : 1 }}
        >
          {syncing ? "Syncing…" : "Refresh from Acumatica"}
        </button>
      </div>

      {syncMsg && <div style={{ fontSize: 12.5, color: C.faint, marginBottom: 14 }}>{syncMsg}</div>}

      {rows === null && !loadErr && <div style={{ color: C.faint, fontSize: 13 }}>Loading…</div>}

      {loadErr && isNotSetUp(loadErr) && (
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20, color: C.faint, fontSize: 13 }}>
          The <code>purchase_orders</code> table hasn't been created yet (migration pending on the Acumatica field-mapping confirmation). Once that migration is applied and Acumatica secrets are set, this screen will populate on refresh.
        </div>
      )}
      {loadErr && !isNotSetUp(loadErr) && (
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20, color: "#C0392B", fontSize: 13 }}>
          {loadErr}
        </div>
      )}

      {rows !== null && !loadErr && (
        <>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, margin: "18px 0 8px" }}>Due today / this week</div>
          {table(dueThisWeek)}
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, margin: "22px 0 8px" }}>All open POs</div>
          {table(open)}
        </>
      )}
    </div>
  );
}
