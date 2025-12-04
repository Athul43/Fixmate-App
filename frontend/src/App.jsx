// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/global.css";

const API_BASE = "https://YOUR-RENDER-BACKEND-URL.onrender.com/api";


function App() {
  // App data
  const [brands, setBrands] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState({ brand: "", appliance: "", issue: "" });
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load brands on mount
  useEffect(() => {
    axios.get(`${API_BASE}/brands`)
      .then(res => {
        // console.log("Brands loaded:", res.data);
        setBrands(res.data || []);
      })
      .catch(err => {
        console.error("Error loading brands:", err);
        setBrands([]);
      });
  }, []);

  // Fetch appliances for brand
  const fetchAppliances = (brand) => {
    setSelected({ brand, appliance: "", issue: "" });
    setIssues([]);
    setSolution("");
    if (!brand) {
      setAppliances([]);
      return;
    }
    axios.get(`${API_BASE}/appliances?brand=${encodeURIComponent(brand)}`)
      .then(res => setAppliances(res.data || []))
      .catch(() => setAppliances([]));
  };

  // Fetch issues for appliance
  const fetchIssues = (appliance) => {
    setSelected(prev => ({ ...prev, appliance, issue: "" }));
    setSolution("");
    if (!appliance) {
      setIssues([]);
      return;
    }
    axios.get(`${API_BASE}/issues?brand=${encodeURIComponent(selected.brand)}&appliance=${encodeURIComponent(appliance)}`)
      .then(res => setIssues(res.data || []))
      .catch(() => setIssues([]));
  };

  // Get solution
  const getSolution = async () => {
    if (!selected.brand || !selected.appliance || !selected.issue) {
      setError("Please select brand, appliance and issue.");
      return;
    }

    setLoading(true);
    setError("");
    setSolution("");

    try {
      const response = await axios.post(`${API_BASE}/solution`, selected);
      setSolution(response.data.solution || "No solution returned.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch solution");
      setSolution("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="hero">
        <div>
          <h1 className="title">FixMate — Book Skilled Help Fast</h1>
          <p className="subtitle">Find technicians, schedule visits, and get step-by-step fixes for common issues.</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <div>
          <h3>Select Device</h3>

          <label className="text-muted" style={{ display: "block", marginTop: 8 }}>Brand</label>
          <select
            className="input"
            onChange={e => fetchAppliances(e.target.value)}
            value={selected.brand}
          >
            <option value="">Select brand</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label className="text-muted" style={{ display: "block", marginTop: 12 }}>Appliance</label>
          <select
            className="input"
            onChange={e => fetchIssues(e.target.value)}
            value={selected.appliance}
            disabled={!selected.brand}
          >
            <option value="">Select appliance</option>
            {appliances.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <label className="text-muted" style={{ display: "block", marginTop: 12 }}>Issue</label>
          <select
            className="input"
            onChange={e => setSelected(prev => ({ ...prev, issue: e.target.value }))}
            value={selected.issue}
            disabled={!selected.appliance}
          >
            <option value="">Select issue</option>
            {issues.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              className="btn"
              onClick={getSolution}
              disabled={!selected.brand || !selected.appliance || !selected.issue || loading}
            >
              {loading ? "Loading..." : "Find Solution"}
            </button>

            <button
              className="btn"
              style={{ background: "transparent", color: "#0f172a", border: "1px solid rgba(0,0,0,0.08)" }}
              onClick={() => {
                setSelected({ brand: "", appliance: "", issue: "" });
                setAppliances([]);
                setIssues([]);
                setSolution("");
                setError("");
              }}
            >
              Reset
            </button>
          </div>

          {error && (
            <div style={{ color: 'crimson', marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>

        <div>
          <h3>Solution Preview</h3>

          <div className="card" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))" }}>
            {!solution && !loading && <p className="text-muted">Select options and click <b>Find Solution</b> to see the recommended fix.</p>}
            {loading && <p className="text-muted">Fetching solution...</p>}
            {solution && (
              <>
                <h4 style={{ marginTop: 0 }}>Solution</h4>
                <p style={{ whiteSpace: "pre-wrap", color: "#0b2540" }}>{solution}</p>
              </>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "8px 0" }}>Quick Tips</h4>
            <ul className="text-muted" style={{ paddingLeft: 18 }}>
              <li>Try restarting the appliance before booking a visit.</li>
              <li>Keep a photo of the model/label when scheduling a technician.</li>
              <li>Use the Reset button to start over.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* categories / services */}
      <div className="cards" style={{ marginTop: 6 }}>
        <div className="card">
          <h3>Plumbing</h3>
          <p className="text-muted">Fast, local plumbers available for repairs and installations.</p>
        </div>
        <div className="card">
          <h3>Electrical</h3>
          <p className="text-muted">Certified electricians for wiring, switches, and more.</p>
        </div>
        <div className="card">
          <h3>AC Service</h3>
          <p className="text-muted">Maintenance, gas top-up and full repairs.</p>
        </div>
      </div>

    </div>
  );
}

export default App;
