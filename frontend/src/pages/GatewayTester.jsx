import { useEffect, useState } from "react";
import api from "../services/api";

function GatewayTester() {
  const [apis, setApis] = useState([]);
  const [versions, setVersions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [apiId, setApiId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [key, setKey] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/apis").then((response) => setApis(response.data.apis || []));
  }, []);

  useEffect(() => {
    if (!apiId) return;
    api.get(`/versions/api/${apiId}`).then((response) => setVersions(response.data.versions || []));
  }, [apiId]);

  useEffect(() => {
    if (!versionId) return;
    api.get(`/routes/version/${versionId}`).then((response) => setRoutes(response.data.routes || []));
  }, [versionId]);

  const selectedApi = apis.find((item) => String(item.api_id) === String(apiId));
  const selectedVersion = versions.find((item) => String(item.version_id) === String(versionId));
  const selectedRoute = routes.find((item) => String(item.route_id) === String(routeId));

  const sendRequest = async () => {
    if (!selectedApi || !selectedVersion || !selectedRoute || !key) return;
    setSending(true);
    const path = selectedRoute.path.replace(/:([^/]+)/g, "1");
    const url = `/gateway/apis/${selectedApi.api_id}/${selectedVersion.version_number}${path}`;
    const started = performance.now();
    try {
      const response = await api.request({
        url,
        method: selectedRoute.http_method,
        headers: { "x-api-key": key },
        data: body ? JSON.parse(body) : undefined,
        validateStatus: () => true,
      });
      setResult({ status: response.status, time: Math.round(performance.now() - started), headers: response.headers, data: response.data, curl: `curl -X ${selectedRoute.http_method} '${window.location.origin}${url}' -H 'x-api-key: ${key}'` });
    } catch (error) {
      setResult({ status: error.response?.status || 0, time: Math.round(performance.now() - started), data: error.response?.data || error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="gateway-tester-page">
      <h1>Gateway Tester</h1>
      <p>Call a registered route with an API key and inspect the gateway response.</p>
      <div className="gateway-tester-controls">
        <select value={apiId} onChange={(event) => { setApiId(event.target.value); setVersionId(""); setRouteId(""); }}><option value="">Select API</option>{apis.map((item) => <option key={item.api_id} value={item.api_id}>{item.api_name}</option>)}</select>
        <select value={versionId} onChange={(event) => { setVersionId(event.target.value); setRouteId(""); }}><option value="">Select version</option>{versions.map((item) => <option key={item.version_id} value={item.version_id}>{item.version_number}</option>)}</select>
        <select value={routeId} onChange={(event) => setRouteId(event.target.value)}><option value="">Select route</option>{routes.map((item) => <option key={item.route_id} value={item.route_id}>{item.http_method} {item.path}</option>)}</select>
        <input value={key} onChange={(event) => setKey(event.target.value)} placeholder="Paste API key" type="password" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="JSON body (optional)" rows="4" />
        <button type="button" onClick={sendRequest} disabled={sending || !key || !routeId}>{sending ? "Sending..." : "Send request"}</button>
      </div>
      {result && <section className="gateway-tester-result"><h2>{result.status} in {result.time}ms</h2><pre>{JSON.stringify(result.data, null, 2)}</pre><code>{result.curl}</code></section>}
    </main>
  );
}

export default GatewayTester;