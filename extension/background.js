const API_BASE = 'http://localhost:3000/api';

// Sync active project ID from dashboard URL automatically
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    try {
      const url = new URL(changeInfo.url);
      if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port === '3000' && url.pathname.startsWith('/projects/')) {
        const parts = url.pathname.split('/');
        const projectId = parts[parts.length - 1];
        if (projectId && projectId.length === 36) { // check if valid UUID length
          chrome.storage.local.set({ activeProjectId: projectId }, () => {
            console.log("[Extension Background] Active project updated from dashboard URL:", projectId);
          });
        }
      }
    } catch(e) {
      console.error("Error parsing tab URL:", e);
    }
  }
});

// Fetch the default project to use for background analysis
async function getActiveProject() {
  try {
    const data = await chrome.storage.local.get('activeProjectId');
    if (data.activeProjectId) {
      return data.activeProjectId;
    }
  } catch(e) {
    console.error("Failed to read activeProjectId from storage", e);
  }

  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { 'Authorization': 'Bearer mock-token' }
    });
    const projects = await res.json();
    if (projects && projects.length > 0) {
      const defaultId = projects[0].id;
      try {
        await chrome.storage.local.set({ activeProjectId: defaultId });
      } catch(e) {}
      return defaultId;
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
