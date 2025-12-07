/**
 * HazardRenderer.js
 * Renders visual effects for ship hazards (breaches, fires, oxygen overlays)
 */

class HazardRenderer {
    constructor(hazardManager) {
        this.hazardManager = hazardManager;
    }

    /**
     * Main render method
     */
    render(ctx, tileSize, offsetX, offsetY) {
        // Render oxygen overlay if enabled
        if (this.hazardManager.oxygenOverlayEnabled) {
            this.renderOxygenOverlay(ctx, tileSize, offsetX, offsetY);
        }

        // Render breaches
        this.renderBreaches(ctx, tileSize, offsetX, offsetY);

        // Fires will be added in Phase 2
    }

    /**
     * Render oxygen level overlay for all rooms
     */
    renderOxygenOverlay(ctx, tileSize, offsetX, offsetY) {
        ctx.save();

        for (const roomId in this.hazardManager.roomOxygen) {
            const room = this.hazardManager.roomOxygen[roomId];
            const oxygenLevel = room.level;

            // Determine overlay color based on oxygen level
            let overlayColor;
            if (oxygenLevel >= 70) {
                continue; // No overlay for good oxygen
            } else if (oxygenLevel >= 30) {
                // Light blue tint for low oxygen
                overlayColor = `rgba(100, 150, 255, ${(70 - oxygenLevel) / 70 * 0.2})`;
            } else if (oxygenLevel >= 1) {
                // Yellow tint for very low oxygen
                overlayColor = `rgba(255, 200, 0, ${(30 - oxygenLevel) / 30 * 0.3})`;
            } else {
                // Pulsing red for no oxygen
                const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.3;
                overlayColor = `rgba(255, 50, 50, ${pulse})`;
            }

            // Draw overlay on all tiles in this room
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
     * Render breach cracks and venting particles
     */
    renderBreaches(ctx, tileSize, offsetX, offsetY) {
        const time = Date.now() / 1000;

        for (const breach of this.hazardManager.breaches) {
            const posX = breach.x * tileSize;
            const posY = breach.y * tileSize;

            ctx.save();

            // Draw crack based on severity
            this.renderCrack(ctx, posX, posY, tileSize, breach.severity);

            // Draw venting air particles
            this.renderVentingAir(ctx, posX, posY, tileSize, breach.severity, time);

            ctx.restore();
        }
    }

    /**
     * Render crack visual for a breach
     */
    renderCrack(ctx, x, y, tileSize, severity) {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        // Draw cracks radiating from center
        const numCracks = 3 + severity;
        for (let i = 0; i < numCracks; i++) {
            const angle = (Math.PI * 2 / numCracks) * i + Math.random() * 0.5;
            const length = (tileSize / 3) * (1 + severity * 0.3);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);

            // Main crack line
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;
            ctx.lineTo(endX, endY);

            // Add branches for higher severity
            if (severity >= 2) {
                const branchAngle = angle + (Math.random() - 0.5) * 0.8;
                const branchLength = length * 0.5;
                const branchX = endX + Math.cos(branchAngle) * branchLength;
                const branchY = endY + Math.sin(branchAngle) * branchLength;
                ctx.moveTo(endX, endY);
                ctx.lineTo(branchX, branchY);
            }

            ctx.stroke();
        }

        // Draw hole for severity 3
        if (severity >= 3) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, centerY, tileSize * 0.15, 0, Math.PI * 2);
            ctx.fill();

            // Glow around hole
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, tileSize * 0.2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /**
     * Render venting air particles
     */
    renderVentingAir(ctx, x, y, tileSize, severity, time) {
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;
        const numParticles = 5 + severity * 3;

        for (let i = 0; i < numParticles; i++) {
            // Particle animation based on time and index
            const progress = ((time * (1 + severity * 0.3) + i * 0.2) % 1.0);
            const angle = (i / numParticles) * Math.PI * 2 + time;
            const distance = progress * tileSize * (0.8 + severity * 0.2);

            const px = centerX + Math.cos(angle) * distance;
            const py = centerY + Math.sin(angle) * distance;

            const alpha = (1 - progress) * 0.6;
            const size = (1 - progress) * (2 + severity);

            ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.shadowColor = `rgba(200, 220, 255, ${alpha})`;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}
