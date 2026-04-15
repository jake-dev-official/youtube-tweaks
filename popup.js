document.addEventListener('DOMContentLoaded', () => {
    const enableShortcuts = document.getElementById('enableShortcuts');
    const enableRightComments = document.getElementById('enableRightComments');
    const enableCinematicMode = document.getElementById('enableCinematicMode');
    const cinematicStyle = document.getElementById('cinematicStyle');
    const aspectRatio = document.getElementById('aspectRatio');
    const setupShortcuts = document.getElementById('setupShortcuts');

    // Update shortcut labels dynamically from Chrome Commands
    function updateShortcutLabels() {
        chrome.commands.getAll((commands) => {
            const map = {
                'toggle-gemini-ask': 'key-gemini',
                'toggle-comments': 'key-comments',
                'toggle-right-comments': 'key-right-comments',
                'toggle-cinematic-mode': 'key-cinematic'
            };
            commands.forEach(cmd => {
                const spanId = map[cmd.name];
                if (spanId) {
                    const el = document.getElementById(spanId);
                    if (el) el.textContent = cmd.shortcut || 'Not set';
                }
            });
        });
    }

    updateShortcutLabels();

    // Load current states
    chrome.storage.local.get(['enable_shortcuts', 'enable_right_comments', 'enable_cinematic_mode', 'cinematic_style', 'aspect_ratio'], (result) => {
        enableShortcuts.checked = result.enable_shortcuts !== false;
        enableRightComments.checked = result.enable_right_comments === true;
        enableCinematicMode.checked = result.enable_cinematic_mode === true;
        cinematicStyle.value = result.cinematic_style || 'crop';
        aspectRatio.value = result.aspect_ratio || '21';
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

    enableCinematicMode.addEventListener('change', () => {
        chrome.storage.local.set({ enable_cinematic_mode: enableCinematicMode.checked });
        notifyToggles();
    });

    cinematicStyle.addEventListener('change', () => {
        chrome.storage.local.set({ cinematic_style: cinematicStyle.value });
        notifyToggles();
    });

    aspectRatio.addEventListener('change', () => {
        chrome.storage.local.set({ aspect_ratio: aspectRatio.value });
        notifyToggles();
    });

    setupShortcuts.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    function notifyToggles() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'updateToggles',
                    enableShortcuts: enableShortcuts.checked,
                    enableRightComments: enableRightComments.checked,
                    enableCinematicMode: enableCinematicMode.checked,
                    cinematicStyle: cinematicStyle.value,
                    aspectRatio: aspectRatio.value
                }, () => {
                    // Squelch expected errors from non-YouTube tabs or reloads
                    if (chrome.runtime.lastError) {
                        // Extension message failed, which is normal for non-YouTube tabs
                    }
                });
            }
        });
    }
});
