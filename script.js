// Enhanced Animation Controller
class FuturisticLightAnimation {
    constructor() {
        this.init();
        this.setupDynamicEffects();
        this.addInteractivity();
    }

    init() {
        // Add performance optimization
        this.requestId = null;
        this.lastTime = 0;
        this.frameRate = 60;
        this.frameInterval = 1000 / this.frameRate;
        
        // Get DOM elements
        this.container = document.querySelector('.container');
        this.lightBeam = document.querySelector('.light-beam');
        this.beamGlow = document.querySelector('.beam-glow');
        this.sparkles = document.querySelectorAll('.sparkle');
        this.gridBackground = document.querySelector('.grid-background');
        
        console.log('Futuristic Light Animation initialized');
    }

    setupDynamicEffects() {
        // Add random sparkle generation
        this.createRandomSparkles();
        
        // Add dynamic grid intensity
        this.animateGridIntensity();
        
        // Add beam intensity variations
        this.addBeamVariations();
    }

    createRandomSparkles() {
        const sparkleContainer = document.querySelector('.sparkles');
        
        setInterval(() => {
            // Create temporary sparkles
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle dynamic-sparkle';
            
            // Random position near the beam
            const randomX = 48 + (Math.random() - 0.5) * 8; // ±4% from center
            const randomY = Math.random() * 80; // 0-80% height
            
            sparkle.style.left = `${randomX}%`;
            sparkle.style.top = `${randomY}%`;
            sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            sparkleContainer.appendChild(sparkle);
            
            // Remove after animation
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 4000);
        }, 1500 + Math.random() * 2000);
    }

    animateGridIntensity() {
        let intensity = 0;
        const animateGrid = () => {
            intensity += 0.02;
            const opacity = 0.3 + Math.sin(intensity) * 0.2;
            this.gridBackground.style.opacity = opacity;
            requestAnimationFrame(animateGrid);
        };
        animateGrid();
    }

    addBeamVariations() {
        let beamIntensity = 0;
        const animateBeam = () => {
            beamIntensity += 0.03;
            const intensity = 0.8 + Math.sin(beamIntensity) * 0.2;
            
            // Vary beam glow
            this.beamGlow.style.opacity = intensity * 0.8;
            
            // Add subtle width variations
            const widthVariation = 4 + Math.sin(beamIntensity * 2) * 1;
            this.lightBeam.style.width = `${widthVariation}px`;
            
            requestAnimationFrame(animateBeam);
        };
        animateBeam();
    }

    addInteractivity() {
        // Mouse movement creates subtle effects
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Subtle beam tilt based on mouse position
            const tilt = (x - 0.5) * 2; // -1 to 1
            const beamContainer = document.querySelector('.light-beam-container');
            beamContainer.style.transform = `translateX(-50%) rotate(${tilt}deg)`;
            
            // Grid intensity based on mouse position
            const gridIntensity = 0.3 + (1 - y) * 0.3;
            this.gridBackground.style.opacity = gridIntensity;
        });

        // Click creates pulse effect
        document.addEventListener('click', (e) => {
            this.createClickPulse(e.clientX, e.clientY);
        });

        // Keyboard controls for intensity
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleAnimation();
                    break;
                case 'r':
                    this.resetAnimation();
                    break;
            }
        });
    }

    createClickPulse(x, y) {
        const pulse = document.createElement('div');
        pulse.className = 'click-pulse';
        pulse.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(184, 225, 255, 0.8);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 20;
            animation: clickPulseExpand 1s ease-out forwards;
        `;
        
        // Add CSS animation if not exists
        if (!document.querySelector('#click-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'click-pulse-style';
            style.textContent = `
                @keyframes clickPulseExpand {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(pulse);
        
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        }, 1000);
    }

    toggleAnimation() {
        const allAnimations = document.querySelectorAll('*');
        allAnimations.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.animationName !== 'none') {
                el.style.animationPlayState = 
                    el.style.animationPlayState === 'paused' ? 'running' : 'paused';
            }
        });
    }

    resetAnimation() {
        // Restart all animations
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = null;
        });
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                console.log(`FPS: ${fps}`);
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animation = new FuturisticLightAnimation();
    
    // Optional: Start performance monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        animation.startPerformanceMonitoring();
    }
    
    // Add loading fade-in effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add CSS for dynamic sparkles
const dynamicSparkleStyle = document.createElement('style');
dynamicSparkleStyle.textContent = `
    .dynamic-sparkle {
        animation: sparkleFloat 3s ease-in-out forwards;
    }
`;
document.head.appendChild(dynamicSparkleStyle);
