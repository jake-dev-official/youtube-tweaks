document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const enableSearchInput = document.getElementById('enableSearch');
  const enableShortcutsInput = document.getElementById('enableShortcuts');
  const saveButton = document.getElementById('save');
  const statusEl = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['gemini_api_key', 'enable_search', 'enable_shortcuts'], (result) => {
    if (result.gemini_api_key) {
      apiKeyInput.value = result.gemini_api_key;
    }
    enableSearchInput.checked = result.enable_search !== false; // Default to true
    enableShortcutsInput.checked = result.enable_shortcuts !== false; // Default to true
  });

  // Save Settings
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const enableSearch = enableSearchInput.checked;
    const enableShortcuts = enableShortcutsInput.checked;

    chrome.storage.local.set({ 
      gemini_api_key: apiKey,
      enable_search: enableSearch,
      enable_shortcuts: enableShortcuts
    }, () => {
      showStatus('Settings saved!', 'success');
    });
  });

  function showStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = `status ${type}`;
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 2000);
  }
});
