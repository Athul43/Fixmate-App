// frontend/src/components/AuthModal.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000/api";

export default function AuthModal({ mode: initialMode = "login", onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await axios.post(`${API_BASE}/auth/signup`, { name, email, password });
        if (res.data?.ok) {
          onAuthSuccess(res.data.user);
          onClose();
        } else {
          setError(res.data?.error || "Signup failed");
        }
      } else {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
        if (res.data?.ok) {
          onAuthSuccess(res.data.user);
          onClose();
        } else {
          setError(res.data?.error || "Login failed");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose}>✕</button>
        <h2 style={{ marginTop: 0 }}>{mode === "signup" ? "Create account" : "Login"}</h2>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label className="text-muted">Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required />
            </>
          )}

          <label className="text-muted" style={{ marginTop: 8 }}>Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />

          <label className="text-muted" style={{ marginTop: 8 }}>Password</label>
          <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" required />

          {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Please wait..." : (mode === "signup" ? "Create account" : "Log in")}
            </button>
            <button type="button" className="btn" style={{ background: "transparent", color: "#0f172a", border: "1px solid rgba(0,0,0,0.08)" }} onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
              {mode === "signup" ? "Have an account? Log in" : "Create an account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// inline styles (simple)
const overlayStyle = {
  position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(4,8,20,0.45)", zIndex: 9999
};
const modalStyle = {
  width: 420, maxWidth: "94%", padding: 22, borderRadius: 12,
  background: "linear-gradient(180deg,#ffffff,#fcfcff)",
  boxShadow: "0 20px 60px rgba(2,6,23,0.4)"
};
const closeBtnStyle = { position: "absolute", right: 18, top: 18, background: "transparent", border: "none", cursor: "pointer", fontSize: 18 };
