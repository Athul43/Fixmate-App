// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/global.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import DeviceSelector from "./components/DeviceSelector";
import SolutionDisplay from "./components/SolutionDisplay";
import ServiceCards from "./components/ServiceCards";

const API_BASE = "http://127.0.0.1:5000/api";

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

  const handleReset = () => {
    setSelected({ brand: "", appliance: "", issue: "" });
    setAppliances([]);
    setIssues([]);
    setSolution("");
    setError("");
  };

  return (
    <>
      <Navbar />
      <div className="app-shell">
        <Hero />

        <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          <DeviceSelector
            brands={brands}
            appliances={appliances}
            issues={issues}
            selected={selected}
            loading={loading}
            error={error}
            onBrandChange={fetchAppliances}
            onApplianceChange={fetchIssues}
            onIssueChange={(val) => setSelected(prev => ({ ...prev, issue: val }))}
            onGetSolution={getSolution}
            onReset={handleReset}
          />

          <SolutionDisplay
            solution={solution}
            loading={loading}
          />
        </div>

        <ServiceCards />
      </div>
      <Footer />
    </>
  );
}

export default App;
