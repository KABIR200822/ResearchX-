const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function parseError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  return new Error(payload.detail || fallback);
}

export async function checkResearchApi() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw await parseError(response, 'Research API health check failed.');
  return response.json();
}

export async function runResearch(payload) {
  const response = await fetch(`${API_BASE}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseError(response, 'Research request failed.');
  return response.json();
}

export async function downloadResearchPdf(payload) {
  const response = await fetch(`${API_BASE}/api/research/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseError(response, 'PDF export failed.');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = 'researchx-report.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
