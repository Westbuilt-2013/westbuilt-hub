import React from "react";

// Westbuilt brand system — mirrors vsbe-app/src/App.jsx `T` and scheduler palette.
export const T = {
  navy: "#193441", navyDeep: "#0F242E", navy2: "#2A4F5C",
  bluegum: "#849A8F", bluegumSoft: "#DEE6E2",
  eucalyptus: "#9DBCAC", saltbush: "#D1DBBD", ghostgum: "#F2F2F0",
  win: "#2E7D57", winSoft: "#E2F0E9",
  amber: "#C7891C", amberSoft: "#F8EED6",
  red: "#C0392B", redSoft: "#F7E4E1",
  canvas: "#E4EBE7", panel: "#FFFFFF",
  line: "#D6DFD9", line2: "#E8EEEA",
  txt: "#193441", mut: "#6E8079", faint: "#9DB0A8",
};
export const sans = "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
export const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

// The Westbuilt house badge (same mark as VSBE's Badge / the app icons).
export function Badge({ c = T.navy, size = 30 }) {
  return (
    <svg width={size} height={Math.round(size * 0.97)} viewBox="0 0 120 116" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <g stroke={c} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
        <path d="M20 104 L12 44 L60 8 L108 44 L100 104" />
        <path d="M15 104 L105 104" />
        <path d="M32 72 L60 44 L88 72" />
      </g>
    </svg>
  );
}

// Hub wordmark — same layout language as VSBE's logo (badge + word + arc + descriptor).
export function HubLogo({ light = false, size = 34 }) {
  const ink = light ? "#fff" : T.navy;
  const sub = light ? "#9DB6AC" : T.bluegum;
  const sw = light ? "#9DB6AC" : T.eucalyptus;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Badge c={ink} size={size} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ font: `800 ${Math.round(size * 0.6)}px/1 ${sans}`, letterSpacing: "0.04em", color: ink }}>WESTBUILT</div>
        <svg width={size * 2.7} height="7" viewBox="0 0 92 7" preserveAspectRatio="none" style={{ display: "block", margin: "3px 0" }}>
          <path d="M1 5 Q 46 -2 91 5" stroke={sw} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ font: `700 ${Math.round(size * 0.245)}px/1.2 ${sans}`, letterSpacing: "0.22em", color: sub }}>OPERATIONS HUB</div>
      </div>
    </div>
  );
}

export function Eyebrow({ children }) {
  return <div style={{ font: `700 11px/1 ${sans}`, letterSpacing: "0.16em", textTransform: "uppercase", color: T.bluegum }}>{children}</div>;
}

export function Pill({ children, color, bg }) {
  return <span style={{ font: `700 10.5px/1 ${sans}`, color, background: bg, padding: "4px 8px", borderRadius: 5, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>;
}
