// Moodify: AI Vibe Themer - Content Script
// Applies CSS themes to webpages based on selected mood

// Global variables
let currentTheme = null;
let originalStyles = new Map();
let themeStyleElement = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    switch(request.action) {
        case 'applyTheme':
            applyThemeToPage(request.theme, request.mood);
            sendResponse({success: true});
            break;
            
        case 'resetTheme':
            resetPageTheme();
            sendResponse({success: true});
            break;
            
        case 'getCurrentTheme':
            sendResponse({theme: currentTheme});
            break;
            
        default:
            sendResponse({success: false, error: 'Unknown action'});
    }
    
    return true; // Keep message channel open for async response
});

// Apply theme to the current page
function applyThemeToPage(theme, mood) {
    console.log('Applying theme:', theme, 'for mood:', mood);
    
    // Store current theme
    currentTheme = { theme, mood };
    
    // Remove any existing theme styles
    removeThemeStyles();
    
    // Create new style element
    themeStyleElement = document.createElement('style');
    themeStyleElement.id = 'moodify-theme-styles';
    themeStyleElement.type = 'text/css';
    
    // Generate CSS based on theme
    const css = generateThemeCSS(theme, mood);
    themeStyleElement.textContent = css;
    
    // Add styles to document
    document.head.appendChild(themeStyleElement);
    
    // Apply theme-specific transformations
    applyThemeTransformations(theme, mood);
    
    console.log('Theme applied successfully');
}

// Generate CSS for the theme
function generateThemeCSS(theme, mood) {
    const css = `
        /* Moodify Theme: ${theme.name} */
        
        /* Background colors */
        body, html {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
            font-family: ${theme.font}, sans-serif !important;
            transition: all 0.3s ease !important;
        }
        
        /* Main content areas */
        main, .main, #main, .content, .container, .wrapper {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
        }
        
        /* Headers */
        h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
            color: ${theme.text} !important;
            font-family: ${theme.font}, sans-serif !important;
        }
        
        /* Links */
        a, .link {
            color: ${theme.accent} !important;
        }
        
        a:hover, .link:hover {
            color: ${theme.text} !important;
            opacity: 0.8 !important;
        }
        
        /* Buttons */
        button, .btn, input[type="button"], input[type="submit"] {
            background-color: ${theme.accent} !important;
            color: ${theme.text === '#FFFFFF' ? '#000000' : '#FFFFFF'} !important;
            border: 1px solid ${theme.accent} !important;
            font-family: ${theme.font}, sans-serif !important;
        }
        
        button:hover, .btn:hover {
            background-color: ${theme.text} !important;
            color: ${theme.bg} !important;
        }
        
        /* Input fields */
        input, textarea, select {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
            border: 1px solid ${theme.accent} !important;
            font-family: ${theme.font}, sans-serif !important;
        }
        
        /* Cards and containers */
        .card, .panel, .box, .container, .section {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
            border: 1px solid ${theme.accent} !important;
        }
        
        /* Navigation */
        nav, .nav, .navbar, .navigation {
            background-color: ${theme.accent} !important;
            color: ${theme.text === '#FFFFFF' ? '#000000' : '#FFFFFF'} !important;
        }
        
        nav a, .nav a, .navbar a {
            color: ${theme.text === '#FFFFFF' ? '#000000' : '#FFFFFF'} !important;
        }
        
        /* Sidebar */
        .sidebar, .aside, aside {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
            border-right: 1px solid ${theme.accent} !important;
        }
        
        /* Footer */
        footer, .footer {
            background-color: ${theme.accent} !important;
            color: ${theme.text === '#FFFFFF' ? '#000000' : '#FFFFFF'} !important;
        }
        
        /* Tables */
        table {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
        }
        
        th, td {
            background-color: ${theme.bg} !important;
            color: ${theme.text} !important;
            border: 1px solid ${theme.accent} !important;
        }
        
        /* Code blocks */
        code, pre, .code {
            background-color: ${theme.text === '#FFFFFF' ? '#2C2C2C' : '#F5F5F5'} !important;
            color: ${theme.text === '#FFFFFF' ? '#FFFFFF' : '#000000'} !important;
            font-family: 'Roboto Mono', monospace !important;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: ${theme.bg};
        }
        
        ::-webkit-scrollbar-thumb {
            background: ${theme.accent};
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: ${theme.text};
        }
        
        /* Mood-specific enhancements */
        ${getMoodSpecificCSS(mood, theme)}
    `;
    
    return css;
}

// Get mood-specific CSS enhancements
function getMoodSpecificCSS(mood, theme) {
    switch(mood) {
        case 'chill':
            return `
                /* Chill theme - soft, calming effects */
                * {
                    transition: all 0.3s ease !important;
                }
                
                body {
                    filter: brightness(1.1) !important;
                }
                
                .card, .panel, .box {
                    box-shadow: 0 4px 15px rgba(167, 199, 231, 0.3) !important;
                    border-radius: 12px !important;
                }
            `;
            
        case 'focus':
            return `
                /* Focus theme - clean, minimal effects */
                body {
                    filter: contrast(1.1) !important;
                }
                
                .card, .panel, .box {
                    border-radius: 4px !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                }
                
                /* Highlight important elements */
                h1, h2, h3 {
                    border-bottom: 2px solid ${theme.accent} !important;
                    padding-bottom: 5px !important;
                }
            `;
            
        case 'energetic':
            return `
                /* Energetic theme - bold, dynamic effects */
                body {
                    animation: subtlePulse 3s ease-in-out infinite !important;
                }
                
                @keyframes subtlePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.001); }
                }
                
                .card, .panel, .box {
                    box-shadow: 0 6px 20px rgba(255, 111, 97, 0.4) !important;
                    border-radius: 8px !important;
                }
                
                button:hover, .btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 4px 12px rgba(255, 111, 97, 0.6) !important;
                }
            `;
            
        case 'vintage':
            return `
                /* Vintage theme - classic, elegant effects */
                body {
                    filter: sepia(0.1) contrast(1.05) !important;
                }
                
                .card, .panel, .box {
                    box-shadow: 0 4px 20px rgba(139, 69, 19, 0.2) !important;
                    border-radius: 0 !important;
                    border: 2px solid ${theme.accent} !important;
                }
                
                /* Add vintage border to images */
                img {
                    border: 3px solid ${theme.accent} !important;
                    border-radius: 0 !important;
                }
            `;
            
        default:
            return '';
    }
}

// Apply theme-specific transformations
function applyThemeTransformations(theme, mood) {
    // Add theme class to body for additional styling hooks
    document.body.classList.add(`moodify-${mood}`);
    
    // Apply mood-specific transformations
    switch(mood) {
        case 'chill':
            applyChillTransformations();
            break;
        case 'focus':
            applyFocusTransformations();
            break;
        case 'energetic':
            applyEnergeticTransformations();
            break;
        case 'vintage':
            applyVintageTransformations();
            break;
    }
}

// Chill theme transformations
function applyChillTransformations() {
    // Add subtle animations to elements
    const elements = document.querySelectorAll('img, .card, .panel');
    elements.forEach(el => {
        el.style.transition = 'transform 0.3s ease';
        el.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Focus theme transformations
function applyFocusTransformations() {
    // Highlight important elements
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        heading.style.position = 'relative';
        heading.style.paddingLeft = '10px';
    });
}

// Energetic theme transformations
function applyEnergeticTransformations() {
    // Add dynamic effects to interactive elements
    const buttons = document.querySelectorAll('button, .btn, a');
    buttons.forEach(btn => {
        btn.style.transition = 'all 0.2s ease';
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Vintage theme transformations
function applyVintageTransformations() {
    // Add vintage styling to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.filter = 'sepia(0.2) contrast(1.1)';
    });
}

// Remove theme styles from page
function resetPageTheme() {
    console.log('Resetting page theme');
    
    // Remove theme styles
    removeThemeStyles();
    
    // Remove theme class from body
    document.body.classList.remove('moodify-chill', 'moodify-focus', 'moodify-energetic', 'moodify-vintage');
    
    // Reset current theme
    currentTheme = null;
    
    console.log('Theme reset successfully');
}

// Remove theme style element
function removeThemeStyles() {
    if (themeStyleElement) {
        themeStyleElement.remove();
        themeStyleElement = null;
    }
    
    // Remove any existing moodify styles
    const existingStyles = document.querySelectorAll('#moodify-theme-styles');
    existingStyles.forEach(style => style.remove());
}

// Initialize content script
function initializeContentScript() {
    console.log('Moodify content script initialized');
    
    // Check if there's a saved theme for this page
    chrome.storage.local.get([`theme_${window.location.href}`], function(result) {
        const savedTheme = result[`theme_${window.location.href}`];
        if (savedTheme) {
            applyThemeToPage(savedTheme, savedTheme.name.toLowerCase());
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}
