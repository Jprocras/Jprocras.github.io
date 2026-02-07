document.addEventListener('DOMContentLoaded', () => {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const question = document.querySelector('h1');
    const gifContainer = document.querySelector('.gif-container img');

    // Texts to cycle through when "No" is clicked
    const noTexts = [
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
    ];

    // Rejection meme images (Valentine themed)
    const rejectionMemes = [
        "https://media.giphy.com/media/BEob5qwFkSJ7G/giphy.gif", // Crying
        "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", // Sad cat
        "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif", // Heartbreak
        "https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif", // Dramatic
        "https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif", // Why
        "https://media.giphy.com/media/a9xhxAxaqOfQs/giphy.gif", // Sad panda
        "https://media.giphy.com/media/3oriO6qJiXajN0TyDu/giphy.gif", // Crying tears
        "https://media.giphy.com/media/3oEjI4sFlp73fvEYgw/giphy.gif" // Broken heart
    ];

    let noClickCount = 0;
    let yesButtonScale = 1;

    // Create floating hearts background
    function createHearts() {
        const bg = document.querySelector('.background-animation');
        const heartCount = 20;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart-bg');
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = Math.random() * 3 + 4 + 's'; // 4-7s
            heart.style.animationDelay = Math.random() * 5 + 's';
            bg.appendChild(heart);
        }
    }

    createHearts();

    // Move "No" button logic
    const moveNoButton = () => {
        // First, ensure button has fixed positioning so we can measure correctly
        noBtn.style.position = 'fixed';

        // Force a reflow to get accurate dimensions
        noBtn.offsetHeight;

        // Get button dimensions after positioning
        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;

        // Get the actual visible viewport (accounts for browser UI, zoom, etc.)
        // Use visualViewport if available, otherwise fall back to documentElement
        let viewportWidth, viewportHeight;
        if (window.visualViewport) {
            viewportWidth = window.visualViewport.width;
            viewportHeight = window.visualViewport.height;
        } else {
            viewportWidth = document.documentElement.clientWidth;
            viewportHeight = document.documentElement.clientHeight;
        }

        // Large safe zone to ensure button is always comfortably within view
        const safeZone = 80;

        // Calculate the maximum allowed positions
        const maxLeft = viewportWidth - btnWidth - safeZone;
        const maxTop = viewportHeight - btnHeight - safeZone;

        // Generate random position ensuring it's within safe bounds
        // Use Math.max to ensure we don't get negative values
        const rangeX = Math.max(10, maxLeft - safeZone);
        const rangeY = Math.max(10, maxTop - safeZone);

        let newX = Math.floor(Math.random() * rangeX) + safeZone;
        let newY = Math.floor(Math.random() * rangeY) + safeZone;

        // Triple-check: clamp to absolute bounds
        newX = Math.max(safeZone, Math.min(newX, maxLeft));
        newY = Math.max(safeZone, Math.min(newY, maxTop));

        // Apply the position
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
        noBtn.style.zIndex = '100';
        noBtn.style.margin = '0'; // Remove any margin that could affect positioning
    };

    // Spawn rejection meme
    const spawnRejectionMeme = () => {
        const meme = document.createElement('img');
        meme.src = rejectionMemes[Math.floor(Math.random() * rejectionMemes.length)];
        meme.classList.add('rejection-meme');

        // Random position
        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 200);

        meme.style.left = x + 'px';
        meme.style.top = y + 'px';

        document.body.appendChild(meme);

        // Remove after animation
        setTimeout(() => {
            meme.remove();
        }, 3000);
    };

    // "No" button click only (removed hover)
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        moveNoButton();

        noClickCount++;

        // Spawn rejection memes (1-3 at a time)
        const memeCount = Math.min(noClickCount, 3);
        for (let i = 0; i < memeCount; i++) {
            setTimeout(() => spawnRejectionMeme(), i * 200);
        }

        // Change text
        if (noClickCount < noTexts.length) {
            noBtn.innerText = noTexts[noClickCount];
        } else {
            noBtn.innerText = noTexts[noTexts.length - 1];
        }

        // Shrink "No" button slightly
        const currentNoPadding = parseFloat(window.getComputedStyle(noBtn).paddingLeft);
        noBtn.style.padding = Math.max(8, currentNoPadding * 0.9) + 'px ' + Math.max(16, currentNoPadding * 0.9 * 2) + 'px';

        // Grow "Yes" button incrementally
        yesButtonScale += 0.15;
        yesBtn.style.transform = `scale(${yesButtonScale})`;
        yesBtn.style.boxShadow = `0 ${6 + noClickCount * 2}px ${15 + noClickCount * 3}px rgba(255, 77, 109, ${0.4 + noClickCount * 0.05})`;

        // After many clicks, make the Yes button pulse/glow to draw attention
        if (noClickCount >= 5) {
            yesBtn.style.animation = 'pulse 0.8s ease-in-out infinite';
        }

        // If user is really trapped (many clicks), grow Yes button even more dramatically
        if (noClickCount >= 8) {
            yesButtonScale += 0.2;
            yesBtn.style.transform = `scale(${yesButtonScale})`;
            yesBtn.style.zIndex = '200';
        }
    });

    // "Yes" button interaction
    yesBtn.addEventListener('click', () => {
        window.location.href = 'yes.html';
    });

    // Add pulse animation dynamically
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
});

