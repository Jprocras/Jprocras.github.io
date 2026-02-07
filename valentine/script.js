/**
 * Valentine's Day Interactive Page - Refactored
 * Clean, modular, and reliable implementation
 */

(function () {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        // Button texts that cycle when "No" is clicked
        noButtonTexts: [
            "No",
            "Are you sure?",
            "Really sure?",
            "Think again!",
            "Last chance!",
            "Surely not?",
            "You might regret this!",
            "Give it another thought!",
            "Are you absolutely certain?",
            "This could be a mistake!",
            "Have a heart!",
            "Don't be so cold!",
            "Change of heart?",
            "Wouldn't you reconsider?",
            "Is that your final answer?",
            "You're breaking my heart ;(",
            "Plsss? :(("
        ],

        // Rejection meme GIFs
        rejectionMemes: [
            "https://media.giphy.com/media/BEob5qwFkSJ7G/giphy.gif",
            "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
            "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
            "https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif",
            "https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif",
            "https://media.giphy.com/media/a9xhxAxaqOfQs/giphy.gif",
            "https://media.giphy.com/media/3oriO6qJiXajN0TyDu/giphy.gif",
            "https://media.giphy.com/media/3oEjI4sFlp73fvEYgw/giphy.gif"
        ],

        // Animation settings
        heartCount: 20,
        memeDisplayTime: 3000,

        // No button settings
        noButtonPadding: 10,
        noButtonMinSize: { width: 80, height: 40 }
    };

    // ==================== STATE ====================
    const state = {
        noClickCount: 0,
        yesButtonScale: 1
    };

    // ==================== DOM ELEMENTS ====================
    let elements = {};

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Get a random integer between min and max (inclusive)
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get a random item from an array
     */
    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Clamp a value between min and max
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // ==================== HEARTS ANIMATION ====================

    function createFloatingHearts() {
        const container = elements.backgroundAnimation;
        if (!container) return;

        for (let i = 0; i < CONFIG.heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart-bg');
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.animationDuration = `${4 + Math.random() * 3}s`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(heart);
        }
    }

    // ==================== NO BUTTON MOVEMENT ====================

    /**
     * Move the No button to a random position within the glass card
     * Uses the glass-card as the boundary to ensure visibility
     */
    function moveNoButton() {
        const card = elements.glassCard;
        const btn = elements.noBtn;

        if (!card || !btn) return;

        // Get card dimensions and position
        const cardRect = card.getBoundingClientRect();

        // Get button dimensions
        const btnWidth = btn.offsetWidth;
        const btnHeight = btn.offsetHeight;

        // Calculate the safe area within the card
        const padding = CONFIG.noButtonPadding;

        // Available space for the button (card width/height minus button size minus padding)
        const availableWidth = cardRect.width - btnWidth - (padding * 2);
        const availableHeight = cardRect.height - btnHeight - (padding * 2);

        // Generate random position within the safe area
        // Use a simple uniform distribution
        const offsetX = availableWidth > 0 ? randomInt(0, Math.floor(availableWidth)) : 0;
        const offsetY = availableHeight > 0 ? randomInt(0, Math.floor(availableHeight)) : 0;

        // Calculate absolute position (relative to viewport for fixed positioning)
        const newLeft = cardRect.left + padding + offsetX;
        const newTop = cardRect.top + padding + offsetY;

        // Apply styles
        btn.style.position = 'fixed';
        btn.style.left = `${Math.round(newLeft)}px`;
        btn.style.top = `${Math.round(newTop)}px`;
        btn.style.margin = '0';
        btn.style.zIndex = '100';
    }

    // ==================== REJECTION MEMES ====================

    function spawnRejectionMeme() {
        const meme = document.createElement('img');
        meme.src = randomItem(CONFIG.rejectionMemes);
        meme.classList.add('rejection-meme');
        meme.alt = 'Rejection meme';

        // Get safe viewport dimensions
        const maxX = window.innerWidth - 200;
        const maxY = window.innerHeight - 200;

        // Random position with clamping
        const x = clamp(randomInt(50, maxX), 50, maxX);
        const y = clamp(randomInt(50, maxY), 50, maxY);

        meme.style.left = `${x}px`;
        meme.style.top = `${y}px`;

        document.body.appendChild(meme);

        // Remove after animation completes
        setTimeout(() => {
            if (meme.parentNode) {
                meme.remove();
            }
        }, CONFIG.memeDisplayTime);
    }

    function spawnMultipleMemes(count) {
        const actualCount = Math.min(count, 3);
        for (let i = 0; i < actualCount; i++) {
            setTimeout(spawnRejectionMeme, i * 200);
        }
    }

    // ==================== YES BUTTON EFFECTS ====================

    function updateYesButton() {
        const btn = elements.yesBtn;
        if (!btn) return;

        // Grow the button
        state.yesButtonScale += 0.15;
        btn.style.transform = `scale(${state.yesButtonScale})`;

        // Enhanced shadow
        const shadowSize = 6 + state.noClickCount * 2;
        const shadowBlur = 15 + state.noClickCount * 3;
        const shadowOpacity = Math.min(0.4 + state.noClickCount * 0.05, 0.9);
        btn.style.boxShadow = `0 ${shadowSize}px ${shadowBlur}px rgba(255, 77, 109, ${shadowOpacity})`;

        // Add pulse animation after 5 clicks
        if (state.noClickCount >= 5) {
            btn.style.animation = 'pulse 0.8s ease-in-out infinite';
        }

        // Extra growth after 8 clicks
        if (state.noClickCount >= 8) {
            state.yesButtonScale += 0.2;
            btn.style.transform = `scale(${state.yesButtonScale})`;
            btn.style.zIndex = '200';
        }
    }

    // ==================== NO BUTTON EFFECTS ====================

    function updateNoButtonText() {
        const btn = elements.noBtn;
        if (!btn) return;

        const textIndex = Math.min(state.noClickCount, CONFIG.noButtonTexts.length - 1);
        btn.innerText = CONFIG.noButtonTexts[textIndex];
    }

    function shrinkNoButton() {
        const btn = elements.noBtn;
        if (!btn) return;

        const currentPadding = parseFloat(window.getComputedStyle(btn).paddingLeft) || 15;
        const newPadding = Math.max(8, currentPadding * 0.9);
        btn.style.padding = `${newPadding}px ${newPadding * 2}px`;
    }

    // ==================== EVENT HANDLERS ====================

    function handleNoClick(e) {
        e.preventDefault();

        // Increment counter
        state.noClickCount++;

        // Move the button
        moveNoButton();

        // Update button text
        updateNoButtonText();

        // Shrink the button
        shrinkNoButton();

        // Spawn memes
        spawnMultipleMemes(state.noClickCount);

        // Update the Yes button
        updateYesButton();
    }

    function handleYesClick() {
        window.location.href = 'yes.html';
    }

    // ==================== DYNAMIC STYLES ====================

    function injectDynamicStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes pulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(255, 77, 109, 0.6);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(255, 77, 109, 1), 0 0 60px rgba(255, 77, 109, 0.8);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // ==================== INITIALIZATION ====================

    function cacheElements() {
        elements = {
            yesBtn: document.getElementById('yesBtn'),
            noBtn: document.getElementById('noBtn'),
            glassCard: document.querySelector('.glass-card'),
            backgroundAnimation: document.querySelector('.background-animation'),
            buttonsContainer: document.querySelector('.buttons')
        };
    }

    function bindEvents() {
        if (elements.noBtn) {
            elements.noBtn.addEventListener('click', handleNoClick);
        }
        if (elements.yesBtn) {
            elements.yesBtn.addEventListener('click', handleYesClick);
        }

        // Update button position on window resize
        window.addEventListener('resize', () => {
            if (state.noClickCount > 0) {
                moveNoButton();
            }
        });
    }

    function init() {
        cacheElements();
        bindEvents();
        injectDynamicStyles();
        createFloatingHearts();
    }

    // ==================== START ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
