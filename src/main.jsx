import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase as sb } from "./supabase.js";
import App from "./App.jsx";
if (typeof document !== "undefined") document.title = "Westbuilt Hub";

/* Capture auth params from the URL (hash and query) before anything consumes them.
   Supabase email links arrive in several shapes: implicit hash tokens, a token_hash
   query with a type, or a pkce code. The Gate below redeems all of them. */
function readAuthParams() {
  const out = {};
  const grab = (s) => {
    if (!s || s.length < 2) return;
    new URLSearchParams(s.replace(/^[#?]/, "")).forEach((v, k) => { if (!(k in out)) out[k] = v; });
  };
  grab(window.location.hash);
  grab(window.location.search);
  return out;
}
const AUTH = readAuthParams();
const LINK_TYPE = AUTH.type || null;
const AUTH_ERROR = AUTH.error_description || AUTH.error || null;
function humanLinkError(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("expired") || m.includes("otp_expired")) return "That invite link has expired or was already opened. Ask for a fresh invite, or use Forgot password below.";
  if (m.includes("invalid") || m.includes("not found")) return "That link could not be used. Ask for a fresh invite, or use Forgot password below.";
  return msg;
}

const card = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#E4EBE7", fontFamily: "system-ui, sans-serif" },
  box: { background: "#fff", border: "1px solid #D6DFD9", borderRadius: 12, padding: 28, width: 340 },
  h: { fontWeight: 800, color: "#193441", fontSize: 18, marginBottom: 4 },
  sub: { fontSize: 13, color: "#6E8079", marginBottom: 14 },
  input: { width: "100%", border: "1px solid #D6DFD9", borderRadius: 8, padding: "8px 10px", fontSize: 14, marginBottom: 10, boxSizing: "border-box" },
  btn: { width: "100%", background: "#193441", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  msbtn: { width: "100%", background: "#fff", color: "#193441", border: "1px solid #D6DFD9", borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  divider: { display: "flex", alignItems: "center", gap: 8, color: "#9DB0A8", fontSize: 11, margin: "12px 0 4px" },
  line: { flex: 1, height: 1, background: "#D6DFD9" },
  link: { background: "none", border: "none", color: "#849A8F", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 10 },
  err: { color: "#C0392B", fontSize: 12, marginTop: 8 },
  ok: { color: "#2E7D57", fontSize: 12, marginTop: 8 },
};

function Card({ title, subtitle, children }) {
  return (
    <div style={card.page}>
      <div style={card.box}>
        <svg width="34" height="33" viewBox="0 0 120 116" fill="none" style={{ display: "block", marginBottom: 12 }} aria-label="Westbuilt">
          <g stroke="#193441" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
            <path d="M20 104 L12 44 L60 8 L108 44 L100 104" />
            <path d="M15 104 L105 104" />
            <path d="M32 72 L60 44 L88 72" />
          </g>
        </svg>
        <div style={card.h}>{title}</div>
        <div style={card.sub}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

function Login({ initialError }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(initialError || "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setErr(""); setNotice(""); setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "Email or password did not match." : error.message);
  };
  const microsoft = async () => {
    setErr(""); setNotice("");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: window.location.origin, scopes: "email" },
    });
    if (error) setErr(error.message);
  };
  const forgot = async () => {
    if (!email.trim()) { setErr("Type your email first, then press Forgot password."); return; }
    setErr(""); setBusy(true);
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setBusy(false);
    if (error) setErr(error.message); else setNotice("Reset link sent. Check your email.");
  };
  return (
    <Card title="Westbuilt Hub" subtitle="Sign in with your work email.">
      <input style={card.input} type="email" placeholder="Email" value={email} autoFocus
        onChange={(e) => { setEmail(e.target.value); setErr(""); }} />
      <input style={card.input} type="password" placeholder="Password" value={pw}
        onChange={(e) => { setPw(e.target.value); setErr(""); }}
        onKeyDown={(e) => { if (e.key === "Enter") go(); }} />
      <button style={{ ...card.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={go}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div style={card.divider}><span style={card.line} />or<span style={card.line} /></div>
      <button style={card.msbtn} onClick={microsoft}>
        <span style={{ display: "inline-block", width: 12, height: 12, marginRight: 8, verticalAlign: "-1px",
          background: "conic-gradient(#F25022 0 25%, #7FBA00 0 50%, #FFB900 0 75%, #00A4EF 0)" }} />
        Sign in with Microsoft
      </button>
      <button style={card.link} onClick={forgot}>Forgot password</button>
      {err && <div style={card.err}>{err}</div>}
      {notice && <div style={card.ok}>{notice}</div>}
    </Card>
  );
}

function SetPassword({ onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (pw.length < 8) { setErr("Use at least 8 characters."); return; }
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setErr(error.message);
    else { window.history.replaceState(null, "", window.location.pathname); onDone(); }
  };
  return (
    <Card title="Choose a password" subtitle="Set the password you will sign in with from now on.">
      <input style={card.input} type="password" placeholder="New password (8+ characters)" value={pw} autoFocus
        onChange={(e) => { setPw(e.target.value); setErr(""); }}
        onKeyDown={(e) => { if (e.key === "Enter") go(); }} />
      <button style={{ ...card.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={go}>
        {busy ? "Saving…" : "Save password"}
      </button>
      {err && <div style={card.err}>{err}</div>}
    </Card>
  );
}

function Gate() {
  const [session, setSession] = useState(undefined);
  const [hubAccess, setHubAccess] = useState("loading"); // loading | ok | off
  const [needsPw, setNeedsPw] = useState(LINK_TYPE === "invite" || LINK_TYPE === "recovery" || LINK_TYPE === "signup");
  const [linkErr, setLinkErr] = useState(AUTH_ERROR ? humanLinkError(AUTH_ERROR) : "");

  useEffect(() => {
    if (!sb) return undefined;
    let on = true;
    const cleanUrl = () => { try { window.history.replaceState(null, "", window.location.pathname); } catch (e) {} };
    (async () => {
      try {
        if (AUTH_ERROR) {
          // expired or already-used link: leave them on sign-in with a note
        } else if (AUTH.access_token && AUTH.refresh_token) {
          await sb.auth.setSession({ access_token: AUTH.access_token, refresh_token: AUTH.refresh_token });
        } else if (AUTH.token_hash && LINK_TYPE) {
          const { error } = await sb.auth.verifyOtp({ token_hash: AUTH.token_hash, type: LINK_TYPE });
          if (error && on) setLinkErr(humanLinkError(error.message));
        } else if (AUTH.code) {
          const { error } = await sb.auth.exchangeCodeForSession(window.location.href);
          if (error && on) setLinkErr(humanLinkError(error.message));
        }
      } catch (e) {
        if (on) setLinkErr(humanLinkError(String((e && e.message) || e)));
      }
      cleanUrl();
      const { data } = await sb.auth.getSession();
      if (on) setSession(data.session || null);
    })();
    const { data: sub } = sb.auth.onAuthStateChange((evt, s) => {
      if (evt === "PASSWORD_RECOVERY") setNeedsPw(true);
      if (on) setSession(s || null);
    });
    return () => { on = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sb || !session) { setHubAccess("loading"); return undefined; }
    let on = true;
    (async () => {
      // Access is governed by app_access.hub. This check can only ever DENY when it
      // positively reads hub === false. Any error, missing row, or missing policy
      // falls back to allow, so it can never lock anyone out. Never writes the
      // scheduler/exec columns owned by the other two apps.
      const email = (session.user.email || "").toLowerCase();
      try {
        const { data: acc, error } = await sb.from("app_access").select("hub").eq("email", email).maybeSingle();
        if (error) { if (on) setHubAccess("ok"); return; }
        if (!acc) {
          try { await sb.from("app_access").insert({ email, hub: true }); } catch (e) {}
          if (on) setHubAccess("ok");
        } else {
          if (on) setHubAccess(acc.hub === false ? "off" : "ok");
        }
      } catch (e) { if (on) setHubAccess("ok"); }
    })();
    return () => { on = false; };
  }, [session && session.user.id]);

  if (!sb) return <Card title="Westbuilt Hub" subtitle="Missing Supabase configuration — set SUPABASE_URL/SUPABASE_ANON_KEY in public/config.js." />;
  if (session === undefined) return <Card title="Westbuilt Hub" subtitle="Loading…" />;
  if (!session) return <Login initialError={linkErr} />;
  if (needsPw) return <SetPassword onDone={() => setNeedsPw(false)} />;
  if (hubAccess === "loading") return <Card title="Westbuilt Hub" subtitle="Checking your access…" />;

  const signOut = async () => { await sb.auth.signOut(); window.location.reload(); };

  if (hubAccess === "off") {
    return (
      <Card title="Hub access turned off" subtitle="Your access has been switched off in the admin tool. Ask an administrator to turn it back on, then reload.">
        <button style={card.btn} onClick={signOut}>Sign out</button>
      </Card>
    );
  }

  const acu = (body) => sb.functions.invoke("acu", { body }).then(({ data, error }) => {
    if (error) throw new Error(error.message || "Acumatica call failed");
    if (data && data.error) throw new Error(data.error);
    return data;
  });

  return <App userEmail={session.user.email || ""} onSignOut={signOut} acu={acu} />;
}

createRoot(document.getElementById("root")).render(<Gate />);
