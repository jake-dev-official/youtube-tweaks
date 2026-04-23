function log(msg) {
  console.log('[YouTubeTweaks] ' + msg);
}

// Initialize toggles on load
(async () => {
  const settings = await chrome.storage.local.get([
    'enable_right_comments',
    'enable_hide_shorts',
    'enable_cinematic_mode',
    'cinematic_style',
    'aspect_ratio'
  ]);
  if (settings.enable_right_comments) applyRightComments(true);
  if (settings.enable_hide_shorts) applyHideShorts(true);
  if (settings.enable_cinematic_mode) {
    applyCinematicMode(true, settings.cinematic_style || 'crop', settings.aspect_ratio || '21');
  }
})();

// Logic is now handled via Manifest Commands (relayed through background.js)
// This ensures shortcuts work even if changed in Chrome settings.

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'updateToggles') {
    handleToggleUpdate(request);
    return;
  }

  if (isUserTyping()) return;

  const settings = await chrome.storage.local.get(['enable_shortcuts']);
  if (settings.enable_shortcuts === false) return;

  if (request.action === '02-gemini-ask') {
    findAndClickGemini();
  } else if (request.action === '03-smart-comments') {
    toggleComments();
  } else if (request.action === '01-right-comments') {
    toggleRightComments();
  } else if (request.action === '04-cinematic-mode') {
    toggleCinematicMode();
  } else if (request.action === 'show-quality-hud') {
    if (request.error) {
      log('Quality HUD Error: ' + request.error);
      showQualityHUD('Err: ' + request.error.substring(0, 8)); // Visual hint that an error occurred
    } else if (request.qualityText) {
      showQualityHUD(request.qualityText);
    }
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
  if (data.enableHideShorts !== undefined) applyHideShorts(data.enableHideShorts);
  if (data.enableCinematicMode !== undefined || data.cinematicStyle !== undefined || data.aspectRatio !== undefined) {
    applyCinematicMode(
      data.enableCinematicMode !== undefined ? data.enableCinematicMode : document.body.classList.contains('yt-cinematic'), 
      data.cinematicStyle || 'crop',
      data.aspectRatio || '21'
    );
  }
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
  
  // 1. Engagement Panel Logic (for side-panel/sidebar comments)
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

  // 2. Fullscreen Logic
  if (document.fullscreenElement) {
    const fullScreenCommentButton = document.querySelector('.ytp-chrome-controls [aria-label*="Comments"]') || 
                                     document.querySelector('button[aria-label*="Comments"]') ||
                                     document.querySelector('.ytp-button[aria-label*="Comments"]');
    
    if (fullScreenCommentButton) {
      fullScreenCommentButton.click();
      return;
    }
  }

  // 3. Smart Scroll Logic (for standard page layout)
  // If we are scrolled down significantly (e.g. looking at comments), go back to top
  if (window.scrollY > 200) {
    log('Scrolled down. Returning to top...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Otherwise, we are at the top, so let's find and scroll to comments
  const commentsSection = document.getElementById('comments') || 
                          document.querySelector('ytd-comments') ||
                          document.querySelector('ytd-item-section-renderer#sections');
  
  if (commentsSection) {
    log('At top. Scrolling to comments...');
    commentsSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    log('Comments section not found.');
  }
}

// Cinematic Mode Logic
async function toggleCinematicMode() {
  const result = await chrome.storage.local.get(['enable_cinematic_mode', 'cinematic_style', 'aspect_ratio']);
  const newState = !result.enable_cinematic_mode;
  await chrome.storage.local.set({ enable_cinematic_mode: newState });
  applyCinematicMode(newState, result.cinematic_style || 'crop', result.aspect_ratio || '21');
  log('Ctrl+. Triggered: Cinematic Mode is now ' + (newState ? 'ON' : 'OFF'));
}

function applyCinematicMode(enabled, style = 'crop', ratio = '21') {
  document.body.classList.remove('yt-style-crop', 'yt-style-stretch');
  document.body.classList.remove('yt-ratio-21', 'yt-ratio-235', 'yt-ratio-43');
  if (enabled) {
    document.body.classList.add('yt-cinematic');
    document.body.classList.add(`yt-style-${style}`);
    document.body.classList.add(`yt-ratio-${ratio}`);
  } else {
    document.body.classList.remove('yt-cinematic');
  }
  // Nudge YouTube player to recalculate layouts in case it got confused during transitions
  window.dispatchEvent(new Event('resize'));
}


// Hide Shorts Logic
async function toggleHideShorts() {
  const result = await chrome.storage.local.get(['enable_hide_shorts']);
  const newState = !result.enable_hide_shorts;
  await chrome.storage.local.set({ enable_hide_shorts: newState });
  applyHideShorts(newState);
  log('Alt+S Triggered: Hide Shorts is now ' + (newState ? 'ON' : 'OFF'));
}

function applyHideShorts(enabled) {
  if (enabled) {
    document.body.classList.add('yt-hide-shorts');
  } else {
    document.body.classList.remove('yt-hide-shorts');
  }
}

// Shortcut Modal Toggle Logic (Shift + /)
document.addEventListener('keydown', (e) => {
  // Only trigger on '?' (Shift + /)
  if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
    if (isUserTyping()) return;

    const modal = document.querySelector('ytd-hotkey-dialog-renderer');
    if (modal && modal.offsetParent !== null) {
      log('Shortcut modal detected. Attempting to toggle OFF...');
      
      // Prevent default to stop YouTube from potentially re-opening it
      e.preventDefault();
      e.stopImmediatePropagation();

      // Find the close button inside the modal and click it
      const closeButton = modal.querySelector('button[aria-label="Close"]') || 
                          modal.querySelector('#close-button') ||
                          modal.querySelector('tp-yt-paper-button');
      
      if (closeButton) {
        log('Clicking close button...');
        closeButton.click();
      } else {
        // Fallback: Use Escape key dispatch if button not found (though user said avoid it, this is a fallback for the MODAL)
        log('Close button not found, falling back to Escape dispatch...');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
    }
  }
}, true); // Use capture phase to intercept before YouTube's global listeners if possible

// Manual Key Listeners for features not in manifest commands (to stay under Chrome's 4-shortcut limit)
document.addEventListener('keydown', async (e) => {
  // Ctrl + ArrowUp / ArrowDown (Cycle Video Quality)
  if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    if (isUserTyping()) return;
    
    const settings = await chrome.storage.local.get(['enable_quality_cycle']);
    if (settings.enable_quality_cycle === false) return;

    // Prevent YouTube from intercepting (or scrolling the page)
    e.preventDefault();
    e.stopImmediatePropagation();
    
    const direction = e.key === 'ArrowUp' ? 'up' : 'down';
    log(`Ctrl+${e.key.replace('Arrow', '')} detected, cycling quality ${direction}...`);
    
    // Trigger main-world execution via background.js
    chrome.runtime.sendMessage({ action: 'cycle-quality-main', direction: direction });
  }

  // Alt + S (Hide YouTube Shorts Toggle)
  if (e.altKey && e.code === 'KeyS') {
    if (isUserTyping()) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    log('Alt+S detected, toggling shorts...');
    toggleHideShorts();
  }
}, true); // Use capture phase to intercept before YouTube's global listeners

// Quality switching logic has been moved to background.js -> Main World injection
// to bypass Content Security Policy constraints.

function showQualityHUD(qualityText) {
  let hud = document.getElementById('yt-tweaks-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'yt-tweaks-hud';
    
    // Attach directly to movie_player so it centers on the video and works in fullscreen
    const playerContainer = document.getElementById('movie_player');
    if (playerContainer) {
      playerContainer.appendChild(hud);
    } else {
      document.body.appendChild(hud);
    }
  }

  hud.innerHTML = `<span>Quality:</span> <strong>${qualityText}</strong>`;
  hud.classList.remove('fade-out');
  hud.classList.add('show');

  // Clear existing timeout
  if (window.hudTimeout) clearTimeout(window.hudTimeout);
  
  window.hudTimeout = setTimeout(() => {
    hud.classList.add('fade-out');
    hud.classList.remove('show');
  }, 1500);
}
