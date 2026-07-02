const AI_PLATFORMS = [
  'chat.openai.com',
  'chatgpt.com',
  'claude.ai',
  'gemini.google.com',
  'perplexity.ai',
  'github.com',
  'cursor.com'
];

const currentDomain = window.location.hostname;
const isAIPlatform = AI_PLATFORMS.some(domain => currentDomain.includes(domain));

let suggestionQueue = [];
let isPanelOpen = false;
let shadowRoot = null;

if (isAIPlatform) {
  initObserver();
  initUI();
}

function initObserver() {
  let debounceTimer;
  
  const observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Find all paragraph-like elements that are newly added
      // A simple heuristic: look at the text of the page.
      // But instead of looking at the whole page, we can track newly added large text blocks.
      
      const addedNodes = [];
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            addedNodes.push(node);
          }
        });
      });

      // Filter for elements that contain substantial text
      const newTextBlocks = addedNodes
        .map(n => n.innerText || n.textContent)
        .filter(text => text && text.trim().length > 150); // Arbitrary length for "meaningful block"

      if (newTextBlocks.length > 0) {
        // Send the latest largest block for analysis
        const textToAnalyze = newTextBlocks.sort((a, b) => b.length - a.length)[0];
        analyzeText(textToAnalyze);
      }
    }, 2000); // Wait 2s for typing/streaming to settle
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function analyzeText(text) {
  chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: text }, (response) => {
    if (response && response.success && response.data) {
      const data = response.data;
      if (data.is_duplicate) return; // Ignore duplicates
      if (data.analysis && data.analysis.importance_score > 50) { // Only suggest highly important stuff
        suggestionQueue.push({
          id: Date.now(),
          text: text,
          analysis: data.analysis,
          related: data.related_memories || []
        });
        updateIndicator();
      }
    }
  });
}

function initUI() {
  const container = document.createElement('div');
  container.id = 'contextos-container';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  
  shadowRoot = container.attachShadow({ mode: 'open' });
  
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    :host {
      --color-primary: #34d399;
      --color-bg: rgba(0, 0, 0, 0.7);
      --color-panel: rgba(5, 1, 10, 0.95);
      --color-border: rgba(255, 255, 255, 0.1);
      --color-text: rgba(255, 255, 255, 0.9);
      --color-text-dim: rgba(255, 255, 255, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .indicator {
      background: var(--color-bg);
      backdrop-filter: blur(8px);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      padding: 8px 16px;
      color: var(--color-text);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: none;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }
    .indicator:hover {
      background: rgba(0,0,0,0.9);
      border-color: var(--color-primary);
    }
    .indicator.pulse {
      animation: indicator-pulse 2s infinite;
    }
    @keyframes indicator-pulse {
      0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
      100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
    }
    
    .panel {
      position: absolute;
      bottom: 50px;
      right: 0;
      width: 320px;
      background: var(--color-panel);
      backdrop-filter: blur(16px);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 16px;
      display: none;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      max-height: 400px;
      overflow-y: auto;
    }
    
    /* Scrollbar styling */
    .panel::-webkit-scrollbar { width: 4px; }
    .panel::-webkit-scrollbar-track { background: transparent; }
    .panel::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }

    .suggestion-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 12px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .score {
      font-family: monospace;
      color: var(--color-primary);
      font-size: 14px;
      font-weight: bold;
    }
    .type-badge {
      font-size: 9px;
      font-family: monospace;
      text-transform: uppercase;
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--color-text);
    }
    .summary {
      font-size: 12px;
      color: var(--color-text);
      line-height: 1.4;
      margin-bottom: 8px;
    }
    .reason {
      font-size: 11px;
      color: var(--color-text-dim);
      font-style: italic;
      margin-bottom: 12px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    button {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      border: none;
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-save {
      background: rgba(52, 211, 153, 0.1);
      color: var(--color-primary);
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .btn-save:hover { background: rgba(52, 211, 153, 0.2); }
    .btn-dismiss {
      background: rgba(255,255,255,0.05);
      color: var(--color-text-dim);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-dismiss:hover { background: rgba(255,255,255,0.1); color: var(--color-text); }
  `;
  shadowRoot.appendChild(style);

  const indicator = document.createElement('div');
  indicator.className = 'indicator';
  indicator.id = 'indicator';
  indicator.innerHTML = `<span>🧠</span> <span id="indicator-text"></span>`;
  indicator.onclick = () => {
    isPanelOpen = !isPanelOpen;
    renderPanel();
  };
  shadowRoot.appendChild(indicator);
  
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = 'panel';
  shadowRoot.appendChild(panel);

  document.body.appendChild(container);
}

function updateIndicator() {
  const indicator = shadowRoot.getElementById('indicator');
  const text = shadowRoot.getElementById('indicator-text');
  
  if (suggestionQueue.length > 0) {
    indicator.style.display = 'flex';
    indicator.classList.add('pulse');
    text.textContent = `${suggestionQueue.length} Memory Suggestion${suggestionQueue.length > 1 ? 's' : ''}`;
  } else {
    indicator.style.display = 'none';
    indicator.classList.remove('pulse');
    isPanelOpen = false;
    renderPanel();
  }
}

function renderPanel() {
  const panel = shadowRoot.getElementById('panel');
  if (!isPanelOpen) {
    panel.style.display = 'none';
    return;
  }
  
  panel.style.display = 'flex';
  panel.innerHTML = '';
  
  if (suggestionQueue.length === 0) {
    isPanelOpen = false;
    panel.style.display = 'none';
    return;
  }

  suggestionQueue.forEach((suggestion) => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
      <div class="header-row">
        <div class="score">${suggestion.analysis.importance_score}%</div>
        <div class="type-badge">${suggestion.analysis.memory_type}</div>
      </div>
      <div class="summary">${suggestion.analysis.summary}</div>
      <div class="reason">${suggestion.analysis.reason}</div>
      <div class="actions">
        <button class="btn-save">Save</button>
        <button class="btn-dismiss">Dismiss</button>
      </div>
    `;
    
    card.querySelector('.btn-dismiss').onclick = () => {
      suggestionQueue = suggestionQueue.filter(s => s.id !== suggestion.id);
      updateIndicator();
      renderPanel();
    };
    
    card.querySelector('.btn-save').onclick = () => {
      const btn = card.querySelector('.btn-save');
      btn.textContent = "Saving...";
      btn.disabled = true;
      
      const metadata = {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
      };
      
      chrome.runtime.sendMessage({
        action: 'SAVE_MEMORY', 
        text: suggestion.text,
        metadata: metadata,
        source: metadata.domain
      }, (res) => {
        suggestionQueue = suggestionQueue.filter(s => s.id !== suggestion.id);
        updateIndicator();
        renderPanel();
      });
    };
    
    panel.appendChild(card);
  });
}
