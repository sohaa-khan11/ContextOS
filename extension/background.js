const API_BASE = 'http://localhost:3000/api';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_TEXT') {
    handleAnalysis(request.text, request.projectId).then(sendResponse);
    return true; // Keep message channel open for async response
  }
  if (request.action === 'SAVE_MEMORY') {
    handleSaveMemory(request.text, request.metadata, request.source, request.projectId).then(sendResponse);
    return true;
  }
  if (request.action === 'GET_PROJECTS') {
    handleGetProjects().then(sendResponse);
    return true;
  }
});

async function handleGetProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { 'Authorization': 'Bearer mock-token' }
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    const projects = await res.json();
    return { success: true, data: projects };
  } catch (e) {
    console.error("GET_PROJECTS error:", e);
    return { error: e.message };
  }
}

async function handleAnalysis(text, projectId) {
  if (!projectId) return { error: "No active project in this tab" };

  try {
    const res = await fetch(`${API_BASE}/extension/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify({
        project_id: projectId,
        text: text
      })
    });
    if (!res.ok) throw new Error("Analysis failed");
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

async function handleSaveMemory(text, metadata, source, projectId) {
  if (!projectId) return { error: "No active project in this tab" };

  try {
    const res = await fetch(`${API_BASE}/extension/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify({
        project_id: projectId,
        text: text,
        source: source,
        metadata: metadata
      })
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Capture failed (HTTP ${res.status}): ${errText}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    console.error("handleSaveMemory Error:", e);
    return { error: e.message };
  }
}
