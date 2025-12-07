/**
 * WeaponFireEffects.js
 * Manages visual effects for weapon firing in combat
 */

class WeaponFireEffects {
    constructor() {
        this.activeEffects = [];
    }

    /**
     * Trigger a weapon fire effect
     * @param {string} weaponType - Type of weapon (laser_mk1, ion_cannon, etc.)
     * @param {number} x - X position of weapon
     * @param {number} y - Y position of weapon
     */
    triggerEffect(weaponType, x, y) {
        this.activeEffects.push({
            type: weaponType,
            x: x,
            y: y,
            startTime: Date.now(),
            duration: this.getEffectDuration(weaponType)
        });
    }

    getEffectDuration(weaponType) {
        switch (weaponType) {
            case 'laser_mk1':
                return 300; // 0.3 seconds
            case 'ion_cannon':
                return 500;
            case 'railgun':
                return 150; // Very fast
            case 'plasma_cannon':
                return 600;
            case 'pulse_laser':
                return 400;
            default:
                return 300;
        }
    }

    /**
     * Update active effects (remove expired ones)
     */
    update() {
        const now = Date.now();
        this.activeEffects = this.activeEffects.filter(effect => {
            return (now - effect.startTime) < effect.duration;
        });
    }

    /**
     * Render all active fire effects
     */
    render(ctx, tileSize) {
        const now = Date.now();

        for (const effect of this.activeEffects) {
            const elapsed = now - effect.startTime;
            const progress = elapsed / effect.duration;

            ctx.save();

            switch (effect.type) {
                case 'laser_mk1':
                    this.renderLaserBeam(ctx, effect.x, effect.y, progress, tileSize);
                    break;
                case 'ion_cannon':
                    this.renderIonBlast(ctx, effect.x, effect.y, progress, tileSize);
                    break;
                case 'railgun':
                    this.renderRailgunShot(ctx, effect.x, effect.y, progress, tileSize);
                    break;
                case 'plasma_cannon':
                    this.renderPlasmaBlast(ctx, effect.x, effect.y, progress, tileSize);
                    break;
                case 'pulse_laser':
                    this.renderPulseLaserBurst(ctx, effect.x, effect.y, progress, tileSize);
                    break;
            }

            ctx.restore();
        }
    }

    renderLaserBeam(ctx, x, y, progress, tileSize) {
        // Red twin laser beams shooting upward
        const length = tileSize * 3;
        const alpha = 1 - progress;
        const offset = progress * length;

        const spacing = 8;
        const barrelWidth = 4;

        // Left beam
        ctx.strokeStyle = `rgba(255, 68, 68, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x - spacing - barrelWidth / 2, y - offset);
        ctx.lineTo(x - spacing - barrelWidth / 2, y - offset - length);
        ctx.stroke();

        // Right beam
        ctx.beginPath();
        ctx.moveTo(x + spacing + barrelWidth / 2, y - offset);
        ctx.lineTo(x + spacing + barrelWidth / 2, y - offset - length);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    renderIonBlast(ctx, x, y, progress, tileSize) {
        // Expanding cyan energy ring
        const radius = progress * tileSize * 2;
        const alpha = (1 - progress) * 0.8;

        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(0, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y - progress * tileSize * 2, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner core
        ctx.fillStyle = `rgba(150, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y - progress * tileSize * 2, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    renderRailgunShot(ctx, x, y, progress, tileSize) {
        // Fast yellow projectile trail
        const speed = tileSize * 6;
        const offset = progress * speed;
        const trailLength = tileSize * 0.5;
        const alpha = 1 - progress;

        // Projectile
        ctx.fillStyle = `rgba(255, 220, 0, ${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(255, 220, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y - offset, 4, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        const gradient = ctx.createLinearGradient(x, y - offset, x, y - offset + trailLength);
        gradient.addColorStop(0, `rgba(255, 220, 0, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 220, 0, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - offset);
        ctx.lineTo(x, y - offset + trailLength);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    renderPlasmaBlast(ctx, x, y, progress, tileSize) {
        // Magenta plasma orb with trailing particles
        const offset = progress * tileSize * 3;
        const orbSize = tileSize * 0.3;
        const alpha = 1 - progress * 0.5; // Fades slower

        // Main orb
        const gradient = ctx.createRadialGradient(x, y - offset, 0, x, y - offset, orbSize);
        gradient.addColorStop(0, `rgba(255, 100, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(200, 0, 255, ${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(150, 0, 200, 0)`);

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(255, 0, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y - offset, orbSize, 0, Math.PI * 2);
        ctx.fill();

        // Trailing particles
        for (let i = 0; i < 5; i++) {
            const trailProgress = i / 5;
            const particleY = y - offset + tileSize * 0.2 * i;
            const particleAlpha = alpha * (1 - trailProgress) * 0.5;
            const particleSize = orbSize * (1 - trailProgress * 0.5);

            ctx.fillStyle = `rgba(200, 100, 255, ${particleAlpha})`;
            ctx.beginPath();
            ctx.arc(x, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    renderPulseLaserBurst(ctx, x, y, progress, tileSize) {
        // Three orange pulses in sequence
        const spacing = 6;
        const barrels = [-spacing, 0, spacing];
        const stagger = 0.15; // 15% stagger between shots

        for (let i = 0; i < 3; i++) {
            const burstProgress = Math.max(0, Math.min(1, (progress - i * stagger) / (1 - stagger * 2)));
            if (burstProgress <= 0) continue;

            const offset = burstProgress * tileSize * 2.5;
            const alpha = (1 - burstProgress) * 0.9;
            const pulseSize = 3;

            ctx.fillStyle = `rgba(255, 136, 0, ${alpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(255, 136, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(barrels[i] + x, y - offset, pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // Small trail
            ctx.strokeStyle = `rgba(255, 136, 0, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(barrels[i] + x, y - offset);
            ctx.lineTo(barrels[i] + x, y - offset + tileSize * 0.3);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }

    /**
     * Clear all effects
     */
    clear() {
        this.activeEffects = [];
    }
}
