// Moodify: AI Vibe Themer - Popup Script
// Handles UI interactions and communicates with content script

// Mood theme configurations
const moodThemes = {
    chill: { 
        bg: "#A7C7E7", 
        text: "#1A1A1A", 
        font: "Poppins",
        accent: "#6B9BD2",
        name: "Chill"
    },
    focus: { 
        bg: "#E0E0E0", 
        text: "#111111", 
        font: "Roboto Mono",
        accent: "#4A4A4A",
        name: "Focus"
    },
    vintage: { 
        bg: "#F4E1D2", 
        text: "#3B2F2F", 
        font: "Playfair Display",
        accent: "#8B4513",
        name: "Vintage"
    },
    energetic: { 
        bg: "#FF6F61", 
        text: "#FFFFFF", 
        font: "Bebas Neue",
        accent: "#FF4757",
        name: "Energetic"
    }
};

// DOM elements
let selectedMood = null;
let isAIMode = false;
let currentTheme = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
    loadSavedSettings();
    setupEventListeners();
});

// Initialize popup state
function initializePopup() {
    console.log('Moodify popup initialized');
    
    // Check if there's a current theme applied
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.storage.local.get([`theme_${tabs[0].url}`], function(result) {
                const savedTheme = result[`theme_${tabs[0].url}`];
                if (savedTheme) {
                    currentTheme = savedTheme;
                    showCurrentTheme(savedTheme);
                }
            });
        }
    });
}

// Load saved settings from storage
function loadSavedSettings() {
    chrome.storage.local.get(['aiMode', 'lastMood'], function(result) {
        isAIMode = result.aiMode || false;
        selectedMood = result.lastMood || null;
        
        // Update UI based on saved settings
        document.getElementById('aiModeToggle').checked = isAIMode;
        
        if (selectedMood) {
            selectMood(selectedMood);
        }
    });
}

// Setup event listeners for UI interactions
function setupEventListeners() {
    // Mood selection buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mood = this.dataset.mood;
            selectMood(mood);
        });
    });

    // AI Mode toggle
    document.getElementById('aiModeToggle').addEventListener('change', function() {
        isAIMode = this.checked;
        chrome.storage.local.set({aiMode: isAIMode});
        
        if (isAIMode && !selectedMood) {
            simulateAIAnalysis();
        }
    });

    // Apply theme button
    document.getElementById('applyTheme').addEventListener('click', function() {
        applyTheme();
    });

    // Reset theme button
    document.getElementById('resetTheme').addEventListener('click', function() {
        resetTheme();
    });
}

// Select a mood and update UI
function selectMood(mood) {
    selectedMood = mood;
    
    // Update button states
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
    
    // Enable apply button
    document.getElementById('applyTheme').disabled = false;
    
    // Save last selected mood
    chrome.storage.local.set({lastMood: mood});
    
    // Show theme preview
    showThemePreview(mood);
}

// Show theme preview
function showThemePreview(mood) {
    const theme = moodThemes[mood];
    const preview = document.getElementById('themePreview');
    
    preview.innerHTML = `
        <div class="preview-sample" style="background-color: ${theme.bg}; color: ${theme.text}; font-family: ${theme.font};">
            <div class="preview-text">Sample Text</div>
            <div class="preview-accent" style="background-color: ${theme.accent};"></div>
        </div>
        <div class="preview-info">
            <span class="theme-name">${theme.name}</span>
            <span class="theme-colors">
                <span class="color-dot" style="background-color: ${theme.bg};"></span>
                <span class="color-dot" style="background-color: ${theme.text};"></span>
                <span class="color-dot" style="background-color: ${theme.accent};"></span>
            </span>
        </div>
    `;
}

// Show current applied theme
function showCurrentTheme(theme) {
    const currentThemeDiv = document.getElementById('currentTheme');
    const preview = document.getElementById('themePreview');
    
    preview.innerHTML = `
        <div class="preview-sample" style="background-color: ${theme.bg}; color: ${theme.text}; font-family: ${theme.font};">
            <div class="preview-text">Current Theme</div>
            <div class="preview-accent" style="background-color: ${theme.accent};"></div>
        </div>
        <div class="preview-info">
            <span class="theme-name">${theme.name}</span>
            <span class="theme-colors">
                <span class="color-dot" style="background-color: ${theme.bg};"></span>
                <span class="color-dot" style="background-color: ${theme.text};"></span>
                <span class="color-dot" style="background-color: ${theme.accent};"></span>
            </span>
        </div>
    `;
    
    currentThemeDiv.style.display = 'block';
}

// Simulate AI analysis
function simulateAIAnalysis() {
    const analysisDiv = document.getElementById('aiAnalysis');
    analysisDiv.style.display = 'block';
    
    // Simulate AI thinking time
    setTimeout(() => {
        analysisDiv.style.display = 'none';
        
        // Randomly select a mood for AI mode
        const moods = Object.keys(moodThemes);
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        
        selectMood(randomMood);
        
        // Show AI suggestion message
        showAISuggestion(randomMood);
    }, 2000);
}

// Show AI suggestion
function showAISuggestion(mood) {
    const theme = moodThemes[mood];
    
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'ai-suggestion';
    notification.innerHTML = `
        <div class="suggestion-content">
            <span class="ai-icon">🤖</span>
            <span>AI suggests: <strong>${theme.name}</strong> theme</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Apply theme to current tab
function applyTheme() {
    if (!selectedMood) return;
    
    const theme = moodThemes[selectedMood];
    
    // Get current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            // Send message to content script
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'applyTheme',
                theme: theme,
                mood: selectedMood
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    // Save theme for this site
                    chrome.storage.local.set({
                        [`theme_${tabs[0].url}`]: theme
                    });
                    
                    // Show success message
                    showSuccessMessage();
                    
                    // Update current theme display
                    showCurrentTheme(theme);
                    currentTheme = theme;
                }
            });
        }
    });
}

// Reset theme
function resetTheme() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            // Send reset message to content script
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'resetTheme'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    // Remove saved theme for this site
                    chrome.storage.local.remove([`theme_${tabs[0].url}`]);
                    
                    // Hide current theme display
                    document.getElementById('currentTheme').style.display = 'none';
                    currentTheme = null;
                    
                    // Show reset message
                    showResetMessage();
                }
            });
        }
    });
}

// Show success message
function showSuccessMessage() {
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.innerHTML = `
        <div class="message-content">
            <span class="success-icon">✅</span>
            <span>Theme applied successfully!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Show reset message
function showResetMessage() {
    const notification = document.createElement('div');
    notification.className = 'reset-message';
    notification.innerHTML = `
        <div class="message-content">
            <span class="reset-icon">🔄</span>
            <span>Theme reset to original!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Mock AI integration function (placeholder for future GPT integration)
function mockAIIntegration(userBehavior, siteContent) {
    // This is a placeholder for future AI integration
    // Could be replaced with actual GPT API calls
    console.log('Mock AI analysis:', { userBehavior, siteContent });
    
    // Return a random theme suggestion
    const moods = Object.keys(moodThemes);
    return moods[Math.floor(Math.random() * moods.length)];
}
