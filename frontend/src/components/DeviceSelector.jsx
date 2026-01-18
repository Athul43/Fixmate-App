import React from 'react';

const DeviceSelector = ({
    brands,
    appliances,
    issues,
    selected,
    loading,
    error,
    onBrandChange,
    onApplianceChange,
    onIssueChange,
    onGetSolution,
    onReset
}) => {
    return (
        <div>
            <h3>Select Device</h3>

            <label className="text-muted" style={{ display: "block", marginTop: 8 }}>Brand</label>
            <select
                className="input"
                onChange={e => onBrandChange(e.target.value)}
                value={selected.brand}
            >
                <option value="">Select brand</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <label className="text-muted" style={{ display: "block", marginTop: 12 }}>Appliance</label>
            <select
                className="input"
                onChange={e => onApplianceChange(e.target.value)}
                value={selected.appliance}
                disabled={!selected.brand}
            >
                <option value="">Select appliance</option>
                {appliances.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <label className="text-muted" style={{ display: "block", marginTop: 12 }}>Issue</label>
            <select
                className="input"
                onChange={e => onIssueChange(e.target.value)}
                value={selected.issue}
                disabled={!selected.appliance}
            >
                <option value="">Select issue</option>
                {issues.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button
                    className="btn"
                    onClick={onGetSolution}
                    disabled={!selected.brand || !selected.appliance || !selected.issue || loading}
                >
                    {loading ? "Loading..." : "Find Solution"}
                </button>

                <button
                    className="btn"
                    style={{ background: "transparent", color: "#0f172a", border: "1px solid rgba(0,0,0,0.08)" }}
                    onClick={onReset}
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
    );
};

export default DeviceSelector;
