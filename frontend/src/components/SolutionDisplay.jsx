import React from 'react';

const SolutionDisplay = ({ solution, loading }) => {
    return (
        <div>
            <h3>Solution Preview</h3>

            <div className="card" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))", minHeight: '120px' }}>
                {!solution && !loading && <p className="text-muted">Select options and click <b>Find Solution</b> to see the recommended fix.</p>}
                {loading && <p className="text-muted">Fetching solution...</p>}
                {solution && (
                    <>
                        <h4 style={{ marginTop: 0 }}>Solution</h4>
                        <div style={{ whiteSpace: "pre-wrap", color: "#0b2540" }}>{solution}</div>
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
    );
};

export default SolutionDisplay;
