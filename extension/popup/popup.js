document.addEventListener('DOMContentLoaded', async () => {
  const toast = document.getElementById('lifecycle-toast');
  const projectSelect = document.getElementById('project-select');
  
  const loadingView = document.getElementById('loading-view');
  const noSelectionView = document.getElementById('no-selection-view');
  const analysisView = document.getElementById('analysis-view');
  const handoffView = document.getElementById('handoff-view');
  
  const saveBtn = document.getElementById('save-btn');
  const discardBtn = document.getElementById('discard-btn');
  
  const pulse = document.getElementById('status-pulse');
  const statusText = document.getElementById('status-text');

  let currentSelection = '';
  let currentTabInfo = null;
  let analysisResult = null;
  let allProjects = [];

  const AI_PLATFORMS = {
    'chat.openai.com': 'ChatGPT',
    'chatgpt.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini',
    'perplexity.ai': 'Perplexity',
    'github.com': 'GitHub',
    'cursor.com': 'Cursor'
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = `> ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  };

  // 1. Fetch Projects
  try {
    const res = await fetch('http://localhost:3000/api/projects', {
      headers: { 'Authorization': 'Bearer mock-token' }
    });
    allProjects = await res.json();
    if (allProjects && allProjects.length > 0) {
      projectSelect.innerHTML = '';
      allProjects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        projectSelect.appendChild(opt);
      });
    }
  } catch (e) {
    console.error("Failed to load projects", e);
    showToast("Failed to connect to ContextOS");
  }

  // 2. Extract Text & Metadata from Active Tab
  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error("No active tab");
    
    currentTabInfo = {
      url: tab.url,
      title: tab.title,
      domain: new URL(tab.url).hostname
    };

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    });

    currentSelection = injectionResults[0]?.result || '';
  } catch (e) {
    console.error("Content extraction failed", e);
  }

  const detectedAI = AI_PLATFORMS[currentTabInfo?.domain] || Object.keys(AI_PLATFORMS).find(domain => currentTabInfo?.domain.includes(domain)) ? AI_PLATFORMS[Object.keys(AI_PLATFORMS).find(domain => currentTabInfo?.domain.includes(domain))] : null;

  // 3. Routing
  if (!currentSelection.trim()) {
    if (detectedAI) {
      // Show Handoff View
      handoffView.style.display = 'block';
      document.getElementById('current-platform-name').textContent = detectedAI;
      
      const currentProject = allProjects.find(p => p.id === projectSelect.value) || allProjects[0];
      let syncTime = 'Unknown';
      if (currentProject?.last_activity_at) {
        try {
          const date = new Date(currentProject.last_activity_at);
          syncTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch(e) {}
      }
      document.getElementById('last-sync-time').textContent = syncTime;

      // Render Recent Activity
      document.querySelector('.analysis-card').innerHTML = `
        <span class="label">Recent Activity</span>
        <div class="related-item" style="margin-top: 8px;">Last project update: ${syncTime}</div>
        <div class="related-item">Last remembered: ${syncTime}</div>
        <div class="related-item">Context Size: Optimized</div>
      `;

      // Handoff Logic
      document.getElementById('continue-btn').addEventListener('click', async () => {
        const btn = document.getElementById('continue-btn');
        btn.textContent = "Generating Context...";
        btn.disabled = true;
        
        try {
          const projectId = projectSelect.value;
          const res = await fetch(`http://localhost:3000/api/projects/${projectId}/continuation-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (data.prompt) {
            await navigator.clipboard.writeText(data.prompt);
            btn.style.display = 'none';
            document.getElementById('handoff-success-state').style.display = 'block';
            
            document.getElementById('open-current-btn').addEventListener('click', () => {
              window.close();
            });
          } else {
            showToast('Failed to generate prompt');
            btn.textContent = "Continue Project";
            btn.disabled = false;
          }
        } catch(e) {
          showToast('Error generating prompt');
          btn.textContent = "Continue Project";
          btn.disabled = false;
          console.error(e);
        }
      });
      
      // Destination buttons
      document.querySelectorAll('.dest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chrome.tabs.create({ url: btn.dataset.url });
        });
      });

    } else {
      noSelectionView.style.display = 'block';
    }
    return;
  }

  // 4. AI Analysis Step (Text Selected)
  loadingView.style.display = 'block';
  pulse.classList.add('analyzing');
  statusText.textContent = "Analyzing Context...";

  try {
    const projectId = projectSelect.value || allProjects[0]?.id;
    if (!projectId) throw new Error("No project selected");

    const res = await fetch('http://localhost:3000/api/extension/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify({
        project_id: projectId,
        text: currentSelection
      })
    });
    
    if (!res.ok) throw new Error("Analysis failed");
    
    analysisResult = await res.json();
    
    // 5. Render Analysis UI
    loadingView.style.display = 'none';
    analysisView.style.display = 'block';
    pulse.classList.remove('analyzing');
    statusText.textContent = "ContextOS Link";

    document.getElementById('importance-score').textContent = `${analysisResult.analysis.importance_score}%`;
    document.getElementById('memory-type').textContent = analysisResult.analysis.memory_type;
    document.getElementById('analysis-summary').textContent = analysisResult.analysis.summary;
    document.getElementById('analysis-reason').textContent = analysisResult.analysis.reason;

    if (analysisResult.related_memories && analysisResult.related_memories.length > 0) {
      const rmContainer = document.getElementById('related-memories-container');
      const rmList = document.getElementById('related-list');
      rmContainer.style.display = 'block';
      analysisResult.related_memories.forEach(rm => {
        const div = document.createElement('div');
        div.className = 'related-item';
        div.textContent = rm;
        rmList.appendChild(div);
      });
    }

    if (analysisResult.is_duplicate) {
      const dupContainer = document.getElementById('duplicate-alert-container');
      dupContainer.innerHTML = `
        <div class="duplicate-alert">
          <strong>Already remembered.</strong><br/>
          This exact context was captured ${analysisResult.duplicate_time}.
        </div>
      `;
      saveBtn.textContent = "Save Anyway";
    }

  } catch (e) {
    console.error(e);
    loadingView.style.display = 'none';
    noSelectionView.style.display = 'block';
    showToast("Analysis Engine Offline");
    pulse.classList.remove('analyzing');
    statusText.textContent = "ContextOS Link";
  }

  // 6. Save/Discard Actions
  discardBtn.addEventListener('click', () => {
    window.close();
  });

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    
    try {
      const projectId = projectSelect.value;
      const res = await fetch('http://localhost:3000/api/extension/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          project_id: projectId,
          text: currentSelection,
          source: currentTabInfo.domain,
          metadata: {
            url: currentTabInfo.url,
            title: currentTabInfo.title,
            domain: currentTabInfo.domain,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      await res.json();
      showToast('Memory Injected!');
      setTimeout(() => window.close(), 1500);
      
    } catch (e) {
      showToast('Error capturing');
      saveBtn.disabled = false;
      saveBtn.textContent = "Retry Save";
      console.error(e);
    }
  });

});
