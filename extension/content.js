console.log("[ContextOS] Clean Proactive Rewrite Loaded!");

let wasGenerating = false;
const activeOverlays = new Map();


// Simple helper to go up parent
function getParent(node) {
  return node.parentNode;
}

function isInsideCodeBlock(node) {
  let curr = node;
  while (curr && curr !== document.body) {
    if (curr.tagName === 'PRE' || curr.tagName === 'CODE') return true;
    curr = getParent(curr);
  }
  return false;
}

function isDiagram(text) {
  const structuralChars = /[│↓┌└─├┤┬┴┼╭╮╯╰|\\=>\\-]/g;
  const matches = text.match(structuralChars);
  const score = matches ? (matches.length / text.length) : 0;
  
  const lines = text.split('\n');
  let hasStandalone = false;
  for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^[↓|│┌└─├┤┬┴┼╭╮╯╰\-=>+^V\s]+$/i.test(trimmed)) {
          if (trimmed.length < 5 || /^[↓|│┌└─├┤┬┴┼╭╮╯╰\s]+$/i.test(trimmed)) {
              hasStandalone = true;
              break;
          }
      }
  }
  return (score > 0.3) || text.includes('===') || text.includes('---') || hasStandalone;
}

function isGenerating() {
  const stopBtn = document.querySelector('button[aria-label*="Stop"], button[data-testid*="stop"], button svg rect');
  if (stopBtn) return true;
  if (document.querySelector('.result-streaming')) return true;
  return false;
}

function getLatestAssistantContainer() {
  const all = Array.from(document.querySelectorAll('[data-message-author-role="assistant"], .markdown'));
  const topmost = all.filter(el => {
    if (el.tagName === 'FORM' || el.isContentEditable) return false;
    let curr = el.parentNode;
    while (curr && curr !== document.body) {
      if (curr.getAttribute && curr.getAttribute('data-message-author-role') === 'assistant') {
        return false;
      }
      if (curr.classList && curr.classList.contains('markdown')) {
        return false;
      }
      curr = curr.parentNode;
    }
    return true;
  });
  
  return topmost.length > 0 ? topmost[topmost.length - 1] : null;
}

function injectProactiveChip(para, container, analysisData) {
  para.style.position = 'relative';
  
  // Set margin-bottom to clear space for the horizontal toolbar below the paragraph
  para.style.marginBottom = '42px';
  
  const chip = document.createElement('div');
  chip.className = 'contextos-proactive-chip';
  chip.style.position = 'absolute';
  chip.style.top = 'calc(100% + 4px)';
  chip.style.right = '0px';
  
  // Premium flat horizontal toolbar style
  chip.style.backgroundColor = '#151a22';
  chip.style.border = '1px solid #2d3748';
  chip.style.color = '#cbd5e1';
  chip.style.borderRadius = '6px';
  chip.style.padding = '6px 12px';
  chip.style.fontSize = '11px';
  chip.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  chip.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)';
  chip.style.display = 'flex';
  chip.style.flexDirection = 'column';
  chip.style.zIndex = '999';
  chip.style.pointerEvents = 'auto';
  chip.style.width = '100%';
  chip.style.boxSizing = 'border-box';
  chip.style.transition = 'all 0.2s ease';
  
  // Header Row grouping left info block and buttons side by side
  const headerRow = document.createElement('div');
  headerRow.style.display = 'flex';
  headerRow.style.alignItems = 'center';
  headerRow.style.justifyContent = 'space-between';
  headerRow.style.width = '100%';
  headerRow.style.gap = '12px';
  
  const leftBlock = document.createElement('div');
  leftBlock.style.display = 'flex';
  leftBlock.style.alignItems = 'center';
  leftBlock.style.gap = '6px';
  leftBlock.style.overflow = 'hidden';
  leftBlock.style.textOverflow = 'ellipsis';
  leftBlock.style.whiteSpace = 'nowrap';
  
  const icon = document.createElement('span');
  icon.innerHTML = '💡';
  
  const label = document.createElement('span');
  label.style.fontWeight = 'bold';
  label.style.color = '#10b981';
  label.innerText = `Suggested ${analysisData.memory_type || 'Memory'}:`;
  
  const summaryText = document.createElement('span');
  summaryText.style.color = '#e2e8f0';
  summaryText.innerText = analysisData.summary || '';
  
  leftBlock.appendChild(icon);
  leftBlock.appendChild(label);
  leftBlock.appendChild(summaryText);
  headerRow.appendChild(leftBlock);
  
  const buttonRow = document.createElement('div');
  buttonRow.style.display = 'flex';
  buttonRow.style.gap = '6px';
  buttonRow.style.flexShrink = '0';
  
  // Create a container for the reasoning explanation (hidden by default)
  const whyReasonDiv = document.createElement('div');
  whyReasonDiv.style.display = 'none';
  whyReasonDiv.style.borderTop = '1px solid #2d3748';
  whyReasonDiv.style.paddingTop = '6px';
  whyReasonDiv.style.marginTop = '6px';
  whyReasonDiv.style.color = '#9ca3af';
  whyReasonDiv.style.fontSize = '10.5px';
  whyReasonDiv.style.lineHeight = '1.4';
  whyReasonDiv.style.whiteSpace = 'normal';
  whyReasonDiv.innerText = analysisData.reason || 'No explanation provided.';
  
  function createPillButton(text, bgColor, textColor, borderColor, onClick) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.style.backgroundColor = bgColor;
    btn.style.color = textColor;
    btn.style.border = borderColor ? `1px solid ${borderColor}` : 'none';
    btn.style.borderRadius = '4px';
    btn.style.padding = '3px 8px';
    btn.style.fontSize = '9.5px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.15s ease';
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.85';
      if (borderColor) btn.style.borderColor = textColor;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
      if (borderColor) btn.style.borderColor = borderColor;
    });
    btn.addEventListener('click', onClick);
    return btn;
  }
  
  // 2. Save Button - Hooks up the actual SAVE_MEMORY endpoint
  const saveBtn = createPillButton('SAVE', '#10b981', '#ffffff', null, (e) => {
    e.stopPropagation();
    saveBtn.innerText = 'SAVING...';
    saveBtn.disabled = true;
    
    chrome.runtime.sendMessage({
      action: 'SAVE_MEMORY',
      projectId: sessionStorage.getItem('contextos_project'),
      text: para.innerText.trim(),
      source: window.location.hostname,
      metadata: {
        analysis: {
          should_save: true,
          memory_type: analysisData.memory_type,
          importance_score: analysisData.importance_score,
          reason: analysisData.reason,
          summary: analysisData.summary
        },
        captured_from: window.location.href,
        raw_text: para.innerText.trim()
      }
    }, (res) => {
      if (res && res.success) {
        saveBtn.innerText = '✓ SAVED';
        saveBtn.style.backgroundColor = '#059669';
        console.log("[ContextOS] Memory saved successfully:", res.data);
        
        // Auto-close overlay after 2 seconds
        setTimeout(() => {
          chip.style.opacity = '0';
          chip.style.transform = 'scale(0.95)';
          setTimeout(() => {
            chip.remove();
            activeOverlays.delete(para);
            para.style.marginBottom = '';
          }, 200);
        }, 2000);
      } else {
        saveBtn.innerText = 'FAILED';
        saveBtn.style.backgroundColor = '#dc2626';
        saveBtn.disabled = false;
        console.error("[ContextOS] Memory save failed:", res ? res.error : "Unknown error");
      }
    });
  });
  
  // 3. Dismiss Button
  const dismissBtn = createPillButton('DISMISS', 'transparent', '#9ca3af', '#374151', (e) => {
    e.stopPropagation();
    chip.remove();
    activeOverlays.delete(para);
    para.style.marginBottom = '';
  });
  
  // 4. Why? Button - Toggles the reasoning explanation block inline
  const whyBtn = createPillButton('WHY?', 'transparent', '#9ca3af', '#374151', (e) => {
    e.stopPropagation();
    if (whyReasonDiv.style.display === 'none') {
      whyReasonDiv.style.display = 'block';
      // Increase paragraph bottom margin to clear space for the expanded toolbar height
      para.style.marginBottom = '98px';
    } else {
      whyReasonDiv.style.display = 'none';
      para.style.marginBottom = '42px';
    }
  });
  
  buttonRow.appendChild(whyBtn);
  buttonRow.appendChild(dismissBtn);
  buttonRow.appendChild(saveBtn);
  headerRow.appendChild(buttonRow);
  
  chip.appendChild(headerRow);
  chip.appendChild(whyReasonDiv);
  
  para.appendChild(chip);
  activeOverlays.set(para, chip);
  console.log("[ContextOS] Proactive memory suggestion chip injected below paragraph.");
}

function triggerAnalysis() {
  if (sessionStorage.getItem('contextos_active') !== 'true') return;

  const container = getLatestAssistantContainer();
  if (!container) {
    return;
  }
  
  const text = container.innerText.trim();
  
  const paragraphs = Array.from(container.querySelectorAll('p, pre'));
  const validParas = paragraphs.filter(p => {
    const pText = p.innerText.trim();
    const isCode = isInsideCodeBlock(p) || p.tagName === 'PRE';
    const isDiag = isDiagram(pText);
    
    return pText.length > 30 && !isCode && !isDiag && !p.isContentEditable;
  });
  
  const targetParas = validParas.slice(0, 3);

  targetParas.forEach(targetPara => {
    const paraText = targetPara.innerText.trim();
    
    chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: paraText, projectId: sessionStorage.getItem('contextos_project') }, (response) => {
      if (response && response.success && response.data && response.data.analysis) {
        const analysis = response.data.analysis;
        if (analysis.should_save) {
          injectProactiveChip(targetPara, container, analysis);
        }
      }
    });
  });
}

function checkState() {
  const active = isGenerating();
  
  if (active && !wasGenerating) {
    wasGenerating = true;
    console.log("[ContextOS] Streaming started...");
  } else if (!active && wasGenerating) {
    wasGenerating = false;
    console.log("[ContextOS] Streaming finished!");
    triggerAnalysis();
  }
}

setInterval(checkState, 1000);

function initContextOS() {
  const urlParams = new URLSearchParams(window.location.search);
  const qsProject = urlParams.get('contextos_project');
  
  if (qsProject) {
    sessionStorage.setItem('contextos_active', 'true');
    sessionStorage.setItem('contextos_project', qsProject);
    
    urlParams.delete('contextos_project');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
    window.history.replaceState({}, '', newUrl);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectManualWidget);
  } else {
    injectManualWidget();
  }
}

function injectManualWidget() {
  const widget = document.createElement('div');
  widget.className = 'contextos-widget-container';
  widget.style.position = 'fixed';
  widget.style.bottom = '24px';
  widget.style.right = '24px';
  widget.style.zIndex = '2147483647';
  widget.style.fontFamily = 'Inter, system-ui, sans-serif';
  
  const btn = document.createElement('button');
  btn.style.backgroundColor = '#151a22';
  btn.style.color = '#fff';
  btn.style.border = '1px solid #2d3748';
  btn.style.borderRadius = '24px';
  btn.style.padding = '8px 16px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '8px';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = '500';
  
  const statusIndicator = document.createElement('div');
  statusIndicator.style.width = '8px';
  statusIndicator.style.height = '8px';
  statusIndicator.style.borderRadius = '50%';
  
  const textSpan = document.createElement('span');
  
  const updateBtnUI = () => {
    const isActive = sessionStorage.getItem('contextos_active') === 'true';
    statusIndicator.style.backgroundColor = isActive ? '#10b981' : '#ef4444';
    statusIndicator.style.boxShadow = isActive ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none';
    textSpan.innerText = isActive ? 'ContextOS: Active' : 'ContextOS: Off';
  };
  
  updateBtnUI();
  
  btn.appendChild(statusIndicator);
  btn.appendChild(textSpan);
  
  const popup = document.createElement('div');
  popup.style.display = 'none';
  popup.style.position = 'absolute';
  popup.style.bottom = '100%';
  popup.style.right = '0';
  popup.style.marginBottom = '12px';
  popup.style.backgroundColor = '#151a22';
  popup.style.border = '1px solid #2d3748';
  popup.style.borderRadius = '12px';
  popup.style.padding = '16px';
  popup.style.width = '240px';
  popup.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
  
  const title = document.createElement('div');
  title.innerText = 'Target Project';
  title.style.color = '#9ca3af';
  title.style.marginBottom = '12px';
  title.style.fontSize = '11px';
  title.style.textTransform = 'uppercase';
  title.style.letterSpacing = '0.05em';
  
  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.padding = '8px';
  select.style.backgroundColor = '#05010a';
  select.style.color = '#fff';
  select.style.border = '1px solid #374151';
  select.style.borderRadius = '6px';
  select.style.marginBottom = '16px';
  select.style.fontSize = '13px';
  select.style.outline = 'none';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.style.width = '100%';
  toggleBtn.style.padding = '10px';
  toggleBtn.style.borderRadius = '6px';
  toggleBtn.style.border = 'none';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontWeight = 'bold';
  toggleBtn.style.fontSize = '13px';
  
  const updatePopupUI = () => {
    const isActive = sessionStorage.getItem('contextos_active') === 'true';
    if (isActive) {
      toggleBtn.innerText = 'Turn Off Capture';
      toggleBtn.style.backgroundColor = '#ef4444';
      toggleBtn.style.color = '#fff';
    } else {
      toggleBtn.innerText = 'Enable Proactive Capture';
      toggleBtn.style.backgroundColor = '#10b981';
      toggleBtn.style.color = '#fff';
    }
  };
  
  btn.onclick = (e) => {
    e.stopPropagation();
    if (popup.style.display === 'none') {
      popup.style.display = 'block';
      updatePopupUI();
      chrome.runtime.sendMessage({ action: 'GET_PROJECTS' }, (res) => {
        if (res && res.success) {
          select.innerHTML = '';
          res.data.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.innerText = p.name;
            select.appendChild(opt);
          });
          const currProject = sessionStorage.getItem('contextos_project');
          if (currProject) {
            select.value = currProject;
          } else if (res.data.length > 0) {
            select.value = res.data[0].id; // Default to first if none stored
          }
        }
      });
    } else {
      popup.style.display = 'none';
    }
  };
  
  toggleBtn.onclick = () => {
    const isActive = sessionStorage.getItem('contextos_active') === 'true';
    if (isActive) {
      sessionStorage.setItem('contextos_active', 'false');
    } else {
      if (select.value) {
        sessionStorage.setItem('contextos_active', 'true');
        sessionStorage.setItem('contextos_project', select.value);
      }
    }
    updateBtnUI();
    updatePopupUI();
    popup.style.display = 'none';
  };
  
  select.onchange = () => {
    if (sessionStorage.getItem('contextos_active') === 'true') {
      sessionStorage.setItem('contextos_project', select.value);
    }
  };

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      popup.style.display = 'none';
    }
  });
  
  popup.appendChild(title);
  popup.appendChild(select);
  popup.appendChild(toggleBtn);
  
  widget.appendChild(btn);
  widget.appendChild(popup);
  document.body.appendChild(widget);
}

initContextOS();
