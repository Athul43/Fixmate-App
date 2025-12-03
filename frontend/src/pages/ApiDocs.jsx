export default function ApiDocs() {
  return (
    <div style={{ padding: 40 }}>
      <h1>API Documentation</h1>
      <p>Here you can describe all your API endpoints.</p>

      <h3>Available Endpoints</h3>
      <ul>
        <li>GET /api/brands</li>
        <li>GET /api/appliances?brand=</li>
        <li>GET /api/issues?brand=&appliance=</li>
        <li>POST /api/solution</li>
        <li>GET /api/search?q=</li>
      </ul>
    </div>
  );
}
