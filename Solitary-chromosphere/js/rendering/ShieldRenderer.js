/**
 * ShieldRenderer.js
 * Handles rendering of ship shield mesh and impact effects
 * Extracted from ShipRenderer.js
 */

class ShieldRenderer {
    constructor(tileSize) {
        this.tileSize = tileSize;
    }

    /**
     * Render shield mesh with animated vertices and impact effects
     */
    render(ctx, ship, shieldManager, combatManager, offsetX, offsetY) {
        const shields = ship.shields;
        if (!shields) return;

        const status = shieldManager.getShieldStatus();

        // Shield parameters
        const time = Date.now() / 1000;

        // Calculate opacity
        let opacity;
        if (status.isRecharging) {
            opacity = status.rechargeProgress;
        } else if (shields.currentLayers >= shields.maxLayers) {
            const fadeStartTime = 5.0;
            if (status.fullChargeTime < fadeStartTime) {
                opacity = 1.0;
            } else {
                const fadeTime = status.fullChargeTime - fadeStartTime;
                opacity = Math.max(0, 1.0 - (fadeTime / 2.0));
            }
        } else {
            const chargePercent = shields.currentLayers / Math.max(shields.maxLayers, 1);
            opacity = chargePercent;
        }

        // Impact flash: boost opacity to 100% for brief moment
        if (shieldManager.impactFlashTime > 0) {
            opacity = 1.0;
        }

        // Calculate ship center for impact effects - USE DYNAMIC OFFSETS
        const shipCenterX = offsetX + (25 * this.tileSize) / 2;
        const shipCenterY = offsetY + (25 * this.tileSize) / 2;
        const baseRadius = 360;


        // Only show impact effects during active combat
        const inActiveCombat = combatManager && combatManager.active;
        // Draw impact wave FIRST (even if shields are down) - use separate rendering  
        const waveProgress = inActiveCombat ? shieldManager.impactWaveProgress : 0;
        const flashTime = inActiveCombat ? shieldManager.impactFlashTime : 0;

        // DEBUG: Log effect values when they're active
        if (waveProgress > 0 || flashTime > 0) {
            // Impact effects rendering
        }

        if (waveProgress > 0 && waveProgress < 1.0) {
            ctx.save();
            const waveRadius = baseRadius + (waveProgress * 100); // Expands 100px
            const waveOpacity = (1.0 - waveProgress); // Fades out as it expands, independent of shield opacity

            ctx.beginPath();
            ctx.arc(shipCenterX, shipCenterY, waveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 85, ${waveOpacity})`; // Green wave (matches shields)
            ctx.lineWidth = 3;
            ctx.shadowColor = `rgba(0, 255, 85, ${waveOpacity})`;
            ctx.shadowBlur = 15;
            ctx.stroke();

            // Energy particles dispersing with randomness
            const numParticles = 12;
            for (let i = 0; i < numParticles; i++) {
                const baseAngle = (i / numParticles) * Math.PI * 2;
                const angleVariation = (Math.random() - 0.5) * 0.4; // Random angle offset
                const angle = baseAngle + angleVariation;

                const distanceVariation = (Math.random() - 0.5) * 50; // Random distance variation
                const particleDistance = waveRadius - 30 + distanceVariation;

                const px = shipCenterX + Math.cos(angle) * particleDistance;
                const py = shipCenterY + Math.sin(angle) * particleDistance;

                const sizeVariation = Math.random() * 2 + 1; // Size between 1-3x base
                const particleSize = (1.0 - waveProgress) * 4 * sizeVariation;

                ctx.beginPath();
                ctx.arc(px, py, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 85, ${waveOpacity})`; // Green particles
                ctx.shadowBlur = 10;
                ctx.fill();
            }
            ctx.restore();
        }

        if (opacity <= 0) return;

        ctx.save();

        // Generate mesh points for active shield layers only
        const numPointsPerRing = 24;
        const numActiveLayers = Math.min(shields.currentLayers, 4); // Max 4 visual rings

        // Only create rings for active layers
        const rings = [];
        for (let i = 0; i < numActiveLayers; i++) {
            rings.push({
                radius: baseRadius - (i * 40),  // Each layer 40px smaller
                variation: 25 - (i * 5)          // Less variation for inner rings
            });
        }

        if (rings.length === 0) return; // No shields active

        const points = [];

        rings.forEach((ring, ringIndex) => {
            for (let i = 0; i < numPointsPerRing; i++) {
                const angle = (i / numPointsPerRing) * Math.PI * 2;
                const chaosAngle = angle + Math.sin(time * (0.2 + ringIndex * 0.1) + i * 0.5) * 0.2;
                const chaosRadius = ring.radius + Math.sin(time * 0.5 + i * 1.2 + ringIndex) * ring.variation;

                const x = shipCenterX + Math.cos(chaosAngle) * chaosRadius;
                const y = shipCenterY + Math.sin(chaosAngle) * chaosRadius;

                points.push({ x, y, index: i, ring: ringIndex });
            }
        });

        // Draw mesh network connections
        ctx.strokeStyle = `rgba(0, 255, 85, ${opacity * 0.6})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];

            const connections = [];
            for (let j = 0; j < points.length; j++) {
                if (i === j) continue;

                const p2 = points[j];
                const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

                if (dist < 180) {
                    connections.push({ point: p2, dist: dist });
                }
            }

            connections.sort((a, b) => a.dist - b.dist);
            const numConnections = Math.min(3 + Math.floor(Math.random() * 3), connections.length);

            for (let k = 0; k < numConnections; k++) {
                const conn = connections[k];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(conn.point.x, conn.point.y);
                ctx.globalAlpha = opacity * 0.4 * (1 - conn.dist / 180);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        }

        // Draw glowing vertices
        ctx.shadowColor = `rgba(0, 255, 85, ${opacity})`;
        ctx.shadowBlur = 8;

        for (const point of points) {
            const pulse = Math.sin(time * 4 + point.index * 0.3) * 0.3 + 0.7;
            const size = 2 + pulse;

            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 85, ${opacity * pulse})`;
            ctx.fill();
        }

        ctx.restore();
    }
}
