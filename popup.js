document.addEventListener('DOMContentLoaded', () => {
    const enableShortcuts = document.getElementById('enableShortcuts');
    const enableRightComments = document.getElementById('enableRightComments');

    // Load current states
    chrome.storage.local.get(['enable_shortcuts', 'enable_right_comments'], (result) => {
        enableShortcuts.checked = result.enable_shortcuts !== false;
        enableRightComments.checked = result.enable_right_comments === true;
    });

    // Handle Toggles
    enableShortcuts.addEventListener('change', () => {
        chrome.storage.local.set({ enable_shortcuts: enableShortcuts.checked });
        notifyToggles();
    });

    enableRightComments.addEventListener('change', () => {
        chrome.storage.local.set({ enable_right_comments: enableRightComments.checked });
        notifyToggles();
    });

    function notifyToggles() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'updateToggles',
                    enableShortcuts: enableShortcuts.checked,
                    enableRightComments: enableRightComments.checked
                });
            }
        });
    }
});
