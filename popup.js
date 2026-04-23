document.addEventListener('DOMContentLoaded', () => {
    const enableQualityCycle = document.getElementById('enableQualityCycle');
    const enableShortcuts = document.getElementById('enableShortcuts');
    const enableRightComments = document.getElementById('enableRightComments');
    const enableCinematicMode = document.getElementById('enableCinematicMode');
    const enableHideShorts = document.getElementById('enableHideShorts');
    const cinematicStyle = document.getElementById('cinematicStyle');
    const aspectRatio = document.getElementById('aspectRatio');
    const setupShortcuts = document.getElementById('setupShortcuts');

    // Update shortcut labels dynamically from Chrome Commands
    function updateShortcutLabels() {
        chrome.commands.getAll((commands) => {
            const map = {
                '01-right-comments': 'key-right-comments',
                '02-gemini-ask': 'key-gemini',
                '03-smart-comments': 'key-comments',
                '04-cinematic-mode': 'key-cinematic'
            };
            commands.forEach(cmd => {
                const spanId = map[cmd.name];
                if (spanId) {
                    const el = document.getElementById(spanId);
                    if (el) {
                        const formattedShortcut = (cmd.shortcut || 'Not set').replace(/\+/g, ' + ');
                        el.textContent = formattedShortcut;
                        el.classList.add('key-badge-official');
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
                        });
                    }
                }
            });
            // Quality Cycle is now bi-directional manual keys to bypass limits
        });
    }

    updateShortcutLabels();

    // Load current states
    chrome.storage.local.get(['enable_quality_cycle', 'enable_shortcuts', 'enable_right_comments', 'enable_cinematic_mode', 'enable_hide_shorts', 'cinematic_style', 'aspect_ratio'], (result) => {
        enableQualityCycle.checked = result.enable_quality_cycle !== false;
        enableShortcuts.checked = result.enable_shortcuts !== false;
        enableRightComments.checked = result.enable_right_comments === true;
        enableCinematicMode.checked = result.enable_cinematic_mode === true;
        enableHideShorts.checked = result.enable_hide_shorts === true;
        cinematicStyle.value = result.cinematic_style || 'crop';
        aspectRatio.value = result.aspect_ratio || '21';
    });

    // Handle Toggles
    enableQualityCycle.addEventListener('change', () => {
        chrome.storage.local.set({ enable_quality_cycle: enableQualityCycle.checked });
        notifyToggles();
    });

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

    enableHideShorts.addEventListener('change', () => {
        chrome.storage.local.set({ enable_hide_shorts: enableHideShorts.checked });
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

    function notifyToggles() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'updateToggles',
                    enableQualityCycle: enableQualityCycle.checked,
                    enableShortcuts: enableShortcuts.checked,
                    enableRightComments: enableRightComments.checked,
                    enableCinematicMode: enableCinematicMode.checked,
                    enableHideShorts: enableHideShorts.checked,
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
