import React, { useState } from "react";
import { LINKS } from "./supabase.js";
import Purchasing from "./modules/Purchasing.jsx";

const C = {
  navy: "#193441",
  sage: "#849A8F",
  canvas: "#E4EBE7",
  ink: "#3F4A45",
  faint: "#6E8079",
  line: "#D6DFD9",
  white: "#FFFFFF",
};

// kind: "module" (real screen) | "external" (link out, new tab) | "placeholder" (coming soon)
const DEPARTMENTS = [
  { key: "sales-marketing", label: "Sales & Marketing", kind: "placeholder", note: "HubSpot integration planned." },
  { key: "preconstruction", label: "Preconstruction", kind: "placeholder", note: "Consult → Detailed Design." },
  { key: "manufacturing", label: "Manufacturing", kind: "placeholder", note: "Factory build stage." },
  { key: "construction-jobs", label: "Construction / Jobs", kind: "external", linkKey: "scheduler", note: "Opens the Scheduler app." },
  { key: "leadership-okrs", label: "Leadership / OKRs", kind: "external", linkKey: "vsbe", note: "Opens the VSBE app." },
  { key: "after-sales", label: "After-Sales / Client Relations", kind: "placeholder", note: "Service & client relations." },
  { key: "purchasing", label: "Purchasing & Procurement", kind: "module", note: "Acumatica purchase orders." },
  { key: "safety-quality", label: "Safety & Quality", kind: "placeholder", note: "BuildPath integration planned." },
];

function TopBar({ userEmail, onSignOut }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px", borderBottom: `1px solid ${C.line}`, background: C.white,
    }}>
      <div style={{ fontWeight: 800, color: C.navy, fontSize: 16 }}>Westbuilt Hub</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 12.5, color: C.faint }}>{userEmail}</span>
        <button
          onClick={onSignOut}
          style={{ background: "none", border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, color: C.navy, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function DeptButton({ dept, onNavigate }) {
  const style = {
    display: "flex", flexDirection: "column", justifyContent: "center",
    background: C.white, border: `1px solid ${C.line}`, borderRadius: 14,
    padding: "22px 20px", minHeight: 96, textAlign: "left", cursor: "pointer",
    textDecoration: "none", color: "inherit", boxShadow: "0 1px 2px rgba(25,52,65,0.04)",
  };
  const label = <div style={{ fontWeight: 700, color: C.navy, fontSize: 15.5, marginBottom: 4 }}>{dept.label}</div>;
  const note = <div style={{ fontSize: 12, color: C.faint }}>{dept.note}</div>;

  if (dept.kind === "external") {
    const url = LINKS[dept.linkKey];
    if (!url) {
      return (
        <div style={{ ...style, cursor: "default", opacity: 0.6 }}>
          {label}
          <div style={{ fontSize: 12, color: C.faint }}>Link not configured yet (set LINKS.{dept.linkKey} in config.js).</div>
        </div>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={style}>
        {label}
        {note}
      </a>
    );
  }

  return (
    <button style={{ ...style, font: "inherit" }} onClick={() => onNavigate(dept.key)}>
      {label}
      {note}
    </button>
  );
}

function Home({ onNavigate }) {
  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ fontSize: 13, color: C.faint, marginBottom: 18 }}>
        One entry point across the business. Pick a department.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {DEPARTMENTS.map((dept) => (
          <DeptButton key={dept.key} dept={dept} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function Placeholder({ dept, onBack }) {
  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.sage, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}>
        &larr; Back
      </button>
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 28 }}>
        <div style={{ fontWeight: 800, color: C.navy, fontSize: 18, marginBottom: 6 }}>{dept.label}</div>
        <div style={{ fontSize: 13.5, color: C.faint }}>Coming soon. {dept.note}</div>
      </div>
    </div>
  );
}

export default function App({ userEmail, onSignOut, acu }) {
  const [view, setView] = useState("home");
  const dept = DEPARTMENTS.find((d) => d.key === view);

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: "system-ui, sans-serif" }}>
      <TopBar userEmail={userEmail} onSignOut={onSignOut} />
      {view === "home" && <Home onNavigate={setView} />}
      {view === "purchasing" && <Purchasing acu={acu} onBack={() => setView("home")} />}
      {dept && dept.kind === "placeholder" && <Placeholder dept={dept} onBack={() => setView("home")} />}
    </div>
  );
}
