import React from 'react';

const ServiceCards = () => {
    return (
        <div className="cards" id="services" style={{ marginTop: 24 }}>
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
    );
};

export default ServiceCards;
