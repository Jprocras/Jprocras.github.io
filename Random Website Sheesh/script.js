/**
 * ========================================
 * CYBERSECURITY PORTFOLIO - MAIN JAVASCRIPT
 * Advanced Animations & Interactivity
 * ========================================
 */

// ============================================
// NETWORK TOPOLOGY CANVAS BACKGROUND
// Interactive mesh network with fleeing nodes
// ============================================

class NetworkTopology {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isRunning = false;
        
        // Configuration
        this.config = {
            nodeCount: 80,
            nodeMinRadius: 2,
            nodeMaxRadius: 4,
            connectionDistance: 150,
            nodeSpeed: 0.5,
            fleeSpeed: 3,
            fleeDistance: 100,
            nodeColor: 'rgba(0, 255, 255, 0.8)',
            connectionColor: 'rgba(0, 255, 255, 0.15)',
            activeConnectionColor: 'rgba(0, 255, 255, 0.4)',
            backgroundColor: 'transparent'
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createNodes();
        this.bindEvents();
        this.start();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Adjust node count based on screen size
        const area = this.canvas.width * this.canvas.height;
        this.config.nodeCount = Math.floor(area / 15000);
        this.config.nodeCount = Math.max(40, Math.min(120, this.config.nodeCount));
    }
    
    createNodes() {
        this.nodes = [];
        for (let i = 0; i < this.config.nodeCount; i++) {
            this.nodes.push(new NetworkNode(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                this.config,
                this.canvas
            ));
        }
    }
    
    bindEvents() {
        // Throttled resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.createNodes();
            }, 250);
        });
        
        // Mouse tracking with throttle
        let lastMouseMove = 0;
        this.canvas.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseMove < 16) return; // ~60fps
            lastMouseMove = now;
            
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Performance: pause when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw connections first (behind nodes)
        this.drawConnections();
        
        // Update and draw nodes
        for (const node of this.nodes) {
            node.update(this.mouse);
            node.draw(this.ctx);
        }
        
        // Draw mouse influence area (subtle)
        if (this.mouse.x !== null) {
            this.drawMouseInfluence();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];
                const distance = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = 1 - (distance / this.config.connectionDistance);
                    
                    // Check if connection passes near mouse
                    let isActive = false;
                    if (this.mouse.x !== null) {
                        const midX = (nodeA.x + nodeB.x) / 2;
                        const midY = (nodeA.y + nodeB.y) / 2;
                        const mouseDistance = Math.hypot(midX - this.mouse.x, midY - this.mouse.y);
                        isActive = mouseDistance < this.config.fleeDistance;
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    
                    if (isActive) {
                        this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.6})`;
                        this.ctx.lineWidth = 1.5;
                    } else {
                        this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.15})`;
                        this.ctx.lineWidth = 1;
                    }
                    
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawMouseInfluence() {
        const gradient = this.ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, this.config.fleeDistance
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, this.config.fleeDistance, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
}

class NetworkNode {
    constructor(x, y, config, canvas) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.canvas = canvas;
        
        this.baseX = x;
        this.baseY = y;
        this.radius = config.nodeMinRadius + Math.random() * (config.nodeMaxRadius - config.nodeMinRadius);
        this.vx = (Math.random() - 0.5) * config.nodeSpeed;
        this.vy = (Math.random() - 0.5) * config.nodeSpeed;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
    }
    
    update(mouse) {
        // Pulse animation
        this.pulsePhase += this.pulseSpeed;
        
        // Mouse interaction - flee behavior
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < this.config.fleeDistance) {
                const force = (this.config.fleeDistance - distance) / this.config.fleeDistance;
                const angle = Math.atan2(dy, dx);
                this.vx += Math.cos(angle) * force * this.config.fleeSpeed * 0.1;
                this.vy += Math.sin(angle) * force * this.config.fleeSpeed * 0.1;
            }
        }
        
        // Apply friction
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Add some random drift
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary wrapping with padding
        const padding = 50;
        if (this.x < -padding) this.x = this.canvas.width + padding;
        if (this.x > this.canvas.width + padding) this.x = -padding;
        if (this.y < -padding) this.y = this.canvas.height + padding;
        if (this.y > this.canvas.height + padding) this.y = -padding;
    }
    
    draw(ctx) {
        const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.3;
        const currentRadius = this.radius * pulseFactor;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius * 3
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Core
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.config.nodeColor;
        ctx.fill();
    }
}


// ============================================
// TERMINAL INTERACTION
// Virtual CLI with typewriter and glitch effects
// ============================================

class VirtualTerminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.outputContainer = document.getElementById('terminal-output');
        this.inputElement = document.getElementById('terminal-input');
        
        if (!this.container || !this.outputContainer) return;
        
        this.isAnimating = false;
        this.hasRun = false;
        this.commandQueue = [];
        
        this.skills = {
            networking: {
                name: "CISCO_NETWORKING",
                level: "INTERMEDIATE",
                proficiency: 65,
                skills: [
                    "Router Configuration",
                    "Switch Management",
                    "VLAN Setup",
                    "OSPF/EIGRP Routing",
                    "Access Control Lists"
                ]
            },
            linux: {
                name: "LINUX_ADMIN",
                level: "BEGINNER",
                proficiency: 35,
                skills: [
                    "Command Line Operations",
                    "File System Navigation",
                    "User Management",
                    "Package Management",
                    "Basic Shell Scripting"
                ]
            },
            security: {
                name: "NETWORK_SECURITY",
                level: "LEARNING",
                proficiency: 45,
                skills: [
                    "Firewall Configuration",
                    "ACL Implementation",
                    "Network Monitoring",
                    "Threat Assessment",
                    "Security Protocols"
                ]
            }
        };
        
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasRun) {
                    this.hasRun = true;
                    setTimeout(() => this.runSequence(), 500);
                }
            });
        }, options);
        
        observer.observe(this.container);
    }
    
    async runSequence() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Initial connection animation
        await this.addLine('system', '[SYSTEM]', 'Establishing secure shell connection...');
        await this.delay(800);
        await this.addLine('success', '[OK]', 'Connection established on port 22');
        await this.delay(400);
        
        // Type the trace-route command
        await this.typeCommand('trace-route skills --verbose --format=json');
        await this.delay(600);
        
        // Execute command feedback
        await this.addLine('system', '[EXEC]', 'Initiating skill matrix trace...');
        await this.delay(400);
        
        // Packet trace animation
        await this.runPacketTrace();
        
        // Display JSON response with skills
        await this.displaySkillsJSON();
        
        this.isAnimating = false;
    }
    
    async typeCommand(command) {
        const chars = command.split('');
        let displayText = '';
        
        for (const char of chars) {
            displayText += char;
            this.inputElement.textContent = displayText;
            
            // Random typing speed for realistic effect
            const delay = 30 + Math.random() * 70;
            await this.delay(delay);
            
            // Occasional pause
            if (Math.random() < 0.1) {
                await this.delay(150);
            }
        }
        
        await this.delay(300);
        
        // Move command to output and clear input
        await this.addLine('command', 'user@admin:~$', command);
        this.inputElement.textContent = '';
    }
    
    async runPacketTrace() {
        const hops = [
            { hop: 1, ip: '192.168.1.1', location: 'LOCAL_GATEWAY', time: '1ms' },
            { hop: 2, ip: '10.0.0.1', location: 'CORE_SWITCH', time: '2ms' },
            { hop: 3, ip: '172.16.0.1', location: 'SKILL_SERVER', time: '4ms' },
            { hop: 4, ip: '172.16.0.100', location: 'MATRIX_DB', time: '5ms' }
        ];
        
        for (const hop of hops) {
            const line = document.createElement('div');
            line.className = 'terminal-line packet-trace';
            line.innerHTML = `
                <span class="line-prefix" style="color: var(--neon-orange);">[HOP ${hop.hop}]</span>
                <span class="line-content">
                    <span style="color: var(--neon-cyan);">${hop.ip}</span> 
                    → ${hop.location} 
                    <span style="color: var(--neon-green);">(${hop.time})</span>
                </span>
            `;
            
            this.outputContainer.appendChild(line);
            this.scrollToBottom();
            
            // Stagger animation
            line.style.animationDelay = `${hops.indexOf(hop) * 0.1}s`;
            
            await this.delay(300);
        }
        
        await this.delay(500);
        await this.addLine('success', '[TRACE]', 'Route complete. Retrieving skill matrix...');
        await this.delay(600);
    }
    
    async displaySkillsJSON() {
        const jsonContainer = document.createElement('div');
        jsonContainer.className = 'json-response';
        
        const jsonLines = [
            '<span class="json-bracket">{</span>',
            '  <span class="json-key">"status"</span>: <span class="json-string">"SUCCESS"</span>,',
            '  <span class="json-key">"timestamp"</span>: <span class="json-string">"' + new Date().toISOString() + '"</span>,',
            '  <span class="json-key">"skills"</span>: <span class="json-bracket">[</span>',
        ];
        
        // Add each skill
        Object.values(this.skills).forEach((skill, index, arr) => {
            jsonLines.push('    <span class="json-bracket">{</span>');
            jsonLines.push(`      <span class="json-key">"name"</span>: <span class="json-string">"${skill.name}"</span>,`);
            jsonLines.push(`      <span class="json-key">"level"</span>: <span class="json-string">"${skill.level}"</span>,`);
            jsonLines.push(`      <span class="json-key">"proficiency"</span>: <span class="json-number">${skill.proficiency}</span>,`);
            jsonLines.push(`      <span class="json-key">"modules"</span>: <span class="json-bracket">[</span>`);
            skill.skills.forEach((s, i, a) => {
                const comma = i < a.length - 1 ? ',' : '';
                jsonLines.push(`        <span class="json-string">"${s}"</span>${comma}`);
            });
            jsonLines.push('      <span class="json-bracket">]</span>');
            const endComma = index < arr.length - 1 ? ',' : '';
            jsonLines.push(`    <span class="json-bracket">}</span>${endComma}`);
        });
        
        jsonLines.push('  <span class="json-bracket">]</span>');
        jsonLines.push('<span class="json-bracket">}</span>');
        
        // Animate JSON appearance line by line
        for (const line of jsonLines) {
            const lineEl = document.createElement('div');
            lineEl.innerHTML = line;
            lineEl.style.opacity = '0';
            lineEl.style.transform = 'translateX(-10px)';
            jsonContainer.appendChild(lineEl);
            
            // Animate in
            requestAnimationFrame(() => {
                lineEl.style.transition = 'opacity 0.2s, transform 0.2s';
                lineEl.style.opacity = '1';
                lineEl.style.transform = 'translateX(0)';
            });
            
            await this.delay(50);
        }
        
        this.outputContainer.appendChild(jsonContainer);
        this.scrollToBottom();
        
        // Add glitch effect to the response
        this.addGlitchEffect(jsonContainer);
        
        await this.delay(500);
        await this.addLine('success', '[COMPLETE]', 'Skill matrix retrieved successfully.');
    }
    
    addGlitchEffect(element) {
        let glitchCount = 0;
        const maxGlitches = 5;
        
        const glitch = () => {
            if (glitchCount >= maxGlitches) return;
            
            element.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px)`;
            element.style.opacity = 0.9 + Math.random() * 0.1;
            
            setTimeout(() => {
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = 1;
            }, 50);
            
            glitchCount++;
            setTimeout(glitch, 500 + Math.random() * 2000);
        };
        
        setTimeout(glitch, 1000);
    }
    
    async addLine(type, prefix, content) {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.innerHTML = `
            <span class="line-prefix">${prefix}</span>
            <span class="line-content">${content}</span>
        `;
        
        this.outputContainer.appendChild(line);
        this.scrollToBottom();
        
        return new Promise(resolve => setTimeout(resolve, 100));
    }
    
    scrollToBottom() {
        const terminalBody = this.container.querySelector('.terminal-body');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


// ============================================
// SCROLL ANIMATIONS & EFFECTS
// ============================================

class ScrollAnimator {
    constructor() {
        this.animatedElements = [];
        this.init();
    }
    
    init() {
        // Progress bars
        this.setupProgressBars();
        
        // Fade in elements
        this.setupFadeIn();
        
        // Counter animation
        this.setupCounters();
        
        // Server rack hover effects
        this.setupRackInteractions();
        
        // Smooth scroll for navigation
        this.setupSmoothScroll();
    }
    
    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const progress = target.dataset.progress || 0;
                    setTimeout(() => {
                        target.style.width = `${progress}%`;
                    }, 300);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        progressBars.forEach(bar => observer.observe(bar));
    }
    
    setupFadeIn() {
        const elements = document.querySelectorAll('.glass-card, .project-card, .info-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in', 'visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        
        elements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.classList.add(`stagger-${(index % 5) + 1}`);
            observer.observe(el);
        });
    }
    
    setupCounters() {
        const counters = document.querySelectorAll('.stat-value[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseFloat(element.dataset.count);
        const duration = 2000;
        const startTime = performance.now();
        const isDecimal = target % 1 !== 0;
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const current = target * easeOut;
            
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = isDecimal ? target.toFixed(1) : target;
            }
        };
        
        requestAnimationFrame(update);
    }
    
    setupRackInteractions() {
        const rackUnits = document.querySelectorAll('.rack-unit');
        
        rackUnits.forEach(unit => {
            unit.addEventListener('mouseenter', () => {
                // Activate LEDs on hover
                const leds = unit.querySelectorAll('.led-indicator:not(.active)');
                leds.forEach((led, i) => {
                    setTimeout(() => {
                        led.classList.add('active');
                    }, i * 100);
                });
            });
            
            unit.addEventListener('mouseleave', () => {
                // Reset non-active LEDs
                const allLeds = unit.querySelectorAll('.led-indicator');
                const activeCount = parseInt(unit.dataset.activeLeds || 2);
                
                allLeds.forEach((led, i) => {
                    if (i >= activeCount) {
                        led.classList.remove('active');
                    }
                });
            });
            
            // Store original active LED count
            const activeLeds = unit.querySelectorAll('.led-indicator.active').length;
            unit.dataset.activeLeds = activeLeds;
        });
    }
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}


// ============================================
// NAVIGATION EFFECTS
// ============================================

class NavigationEffects {
    constructor() {
        this.nav = document.querySelector('.cyber-nav');
        this.lastScrollY = 0;
        
        if (this.nav) {
            this.init();
        }
    }
    
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.setupLinkEffects();
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (scrollY > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        // Hide/show nav on scroll direction
        if (scrollY > this.lastScrollY && scrollY > 100) {
            this.nav.style.transform = 'translateY(-100%)';
        } else {
            this.nav.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = scrollY;
    }
    
    setupLinkEffects() {
        const links = this.nav.querySelectorAll('.nav-links a');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // Add typing sound effect visual
                link.style.animation = 'none';
                requestAnimationFrame(() => {
                    link.style.animation = '';
                });
            });
        });
    }
}


// ============================================
// CONTACT FORM EFFECTS
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.status = document.getElementById('form-status');
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Input focus effects
        const inputs = this.form.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Animate status
        this.status.textContent = 'TRANSMITTING...';
        this.status.style.color = 'var(--neon-orange)';
        
        // Simulate sending
        await this.delay(2000);
        
        this.status.textContent = 'TRANSMITTED';
        this.status.style.color = 'var(--neon-green)';
        
        // Reset form
        this.form.reset();
        
        setTimeout(() => {
            this.status.textContent = 'READY';
            this.status.style.color = '';
        }, 3000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


// ============================================
// CURSOR EFFECTS (Optional Enhancement)
// ============================================

class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.isEnabled = window.matchMedia('(pointer: fine)').matches;
        
        if (this.isEnabled) {
            this.init();
        }
    }
    
    init() {
        // Create cursor elements
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.innerHTML = '<div class="cursor-ring"></div><div class="cursor-dot"></div>';
        document.body.appendChild(this.cursor);
        
        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                mix-blend-mode: difference;
            }
            .cursor-ring {
                width: 40px;
                height: 40px;
                border: 2px solid var(--neon-cyan);
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
                transition: transform 0.15s ease-out, opacity 0.15s;
            }
            .cursor-dot {
                width: 8px;
                height: 8px;
                background: var(--neon-cyan);
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
            }
            .custom-cursor.hover .cursor-ring {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0.5;
            }
            body { cursor: none; }
            a, button, input, textarea, .btn, .rack-unit, .project-card, .glass-card {
                cursor: none;
            }
        `;
        document.head.appendChild(style);
        
        // Bind events
        document.addEventListener('mousemove', (e) => this.move(e));
        
        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, input, textarea, .btn, .rack-unit, .project-card, .glass-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });
    }
    
    move(e) {
        this.cursor.style.left = e.clientX + 'px';
        this.cursor.style.top = e.clientY + 'px';
    }
}


// ============================================
// GLITCH TEXT EFFECT
// ============================================

class GlitchText {
    constructor() {
        this.elements = document.querySelectorAll('[data-text]');
        this.init();
    }
    
    init() {
        this.elements.forEach(el => {
            // Random glitch effect
            setInterval(() => {
                if (Math.random() < 0.1) {
                    el.classList.add('glitching');
                    setTimeout(() => el.classList.remove('glitching'), 200);
                }
            }, 3000);
        });
    }
}


// ============================================
// MATRIX RAIN EFFECT (Optional Background)
// ============================================

class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || this.canvas.id === 'network-canvas') return;
        
        this.ctx = this.canvas.getContext('2d');
        this.columns = [];
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const fontSize = 14;
        const columnCount = Math.floor(this.canvas.width / fontSize);
        
        this.columns = [];
        for (let i = 0; i < columnCount; i++) {
            this.columns.push({
                x: i * fontSize,
                y: Math.random() * this.canvas.height,
                speed: 0.5 + Math.random() * 2,
                fontSize: fontSize
            });
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '14px monospace';
        
        for (const col of this.columns) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(char, col.x, col.y);
            
            col.y += col.speed * 10;
            
            if (col.y > this.canvas.height && Math.random() > 0.99) {
                col.y = 0;
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}


// ============================================
// INITIALIZE EVERYTHING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Core components
    new NetworkTopology('network-canvas');
    new VirtualTerminal('terminal-output');
    new ScrollAnimator();
    new NavigationEffects();
    new ContactForm();
    new GlitchText();
    
    // Optional: Custom cursor (comment out if not needed)
    // new CustomCursor();
    
    // Console easter egg
    console.log('%c⚡ NETWORK SECURITY PORTFOLIO ⚡', 'color: #0ff; font-size: 20px; font-weight: bold;');
    console.log('%c Securing the Network Infrastructure ', 'background: #0a0a0f; color: #0f0; padding: 10px;');
    console.log('%c Built with passion for cybersecurity ', 'color: #888;');
});


// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Passive event listeners for scroll performance
document.addEventListener('scroll', () => {}, { passive: true });
document.addEventListener('wheel', () => {}, { passive: true });
document.addEventListener('touchstart', () => {}, { passive: true });

// Preload critical resources
const preloadResources = () => {
    const fonts = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
    ];
    
    fonts.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
    });
};

preloadResources();
