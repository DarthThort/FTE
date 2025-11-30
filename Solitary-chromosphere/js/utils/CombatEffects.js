/**
 * CombatEffects - Visual and audio effects for combat
 */

class CombatEffects {
    constructor(game) {
        this.game = game;
        this.projectiles = []; // Active projectile trails
        this.particles = []; // Impact particles
        this.hitMarkers = []; // Hit markers
        this.sounds = this.initSounds();
    }

    /**
     * Initialize sound effects (procedural)
     */
    initSounds() {
        return {
            enabled: true,
            audioContext: null
        };
    }

    /**
     * Create projectile trail from ship to enemy
     */
    addProjectile(startX, startY, endX, endY, color = '#00ff55') {
        this.projectiles.push({
            startX,
            startY,
            endX,
            endY,
            color,
            progress: 0,
            speed: 3, // Speed multiplier
            maxProgress: 1,
            width: 3
        });
    }

    /**
     * Create impact particles at location
     */
    addImpactParticles(x, y, count = 8, color = '#ff0055') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                size: 2 + Math.random() * 2,
                color
            });
        }
    }

    /**
     * Create hit marker (X) at location
     */
    addHitMarker(x, y, color = '#fff') {
        this.hitMarkers.push({
            x,
            y,
            color,
            life: 0.5, // 500ms
            maxLife: 0.5,
            size: 20
        });
    }

    /**
     * Play laser fire sound
     */
    playLaserSound() {
        if (!this.sounds.enabled) return;

        try {
            if (!this.sounds.audioContext) {
                this.sounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.sounds.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Laser "pew" sound
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.sounds.enabled = false;
        }
    }

    /**
     * Play impact sound
     */
    playImpactSound() {
        if (!this.sounds.enabled) return;

        try {
            if (!this.sounds.audioContext) {
                this.sounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.sounds.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Impact "boom" sound
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.15);
        } catch (e) {
            // Silent fail
        }
    }

    /**
     * Update all effects
     */
    update(dt) {
        // Update projectiles
        this.projectiles = this.projectiles.filter(p => {
            p.progress += dt * p.speed;
            return p.progress < p.maxProgress;
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= dt;
            return particle.life > 0;
        });

        // Update hit markers
        this.hitMarkers = this.hitMarkers.filter(marker => {
            marker.life -= dt;
            return marker.life > 0;
        });
    }

    /**
     * Render all effects on canvas
     */
    render(ctx) {
        // Render projectiles
        this.projectiles.forEach(p => {
            const currentX = p.startX + (p.endX - p.startX) * p.progress;
            const currentY = p.startY + (p.endY - p.startY) * p.progress;

            ctx.save();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.width;
            ctx.globalAlpha = 1 - p.progress;

            // Draw trail
            ctx.beginPath();
            ctx.moveTo(p.startX, p.startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            // Draw glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.stroke();

            ctx.restore();
        });

        // Render particles
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;

            ctx.save();
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Render hit markers
        this.hitMarkers.forEach(marker => {
            const alpha = marker.life / marker.maxLife;
            const size = marker.size * (1 + (1 - alpha) * 0.5); // Grow slightly

            ctx.save();
            ctx.strokeStyle = marker.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = alpha;

            // Draw X
            ctx.beginPath();
            ctx.moveTo(marker.x - size / 2, marker.y - size / 2);
            ctx.lineTo(marker.x + size / 2, marker.y + size / 2);
            ctx.moveTo(marker.x + size / 2, marker.y - size / 2);
            ctx.lineTo(marker.x - size / 2, marker.y + size / 2);
            ctx.stroke();

            ctx.restore();
        });
    }

    /**
     * Clear all effects
     */
    clear() {
        this.projectiles = [];
        this.particles = [];
        this.hitMarkers = [];
    }
}
