chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      if (command !== 'cycle-quality') { // cycle-quality is now manual only
        chrome.tabs.sendMessage(tabs[0].id, { action: command });
      }
    }
  });
});

// Listener for manual keys from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cycle-quality-main' && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: cycleQualityMainWorld,
      args: [request.direction]
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('[YouTubeTweaks] Background trigger error:', chrome.runtime.lastError.message);
        chrome.tabs.sendMessage(sender.tab.id, { action: 'show-quality-hud', error: chrome.runtime.lastError.message });
      } else if (results && results[0] && results[0].result) {
        chrome.tabs.sendMessage(sender.tab.id, { 
          action: 'show-quality-hud', 
          qualityText: results[0].result.qualityText,
          error: results[0].result.error 
        });
      }
    });
  }
});

// This function runs perfectly inside YouTube's MAIN world, bypassing Extension Isolation AND Content Security Policies
function cycleQualityMainWorld(direction) {
  try {
    const player = document.getElementById('movie_player');
    if (!player) return { error: 'movie_player not found in DOM.' };
    if (!player.getAvailableQualityLevels) return { error: 'getAvailableQualityLevels API not attached.' };

    const available = player.getAvailableQualityLevels();
    if (!available || available.length === 0) return { error: 'No quality levels available.' };

    // Explicit order: Lowest to highest, ending with auto.
    const knownOrder = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'highres', 'auto'];
    const cycleLevels = knownOrder.filter(q => available.includes(q) || q === 'auto');

    // Rely on an exact internal tracker rather than YouTube's active quality
    let lastQuality = player.dataset.ytTweaksQuality || 'auto';
    let currentIndex = cycleLevels.indexOf(lastQuality);

    if (currentIndex === -1) currentIndex = cycleLevels.length - 1; // Default to auto

    // Calculate next based on direction
    let nextIndex = currentIndex + (direction === 'up' ? 1 : -1);
    
    if (nextIndex >= cycleLevels.length) {
      nextIndex = 0; // Wrap back to lowest ('tiny')
    } else if (nextIndex < 0) {
      nextIndex = cycleLevels.length - 1; // Wrap back to highest ('auto')
    }
    
    const nextQuality = cycleLevels[nextIndex];
    player.dataset.ytTweaksQuality = nextQuality; // Save precise state

    try {
      if (nextQuality === 'auto') {
        player.setPlaybackQualityRange('auto');
        player.setPlaybackQuality('default'); // 'default' triggers auto
        player.setPlaybackQuality('auto');
        if (player.setOption) player.setOption('video-quality-settings', 'auto', true);
      } else {
        player.setPlaybackQualityRange(nextQuality, nextQuality);
        player.setPlaybackQuality(nextQuality);
        if (player.setOption) player.setOption('video-quality-settings', 'auto', false);
      }
    } catch (e) {
      console.error('[YouTubeTweaks MainWorld] Error calling setPlaybackQuality API:', e);
    }

    const qualityMap = {
      'highres': '8K / Highres',
      'hd2160': '4K / 2160p',
      'hd1440': '1440p',
      'hd1080': '1080p',
      'hd720': '720p',
      'large': '480p',
      'medium': '360p',
      'small': '240p',
      'tiny': '144p',
      'auto': 'Auto'
    };

    return { qualityText: qualityMap[nextQuality] || nextQuality };
  } catch (err) {
    return { error: 'Exception in main world: ' + err.message };
  }
}
