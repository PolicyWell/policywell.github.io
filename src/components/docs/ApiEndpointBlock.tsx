import type { ApiEndpoint, HttpMethod } from "@/lib/api-reference-data";
import { API_BASE_URL } from "@/lib/api-reference-data";
import { CopyableCode } from "@/components/docs/CopyableCode";

function methodClass(method: HttpMethod) {
  return `pw-api-method pw-api-method-${method.toLowerCase()}`;
}

export function ApiEndpointBlock({ endpoint }: { endpoint: ApiEndpoint }) {
  const curl = buildCurl(endpoint);
  const fullUrl = `${API_BASE_URL}${endpoint.path}`;

  return (
    <section
      id={endpoint.id}
      className="pw-api-endpoint"
      aria-labelledby={`${endpoint.id}-title`}
    >
      <div className="pw-api-endpoint-head">
        <span className={methodClass(endpoint.method)}>{endpoint.method}</span>
        <code className="pw-api-path">{endpoint.path}</code>
        <span className={`pw-docs-status pw-docs-status-${endpoint.status.toLowerCase()}`}>
          {endpoint.status}
        </span>
      </div>
      <h3 id={`${endpoint.id}-title`} className="pw-api-endpoint-title">
        {endpoint.title}
      </h3>
      <p className="pw-api-endpoint-summary">{endpoint.summary}</p>

      <div className="pw-api-block">
        <h4>URL</h4>
        <CopyableCode code={fullUrl} label="Copy endpoint URL" />
      </div>

      {endpoint.params && endpoint.params.length > 0 && (
        <div className="pw-api-block">
          <h4>Parameters</h4>
          <div className="pw-api-table-wrap">
            <table className="pw-api-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">In</th>
                  <th scope="col">Type</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr key={`${p.in}-${p.name}`}>
                    <td>
                      <code>{p.name}</code>
                      {p.required ? (
                        <span className="pw-api-required"> required</span>
                      ) : null}
                    </td>
                    <td>{p.in}</td>
                    <td>{p.type}</td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {endpoint.requestBody && (
        <div className="pw-api-block">
          <h4>Request body</h4>
          {endpoint.requestBody.description ? (
            <p className="pw-api-endpoint-summary">{endpoint.requestBody.description}</p>
          ) : null}
          <CopyableCode
            code={JSON.stringify(endpoint.requestBody.example, null, 2)}
            label="Copy request body"
          />
        </div>
      )}

      <div className="pw-api-block">
        <h4>Example response</h4>
        <CopyableCode
          code={JSON.stringify(endpoint.responseExample, null, 2)}
          label="Copy example response"
        />
      </div>

      <div className="pw-api-block">
        <h4>cURL</h4>
        <CopyableCode code={curl} label="Copy cURL" />
      </div>

      {endpoint.notes && endpoint.notes.length > 0 && (
        <ul className="pw-api-notes">
          {endpoint.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function buildCurl(endpoint: ApiEndpoint): string {
  const path = endpoint.path.replace(/\{([^}]+)\}/g, (_, name) => `:${name}`);
  const url = `${API_BASE_URL}${path}`;
  const lines = [
    `curl -X ${endpoint.method} "${url}" \\`,
    `  -H "Authorization: Bearer pw_test_..." \\`,
    `  -H "Content-Type: application/json"`,
  ];
  if (endpoint.requestBody) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -d '${JSON.stringify(endpoint.requestBody.example)}'`);
  }
  return lines.join("\n");
}
