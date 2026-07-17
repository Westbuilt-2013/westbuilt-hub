import React, { useState } from "react";
import { LINKS } from "./supabase.js";
import { T, sans, HubLogo, Eyebrow, Pill } from "./brand.jsx";
import Purchasing from "./modules/Purchasing.jsx";

// Simple stroke icons, one per department, in the family's line style.
const ic = (paths) => ({ c = T.bluegum, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
    {paths}
  </svg>
);
const ICONS = {
  megaphone: ic(<><path d="M3 11v3" /><path d="M7 10v5" /><path d="M7 10l11-6v16l-11-5" /><path d="M18 9a3 3 0 0 1 0 6" /></>),
  drafting: ic(<><circle cx="12" cy="5" r="2" /><path d="M11 6.7 5 21" /><path d="M13 6.7 19 21" /><path d="M8 14h8" /></>),
  factory: ic(<><path d="M3 21V9l6 4V9l6 4V4h6v17" /><path d="M3 21h18" /><path d="M8 17h1M12 17h1M16 17h1" /></>),
  crane: ic(<><path d="M4 21h16" /><path d="M8 21V8l10-4" /><path d="M8 8h10" /><path d="M14 8v5" /><path d="M12.5 13h3" /></>),
  compass: ic(<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  handshake: ic(<><path d="m11 17 2 2a2 2 0 0 0 2.8-2.8" /><path d="m6 12 5.5 5.5a2 2 0 0 0 2.8-2.8L10 10.5" /><path d="M2 8l4 4 4-4-4-4z" transform="scale(0.9) translate(1.5,1.5)" /><path d="M18 6l4 4-6 6" /></>),
  clipboard: ic(<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a2 2 0 0 1 6 0" /><path d="M9 11h6M9 15h4" /></>),
  shield: ic(<><path d="M12 3 5 6v5c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6z" /><path d="m9 11.5 2 2 4-4" /></>),
};

// kind: "module" (real screen) | "external" (link out, new tab) | "placeholder" (coming soon)
const DEPARTMENTS = [
  { key: "sales-marketing", label: "Sales & Marketing", kind: "placeholder", icon: "megaphone", note: "Leads, pipeline and campaigns. HubSpot feed planned." },
  { key: "preconstruction", label: "Preconstruction", kind: "placeholder", icon: "drafting", note: "Consult and detailed design stages." },
  { key: "manufacturing", label: "Manufacturing", kind: "placeholder", icon: "factory", note: "Factory build and module tracking." },
  { key: "construction-jobs", label: "Construction & Jobs", kind: "external", linkKey: "scheduler", icon: "crane", note: "Programmes, dependencies and site works.", app: "Scheduler" },
  { key: "purchasing", label: "Purchasing & Procurement", kind: "module", icon: "clipboard", note: "Purchase orders from Acumatica." },
  { key: "after-sales", label: "After-Sales & Client Relations", kind: "placeholder", icon: "handshake", note: "Service calls, warranty and client care." },
  { key: "safety-quality", label: "Safety & Quality", kind: "placeholder", icon: "shield", note: "BuildPass integration planned." },
  { key: "leadership-okrs", label: "Leadership & OKRs", kind: "external", linkKey: "vsbe", icon: "compass", note: "Missions, KPIs and meeting minutes.", app: "VSBE" },
];

const STYLE = `
  .hub-card { transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease; }
  .hub-card:hover { box-shadow: 0 8px 22px rgba(25,52,65,0.13); transform: translateY(-2px); border-color: #849A8F !important; }
  .hub-signout:hover { background: rgba(255,255,255,0.1) !important; }
`;

function Header({ userEmail, onSignOut, onHome }) {
  return (
    <div style={{ background: T.navy, color: "#fff", borderBottom: `3px solid ${T.bluegum}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 28px", minHeight: 64, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div onClick={onHome} style={{ cursor: "pointer" }} title="Home">
          <HubLogo light size={30} />
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ font: `600 12px/1 ${sans}`, color: "#9DB6AC" }}>{userEmail}</span>
        <button className="hub-signout" onClick={onSignOut}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 7, padding: "7px 13px", font: `700 11.5px/1 ${sans}`, color: "#fff", cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function DeptCard({ dept, onNavigate }) {
  const Icon = ICONS[dept.icon];
  const base = {
    display: "flex", flexDirection: "column", gap: 10, textAlign: "left",
    background: T.panel, border: `1px solid ${T.line}`, borderRadius: 13,
    padding: "20px 20px 18px", minHeight: 128, cursor: "pointer",
    textDecoration: "none", color: "inherit", font: "inherit", boxShadow: "0 1px 2px rgba(25,52,65,0.05)",
  };
  const status = dept.kind === "placeholder"
    ? <Pill color={T.mut} bg={T.line2}>Coming soon</Pill>
    : dept.kind === "external"
      ? <Pill color={T.navy} bg={T.bluegumSoft}>Opens {dept.app}</Pill>
      : <Pill color={T.win} bg={T.winSoft}>Live</Pill>;
  const body = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Icon />
        {status}
      </div>
      <div>
        <div style={{ font: `800 15px/1.25 ${sans}`, color: T.navy, marginBottom: 5 }}>{dept.label}</div>
        <div style={{ font: `500 12px/1.5 ${sans}`, color: T.mut }}>{dept.note}</div>
      </div>
    </>
  );
  if (dept.kind === "external") {
    const url = LINKS[dept.linkKey];
    if (!url) return <div className="hub-card" style={{ ...base, cursor: "default", opacity: 0.65 }}>{body}</div>;
    return <a className="hub-card" href={url} target="_blank" rel="noopener noreferrer" style={base}>{body}</a>;
  }
  return <button className="hub-card" style={base} onClick={() => onNavigate(dept.key)}>{body}</button>;
}

function Home({ onNavigate }) {
  return (
    <div style={{ padding: "34px 28px 48px", maxWidth: 1180, margin: "0 auto" }}>
      <Eyebrow>The Westbuilt Way</Eyebrow>
      <div style={{ font: `800 24px/1.2 ${sans}`, color: T.navy, margin: "8px 0 4px" }}>One source of truth, end to end.</div>
      <div style={{ font: `500 13px/1.5 ${sans}`, color: T.mut, marginBottom: 26 }}>
        Sales &rarr; Consult &rarr; Detailed design &rarr; Manufacture &rarr; Assembly &mdash; and everything that supports it.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
        {DEPARTMENTS.map((dept) => <DeptCard key={dept.key} dept={dept} onNavigate={onNavigate} />)}
      </div>
    </div>
  );
}

function Placeholder({ dept, onBack }) {
  const Icon = ICONS[dept.icon];
  return (
    <div style={{ padding: "34px 28px", maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.bluegum, font: `700 12.5px/1 ${sans}`, cursor: "pointer", padding: 0, marginBottom: 18 }}>
        &larr; Back to hub
      </button>
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 13, padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Icon size={30} />
          <Pill color={T.mut} bg={T.line2}>Coming soon</Pill>
        </div>
        <div style={{ font: `800 19px/1.2 ${sans}`, color: T.navy, marginBottom: 7 }}>{dept.label}</div>
        <div style={{ font: `500 13px/1.55 ${sans}`, color: T.mut }}>{dept.note} This area will be built out as part of the hub roll-out.</div>
      </div>
    </div>
  );
}

export default function App({ userEmail, onSignOut, acu }) {
  const [view, setView] = useState("home");
  const dept = DEPARTMENTS.find((d) => d.key === view);
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: sans }}>
      <style>{STYLE}</style>
      <Header userEmail={userEmail} onSignOut={onSignOut} onHome={() => setView("home")} />
      {view === "home" && <Home onNavigate={setView} />}
      {view === "purchasing" && <Purchasing acu={acu} onBack={() => setView("home")} />}
      {dept && dept.kind === "placeholder" && <Placeholder dept={dept} onBack={() => setView("home")} />}
    </div>
  );
}
