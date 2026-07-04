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
  const container = getLatestAssistantContainer();
  if (!container) {
    console.log("[ContextOS] No assistant container found.");
    return;
  }
  
  const text = container.innerText.trim();
  console.log("==========================================");
  console.log("[ContextOS] READ ASSISTANT MESSAGE CONTENT:");
  console.log(text);
  console.log("==========================================");
  
  const paragraphs = Array.from(container.querySelectorAll('p, pre'));
  const validParas = paragraphs.filter(p => {
    const pText = p.innerText.trim();
    const isCode = isInsideCodeBlock(p) || p.tagName === 'PRE';
    const isDiag = isDiagram(pText);
    
    console.log(`[ContextOS] Paragraph check - isCode: ${isCode}, isDiag: ${isDiag}, text: "${pText.substring(0, 40).replace(/\n/g, ' ')}..."`);
    
    return pText.length > 30 && !isCode && !isDiag && !p.isContentEditable;
  });
  
  const targetParas = validParas.slice(0, 3);
  console.log(`[ContextOS] Selected ${targetParas.length} paragraphs for parallel analysis.`);

  targetParas.forEach(targetPara => {
    const paraText = targetPara.innerText.trim();
    console.log(`[ContextOS] Dispatching analysis for: "${paraText.substring(0, 40)}..."`);
    
    chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: paraText }, (response) => {
      console.log(`[ContextOS] Response received for: "${paraText.substring(0, 40)}...":`, response);
      if (response && response.success && response.data && response.data.analysis) {
        const analysis = response.data.analysis;
        console.log(`[ContextOS] should_save: ${analysis.should_save}, importance: ${analysis.importance_score}`);
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
