/**
 * HazardRenderer.js
 * Handles high-detail realistic particle & plasma rendering for Fires, Breaches, and Oxygen Depletion.
 */

class HazardRenderer {
    constructor(hazardManager) {
        this.hazardManager = hazardManager;
        this.fireEmbers = [];
        this.smokePuffs = [];
        this.breachVapors = [];

        // Initialize particle systems
        this._initParticles();
    }

    _initParticles() {
        // Pre-create ember & smoke pools for high performance
        for (let i = 0; i < 40; i++) {
            this.fireEmbers.push({
                x: Math.random() * 32,
                y: Math.random() * 32,
                vy: -15 - Math.random() * 25,
                vx: (Math.random() - 0.5) * 10,
                size: 1 + Math.random() * 2,
                life: Math.random(),
                maxLife: 0.6 + Math.random() * 0.6
            });

            this.smokePuffs.push({
                x: Math.random() * 32,
                y: Math.random() * 32,
                vy: -8 - Math.random() * 12,
                vx: (Math.random() - 0.5) * 8,
                size: 3 + Math.random() * 4,
                life: Math.random(),
                maxLife: 0.8 + Math.random() * 0.7
            });
        }
    }

    /**
     * Render oxygen depletion overlay
     */
    renderOxygenOverlay(ctx, tileSize, offsetX, offsetY) {
        if (!this.hazardManager || !this.hazardManager.gameState) return;

        const state = this.hazardManager.gameState;
        if (!state.showOxygenOverlay) return;

        const rooms = state.ship.rooms || [];
        ctx.save();

        for (const room of rooms) {
            const oxygenLevel = room.oxygen !== undefined ? room.oxygen : 100;
            let overlayColor;

            if (oxygenLevel >= 70) {
                continue;
            } else if (oxygenLevel >= 30) {
                overlayColor = `rgba(100, 150, 255, ${(70 - oxygenLevel) / 70 * 0.2})`;
            } else if (oxygenLevel >= 1) {
                overlayColor = `rgba(255, 200, 0, ${(30 - oxygenLevel) / 30 * 0.3})`;
            } else {
                const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.35;
                overlayColor = `rgba(255, 50, 50, ${pulse})`;
            }

            ctx.fillStyle = overlayColor;
            for (const tile of room.tiles) {
                const posX = tile.x * tileSize;
                const posY = tile.y * tileSize;
                ctx.fillRect(posX, posY, tileSize, tileSize);
            }
        }

        ctx.restore();
    }

    /**
     * Render realistic breaches with torn metal, vacuum suction, and decompression vapor
     */
    renderBreaches(ctx, tileSize, offsetX, offsetY) {
        const time = Date.now() / 1000;
        const breaches = this.hazardManager.breaches || [];

        for (const breach of breaches) {
            const posX = breach.x * tileSize;
            const posY = breach.y * tileSize;
            const centerX = posX + tileSize / 2;
            const centerY = posY + tileSize / 2;
            const severity = breach.severity || 1;

            ctx.save();

            // 1. Vacuum Decompression Suction Aura (Swirling Cyan Lines)
            const pulse = Math.sin(time * 6 + breach.x) * 0.15 + 0.35;
            ctx.fillStyle = `rgba(0, 240, 255, ${pulse * 0.3})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, tileSize * (0.6 + severity * 0.15), 0, Math.PI * 2);
            ctx.fill();

            // Swirling inward suction ring
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const ringRadius = (tileSize * 0.4) * (1 - (time * 1.5 % 1.0));
            ctx.arc(centerX, centerY, Math.max(2, ringRadius), 0, Math.PI * 2);
            ctx.stroke();

            // 2. Torn Metal Hull Breach Hole (Dark Space Void Center)
            const holeRadius = tileSize * (0.18 + severity * 0.08);

            // Red/Orange hot torn metal edge slag
            ctx.strokeStyle = '#ff3300';
            ctx.shadowColor = '#ff3300';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, holeRadius + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Deep void center
            ctx.fillStyle = '#030712';
            ctx.beginPath();
            ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Jagged Metal Cracks radiating out
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            const numCracks = 4 + severity;
            for (let i = 0; i < numCracks; i++) {
                const angle = (Math.PI * 2 / numCracks) * i + (i % 2 === 0 ? 0.2 : -0.2);
                const len = (tileSize * 0.35) * (0.9 + severity * 0.2);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                const endX = centerX + Math.cos(angle) * len;
                const endY = centerY + Math.sin(angle) * len;
                ctx.lineTo(endX, endY);

                if (severity >= 2) {
                    const branchAngle = angle + (i % 2 === 0 ? 0.5 : -0.5);
                    ctx.lineTo(endX + Math.cos(branchAngle) * 6, endY + Math.sin(branchAngle) * 6);
                }
                ctx.stroke();
            }

            // 3. Decompression Air/Ice Crystal Vapor Spraying Out
            const numParticles = 8 + severity * 4;
            for (let i = 0; i < numParticles; i++) {
                const pTime = (time * (1.2 + severity * 0.2) + i * 0.15) % 1.0;
                const pAngle = (i / numParticles) * Math.PI * 2 + time * 0.5;
                const pDist = pTime * tileSize * (0.7 + severity * 0.25);

                const px = centerX + Math.cos(pAngle) * pDist;
                const py = centerY + Math.sin(pAngle) * pDist;
                const pAlpha = (1 - pTime) * 0.8;
                const pSize = (1 - pTime * 0.4) * (2 + severity);

                ctx.fillStyle = `rgba(200, 240, 255, ${pAlpha})`;
                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4. Red Emergency Warning Strobe Light
            const strobe = Math.sin(time * 10) > 0;
            if (strobe) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.fillRect(posX, posY, tileSize, tileSize);
            }

            ctx.restore();
        }
    }

    /**
     * Render realistic animated fires with multi-layer flames, embers, smoke & dynamic light pulse
     */
    renderFires(ctx, tileSize, offsetX, offsetY, visible = []) {
        const time = Date.now() / 1000;
        const fires = this.hazardManager.fires || [];

        for (const fire of fires) {
            if (!visible[fire.y] || !visible[fire.y][fire.x]) continue;

            const posX = fire.x * tileSize;
            const posY = fire.y * tileSize;
            const centerX = posX + tileSize / 2;
            const centerY = posY + tileSize / 2;

            const intensity = (fire.intensity || 50) / 100;
            const flicker = Math.sin(time * 18 + fire.x * 3 + fire.y * 7) * 0.15;
            const currentIntensity = Math.min(1.0, Math.max(0.2, intensity + flicker));

            ctx.save();

            // 1. Ambient Fire Light Glow on Floor (Flickering Pulse)
            const lightRadius = tileSize * (1.2 + currentIntensity * 0.8);
            const lightGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, lightRadius);
            lightGrad.addColorStop(0, `rgba(255, 120, 0, ${0.4 * currentIntensity})`);
            lightGrad.addColorStop(0.5, `rgba(255, 60, 0, ${0.2 * currentIntensity})`);
            lightGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, lightRadius, 0, Math.PI * 2);
            ctx.fill();

            // 2. Dark Smoke Puffs Curling Upwards
            for (let i = 0; i < 3; i++) {
                const sProgress = (time * 1.5 + i * 0.33 + fire.x) % 1.0;
                const sx = centerX + Math.sin(time * 3 + i + fire.y) * 6 * currentIntensity;
                const sy = centerY - sProgress * 22;
                const sAlpha = (1 - sProgress) * 0.45 * currentIntensity;
                const sRadius = (3 + sProgress * 8) * currentIntensity;

                ctx.fillStyle = `rgba(15, 20, 30, ${sAlpha})`;
                ctx.beginPath();
                ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Multi-Layer Animated Fire Flame Tongues
            const numFlames = 5;
            for (let i = 0; i < numFlames; i++) {
                const fAngle = (i / numFlames) * Math.PI * 2;
                const fOffsetX = Math.cos(fAngle) * 5 * currentIntensity;
                const fOffsetY = Math.sin(fAngle) * 5 * currentIntensity;
                const fHeight = (12 + Math.sin(time * 14 + i * 2 + fire.x) * 6) * currentIntensity;

                // Outer Red/Orange Flame
                ctx.fillStyle = `rgba(239, 68, 68, ${0.8 * currentIntensity})`;
                ctx.beginPath();
                ctx.arc(centerX + fOffsetX, centerY + fOffsetY - fHeight * 0.3, fHeight * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Middle Bright Yellow Flame
                ctx.fillStyle = `rgba(245, 158, 11, ${0.9 * currentIntensity})`;
                ctx.beginPath();
                ctx.arc(centerX + fOffsetX * 0.6, centerY + fOffsetY * 0.6 - fHeight * 0.4, fHeight * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Inner White/Cyan Hot Core
                ctx.fillStyle = `rgba(255, 255, 220, ${0.95 * currentIntensity})`;
                ctx.beginPath();
                ctx.arc(centerX + fOffsetX * 0.3, centerY + fOffsetY * 0.3 - fHeight * 0.45, fHeight * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4. Rising Glowing Embers & Sparks
            const numEmbers = Math.floor(4 + currentIntensity * 4);
            for (let i = 0; i < numEmbers; i++) {
                const eProgress = (time * 3 + i * 0.2 + fire.x * 2) % 1.0;
                const ex = centerX + Math.sin(time * 5 + i * 3) * 10 * currentIntensity;
                const ey = centerY + 6 - eProgress * 28;
                const eAlpha = (1 - eProgress) * currentIntensity;
                const eSize = (1 - eProgress * 0.5) * 2;

                ctx.fillStyle = i % 2 === 0 ? `rgba(255, 220, 100, ${eAlpha})` : `rgba(255, 100, 0, ${eAlpha})`;
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            ctx.restore();
        }
    }
}
