const AI_PLATFORMS = [
  'chat.openai.com',
  'chatgpt.com',
  'claude.ai',
  'gemini.google.com',
  'perplexity.ai',
  'github.com',
  'cursor.com'
];

// Meaningful technical content
const TECHNICAL_KEYWORDS = [
  "fastapi", "flask", "django", "express", "react", "nextjs", "vue", "angular",
  "redis", "postgres", "mongodb", "mysql", "sqlite", "dynamodb",
  "docker", "kubernetes", "aws", "gcp", "azure", "vercel", "heroku",
  "architecture", "recommendation", "tradeoff", "implementation", "todo", "risk",
  "decision", "we decided", "recommend", "should use", "scalability", "async",
  "rate limiting", "jwt", "authentication", "authorization", "oauth"
];

const currentDomain = window.location.hostname;
const isAIPlatform = AI_PLATFORMS.some(domain => currentDomain.includes(domain));

const suggestionCache = new Set(); // store texts we've already suggested or dismissed

console.log("[STEP 1] ContextOS Content Script Loaded on", currentDomain);

let overlaysContainer = null;
let shadowRoot = null;

if (isAIPlatform) {
  console.log("[STEP 1] Recognized AI Platform. Initializing UI and Observer...");
  initUIContainer();
  initObserver();
} else {
  console.log("[STEP 1] Not an AI Platform. Skipping initialization.");
}

function initUIContainer() {
  overlaysContainer = document.createElement('div');
  overlaysContainer.id = 'contextos-overlays-container';
  overlaysContainer.style.position = 'fixed';
  overlaysContainer.style.top = '0';
  overlaysContainer.style.left = '0';
  overlaysContainer.style.width = '100vw';
  overlaysContainer.style.height = '100vh';
  overlaysContainer.style.pointerEvents = 'none'; // click through empty space
  overlaysContainer.style.zIndex = '999999';
  
  shadowRoot = overlaysContainer.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    .overlay {
      position: absolute;
      pointer-events: none;
      border-left: 3px solid #34d399;
      padding-left: 8px;
      animation: glowPulse 2s infinite;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      margin-left: -11px;
    }
    @keyframes glowPulse {
      0% { border-left-color: rgba(52, 211, 153, 0.4); box-shadow: -4px 0 10px rgba(52, 211, 153, 0.0); }
      50% { border-left-color: rgba(52, 211, 153, 1); box-shadow: -4px 0 15px rgba(52, 211, 153, 0.2); }
      100% { border-left-color: rgba(52, 211, 153, 0.4); box-shadow: -4px 0 10px rgba(52, 211, 153, 0.0); }
    }
    .chip {
      background: rgba(5, 1, 10, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      font-family: -apple-system, sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.9);
      position: absolute;
      top: -36px;
      left: 0px;
      white-space: nowrap;
      transition: all 0.3s;
      pointer-events: auto;
    }
    .chip-title { font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .chip-actions { display: flex; gap: 6px; }
    button {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: bold;
      transition: background 0.2s;
    }
    button.save { background: rgba(52, 211, 153, 0.2); color: #34d399; }
    button.save:hover { background: rgba(52, 211, 153, 0.3); }
    button.dismiss:hover { background: rgba(255, 100, 100, 0.3); color: #ff6b6b; }
    button.why:hover { background: rgba(255,255,255,0.2); }
    
    .why-tooltip {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: #1e1e2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 12px;
      width: 250px;
      white-space: normal;
      color: rgba(255,255,255,0.8);
      font-size: 11px;
      line-height: 1.4;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .chip:hover .why-tooltip.show { display: block; }
  `;
  shadowRoot.appendChild(style);
  document.body.appendChild(overlaysContainer);
  
  window.addEventListener('scroll', updateOverlayPositions, true);
  window.addEventListener('resize', updateOverlayPositions);
}

const activeOverlays = new Map();

function updateOverlayPositions() {
  for (const [node, overlay] of activeOverlays.entries()) {
    if (!document.body.contains(node)) {
      overlay.remove();
      activeOverlays.delete(node);
      continue;
    }
    const rect = node.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.height = rect.height + 'px';
  }
}

// FIX 1: Filter to check if node is inside an assistant message.
// ChatGPT uses data-message-author-role="assistant" or .markdown
function isAssistantMessage(node) {
  let curr = node;
  while (curr && curr !== document.body) {
    if (curr.hasAttribute && curr.getAttribute('data-message-author-role') === 'assistant') {
      return true;
    }
    if (curr.classList && curr.classList.contains('markdown')) {
      return true;
    }
    curr = curr.parentNode;
  }
  return false;
}

// FIX 5: Check if > 40% are box drawing characters
function isDiagram(text) {
  const boxCharacters = /[│↓┌└─├┤┬┴┼╭╮╯╰]/g;
  const matches = text.match(boxCharacters);
  if (!matches) return false;
  return (matches.length / text.length) > 0.4;
}

// FIX 3: Calculate heuristic score
function calculateImportanceScore(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  TECHNICAL_KEYWORDS.forEach(kw => {
    if (lowerText.includes(kw)) score++;
  });
  return score;
}

function initObserver() {
  let debounceTimer;
  const observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log("[STEP 2] New DOM mutations detected (debounced)");
      const addedNodes = [];
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            addedNodes.push(node);
            const paragraphs = node.querySelectorAll ? node.querySelectorAll('p, li') : [];
            paragraphs.forEach(p => addedNodes.push(p));
          }
        });
      });

      const candidateNodes = Array.from(new Set(addedNodes)).filter((node, idx) => {
        if (!node.innerText) return false;
        
        // Ignore container nodes with many children to avoid duplicate highlights
        if (node.children.length > 5) return false;
        
        const text = node.innerText.trim();
        
        // FIX 1: Only check assistant messages
        if (!isAssistantMessage(node)) {
           return false;
        }

        console.log(`[STEP 3] Extracted Assistant Paragraph ${idx + 1}:\n${text}`);
        
        if (suggestionCache.has(text)) {
           console.log(`[STEP 4] Ignored. Reason: Already processed/cached.`);
           return false;
        }
        if (text.length < 80 || text.length > 1500) {
           console.log(`[STEP 4] Ignored. Reason: Invalid length (${text.length} chars).`);
           return false;
        }
        
        // FIX 5: Exclude diagrams
        if (isDiagram(text)) {
           console.log(`[STEP 4] Ignored. Reason: Detected as diagram (>40% box drawing characters).`);
           return false;
        }
        
        // FIX 3: Calculate score
        const score = calculateImportanceScore(text);
        
        // FIX 4: UI Fallback Debug Mode
        // We bypass the heuristic threshold completely for testing!
        console.log(`[STEP 4] UI DEBUG MODE ACTIVE. Score was ${score}. Bypassing heuristics and Groq.`);
        return true; 
      });

      if (candidateNodes.length > 0) {
        console.log(`[STEP 2] Found ${candidateNodes.length} candidate assistant paragraphs.`);
        const nodesToProcess = candidateNodes.slice(0, 5); // Allow up to 5 highlights in debug mode
        nodesToProcess.forEach((node, i) => {
          const text = node.innerText.trim();
          suggestionCache.add(text); 
          
          // STEP 10: FALLBACK TEST OVERRIDE
          console.log("[STEP 10] Triggering Fallback UI Test instead of API");
          createInlineSuggestion(node, text, {
             memory_type: "Test Suggestion",
             importance_score: 100,
             reason: "Fallback hardcoded UI test",
             should_save: true
          });
          
          // analyzeNode(node, text); // Disabled for UI Test
        });
      } else {
        console.log("[STEP 2] No viable assistant paragraphs found in this mutation block.");
      }
    }, 1500);
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function analyzeNode(node, text) {
  console.log(`[STEP 5] Sending to Groq:\nPrompt: ${text}`);
  chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: text }, (response) => {
    if (response && response.success && response.data) {
      const data = response.data;
      if (data.is_duplicate) {
         console.log(`[STEP 5] Groq returned Duplicate.`);
         return;
      }
      if (data.analysis) {
        console.log(`[STEP 5] Groq Response:\nConfidence: ${data.analysis.importance_score}\nMemory Type: ${data.analysis.memory_type}\nReason: ${data.analysis.reason}`);
        if (data.analysis.importance_score > 50 && data.analysis.should_save) {
          createInlineSuggestion(node, text, data.analysis);
        } else {
          console.log("[STEP 5] Ignored: Confidence too low or should_save is false.");
        }
      }
    } else {
      console.log(`[STEP 5] Groq Request Failed:`, response);
    }
  });
}

function createInlineSuggestion(node, text, analysis) {
  if (!document.body.contains(node)) {
     console.log("[STEP 7] Failed: Node is no longer in DOM.");
     return;
  }
  if (activeOverlays.has(node)) {
     console.log("[STEP 7] Failed: Node already has an overlay.");
     return;
  }

  console.log("[STEP 6] Creating overlay components...");

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  
  const rect = node.getBoundingClientRect();
  console.log(`[STEP 7] Bounding Client Rect:\nTop: ${rect.top}\nLeft: ${rect.left}\nWidth: ${rect.width}\nHeight: ${rect.height}`);
  
  if (rect.width === 0 || rect.height === 0) {
      console.log("[STEP 7] Warning: Bounding rect has 0 width or height. It might be off-screen or display:none.");
  }

  // Remove the strict CSS override and use real positioning 
  overlay.style.top = rect.top + 'px';
  overlay.style.left = rect.left + 'px';
  overlay.style.height = rect.height + 'px';

  console.log("[STEP 6] Creating chip...");
  const chip = document.createElement('div');
  chip.className = 'chip';
  
  const title = document.createElement('div');
  title.className = 'chip-title';
  title.innerHTML = `💡 ${analysis.memory_type} detected`;
  
  const actions = document.createElement('div');
  actions.className = 'chip-actions';
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'save';
  saveBtn.textContent = 'Save';
  
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'dismiss';
  dismissBtn.textContent = 'Dismiss';
  
  const whyBtn = document.createElement('button');
  whyBtn.className = 'why';
  whyBtn.textContent = 'Why?';
  
  const whyTooltip = document.createElement('div');
  whyTooltip.className = 'why-tooltip';
  whyTooltip.innerHTML = `<strong>Confidence:</strong> ${analysis.importance_score}%<br/><br/><strong>Reason:</strong> ${analysis.reason}`;

  whyBtn.onmouseenter = () => whyTooltip.classList.add('show');
  whyBtn.onmouseleave = () => whyTooltip.classList.remove('show');

  saveBtn.onclick = () => {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    chrome.runtime.sendMessage({
      action: 'SAVE_MEMORY', 
      text: text,
      metadata: {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
      },
      source: window.location.hostname
    }, (res) => {
      chip.innerHTML = `<div class="chip-title" style="color: #34d399">✓ Saved to ContextOS</div>`;
      overlay.style.animation = 'none';
      overlay.style.borderLeftColor = '#34d399';
      setTimeout(() => {
        overlay.remove();
        activeOverlays.delete(node);
      }, 2000);
    });
  };

  dismissBtn.onclick = () => {
    overlay.remove();
    activeOverlays.delete(node);
  };

  actions.appendChild(saveBtn);
  actions.appendChild(dismissBtn);
  actions.appendChild(whyBtn);
  
  chip.appendChild(title);
  chip.appendChild(actions);
  chip.appendChild(whyTooltip);
  
  overlay.appendChild(chip);
  shadowRoot.appendChild(overlay);
  
  console.log("[STEP 6] Shadow DOM attached successfully.");
  
  activeOverlays.set(node, overlay);
}
