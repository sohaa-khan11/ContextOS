const API_BASE = 'http://localhost:3000/api';
let activeProjectId = null;

// Fetch the default project to use for background analysis
async function getActiveProject() {
  if (activeProjectId) return activeProjectId;
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { 'Authorization': 'Bearer mock-token' }
    });
    const projects = await res.json();
    if (projects && projects.length > 0) {
      activeProjectId = projects[0].id;
      return activeProjectId;
    }
  } catch (e) {
    console.error("Failed to fetch projects in background", e);
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_TEXT') {
    handleAnalysis(request.text).then(sendResponse);
    return true; // Keep message channel open for async response
  }
  if (request.action === 'SAVE_MEMORY') {
    handleSaveMemory(request.text, request.metadata, request.source).then(sendResponse);
    return true;
  }
});

async function handleAnalysis(text) {
  const projectId = await getActiveProject();
  if (!projectId) return { error: "No active project" };

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

async function handleSaveMemory(text, metadata, source) {
  const projectId = await getActiveProject();
  if (!projectId) return { error: "No active project" };

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
    if (!res.ok) throw new Error("Capture failed");
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}
