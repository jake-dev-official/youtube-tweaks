function log(msg) {
  console.log('[YouTubeTweaks] ' + msg);
}

// Initialize toggles on load
(async () => {
  const settings = await chrome.storage.local.get(['enable_right_comments']);
  if (settings.enable_right_comments) applyRightComments(true);
})();

// Global keydown for features that don't fit in manifest limit (Ctrl+,)
window.addEventListener('keydown', (e) => {
  if (isUserTyping()) return;
  if (e.ctrlKey && e.key === ',') {
    e.preventDefault();
    toggleRightComments();
  }
});

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'updateToggles') {
    handleToggleUpdate(request);
    return;
  }

  if (isUserTyping()) return;

  const settings = await chrome.storage.local.get(['enable_shortcuts']);
  if (settings.enable_shortcuts === false) return;

  if (request.action === 'toggle-gemini-ask') {
    findAndClickGemini();
  } else if (request.action === 'toggle-comments') {
    toggleComments();
  }
});

async function toggleRightComments() {
  const result = await chrome.storage.local.get(['enable_right_comments']);
  const newState = !result.enable_right_comments;
  await chrome.storage.local.set({ enable_right_comments: newState });
  applyRightComments(newState);
  log('Ctrl+, Triggered: Comments on Right is now ' + (newState ? 'ON' : 'OFF'));
}

function handleToggleUpdate(data) {
  log('Toggles updated: ' + JSON.stringify(data));
  if (data.enableRightComments !== undefined) applyRightComments(data.enableRightComments);
}

function applyRightComments(enabled) {
  if (enabled) {
    moveCommentsToRight();
  } else {
    restoreComments();
  }
}

function moveCommentsToRight() {
  const sidebar = document.querySelector('#secondary #secondary-inner');
  const comments = document.querySelector('#comments');
  
  if (sidebar && comments) {
    log('Moving comments to sidebar...');
    // Create container if not exists
    let container = document.getElementById('tweaks-sidebar-comments');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tweaks-sidebar-comments';
      container.style.marginTop = '20px';
      container.style.borderTop = '1px solid var(--yt-spec-10-percent-layer)';
      sidebar.prepend(container);
    }
    container.appendChild(comments);
    document.body.classList.add('comments-on-right');
  } else {
    // Retry if DOM not ready
    setTimeout(() => moveCommentsToRight(), 1000);
  }
}

function restoreComments() {
  const comments = document.querySelector('#comments');
  const primary = document.querySelector('#primary-inner') || document.querySelector('#primary');
  const sidebarContainer = document.querySelector('#tweaks-sidebar-comments');

  if (comments && primary) {
    log('Restoring comments to default location...');
    // Ensure visibility before moving
    comments.style.display = 'block';
    comments.style.visibility = 'visible';
    comments.style.opacity = '1';
    
    primary.appendChild(comments);
    if (sidebarContainer) sidebarContainer.remove();
    document.body.classList.remove('comments-on-right');
    
    // Force YouTube to recalculate layout
    window.dispatchEvent(new Event('resize'));
  }
}

function isUserTyping() {
  const activeElement = document.activeElement;
  const isInput = activeElement.tagName === 'INPUT' || 
                  activeElement.tagName === 'TEXTAREA' || 
                  activeElement.isContentEditable;
  return isInput;
}

function findAndClickGemini() {
  log('Toggling Gemini Ask...');
  
  // 1. Check if the Ask panel is already open and try to close it
  const activePanel = document.querySelector('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]');
  const isAskPanel = activePanel && (
    activePanel.innerText.includes('Ask') || 
    activePanel.getAttribute('target-id')?.includes('ask')
  );

  if (isAskPanel) {
    const closeButton = activePanel.querySelector('button[aria-label="Close"]');
    if (closeButton) {
      log('Closing Gemini Ask panel...');
      closeButton.click();
      return;
    }
  }

  // 2. Otherwise, find and click the "Ask" trigger button
  const askButton = document.querySelector('button[aria-label="Ask"]');
  if (askButton) {
    askButton.click();
  } else {
    log('YouTube Ask button not found.');
  }
}

function toggleComments() {
  log('Toggling Comments...');
  
  const activeCommentPanel = document.querySelector('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]');
  const isCommentPanel = activeCommentPanel && (
    activeCommentPanel.innerText.includes('Comments') || 
    activeCommentPanel.getAttribute('target-id') === 'engagement-panel-comments'
  );

  if (isCommentPanel) {
    const closeButton = activeCommentPanel.querySelector('button[aria-label="Close"]');
    if (closeButton) {
      log('Closing Comments panel...');
      closeButton.click();
      return;
    }
  }

  if (document.fullscreenElement) {
    const fullScreenCommentButton = document.querySelector('.ytp-chrome-controls [aria-label*="Comments"]') || 
                                     document.querySelector('button[aria-label*="Comments"]') ||
                                     document.querySelector('.ytp-button[aria-label*="Comments"]');
    
    if (fullScreenCommentButton) {
      fullScreenCommentButton.click();
      return;
    }
  }

  const commentsSection = document.getElementById('comments') || 
                          document.querySelector('ytd-comments') ||
                          document.querySelector('ytd-item-section-renderer#sections');
  
  if (commentsSection) {
    const rect = commentsSection.getBoundingClientRect();
    if (!document.fullscreenElement && rect.top >= 0 && rect.top <= 100) {
      log('Already at comments. Scrolling back to top...');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => log('Error exiting full screen: ' + err));
    }
    commentsSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    log('Comments section not found.');
  }
}
