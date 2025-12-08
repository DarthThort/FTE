/**
 * WeaponTurretsRenderer.js
 * Renders weapon turrets based on installed modules
 *  * Extracted from ShipRenderer.js
 */

class WeaponTurretsRenderer {
    constructor(tileSize) {
        this.tileSize = tileSize;
    }

    /**
     * Render all weapon turrets
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} ship - Ship data
     */
    render(ctx, ship) {
        // Weapon positions
        const weapons = [
            { x: 9, y: 6, hardpoint: 'weapon1' },
            { x: 17, y: 6, hardpoint: 'weapon2' }
        ];

        for (const weapon of weapons) {
            const weaponModuleId = ship.hardpoints?.[weapon.hardpoint];
            if (!weaponModuleId) continue;

            const weaponModule = getModule(weaponModuleId);
            if (!weaponModule) continue;

            const centerX = weapon.x * this.tileSize + this.tileSize / 2;
            const centerY = weapon.y * this.tileSize + this.tileSize / 2;
            const time = Date.now() / 1000;

            ctx.save();

            // Render based on weapon type
            switch (weaponModule.id) {
                case 'laser_mk1':
                    this.renderLaserCannon(ctx, centerX, centerY, time);
                    break;
                case 'ion_cannon':
                    this.renderIonCannon(ctx, centerX, centerY, time);
                    break;
                case 'railgun':
                    this.renderRailgun(ctx, centerX, centerY, time);
                    break;
                case 'plasma_cannon':
                    this.renderPlasmaCannon(ctx, centerX, centerY, time);
                    break;
                case 'pulse_laser':
                    this.renderPulseLaser(ctx, centerX, centerY, time);
                    break;
            }

            ctx.restore();
        }
    }

    renderLaserCannon(ctx, x, y, time) {
        // Twin laser barrels with red glow
        const barrelLength = this.tileSize * 0.8;
        const barrelWidth = 4;
        const spacing = 8;

        // Left barrel
        ctx.fillStyle = '#555';
        ctx.fillRect(x - spacing - barrelWidth, y - barrelLength / 2, barrelWidth, barrelLength);

        // Right barrel
        ctx.fillRect(x + spacing, y - barrelLength / 2, barrelWidth, barrelLength);

        // Glowing tips
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 68, 68, ${pulse})`;
        ctx.fillStyle = `rgba(255, 68, 68, ${pulse})`;

        ctx.fillRect(x - spacing - barrelWidth, y - barrelLength / 2 - 3, barrelWidth, 3);
        ctx.fillRect(x + spacing, y - barrelLength / 2 - 3, barrelWidth, 3);
        ctx.shadowBlur = 0;

        // Mount base
        ctx.fillStyle = '#444';
        ctx.fillRect(x - this.tileSize * 0.3, y + barrelLength / 2 - 6, this.tileSize * 0.6, 6);
    }

    renderIonCannon(ctx, x, y, time) {
        // Circular ion coil with cyan energy
        const radius = this.tileSize * 0.35;

        // Outer ring
        ctx.strokeStyle = '#3a5a7a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Energy coils (rotating)
        const rotation = time * 2;
        for (let i = 0; i < 4; i++) {
            const angle = rotation + (i * Math.PI / 2);
            const x1 = x + Math.cos(angle) * radius * 0.6;
            const y1 = y + Math.sin(angle) * radius * 0.6;
            const x2 = x + Math.cos(angle + Math.PI) * radius * 0.6;
            const y2 = y + Math.sin(angle + Math.PI) * radius * 0.6;

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Central core
        const pulse = Math.sin(time * 4) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    renderRailgun(ctx, x, y, time) {
        // Long barrel with magnetic rings
        const barrelLength = this.tileSize * 1.1;
        const barrelWidth = 8;

        // Main barrel
        const gradient = ctx.createLinearGradient(x, y - barrelLength / 2, x, y + barrelLength / 2);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(0.5, '#555');
        gradient.addColorStop(1, '#2a2a2a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - barrelWidth / 2, y - barrelLength / 2, barrelWidth, barrelLength);

        // Magnetic accelerator rings
        const numRings = 5;
        const pulse = (time * 3) % 1.0;
        for (let i = 0; i < numRings; i++) {
            const ringY = y - barrelLength / 2 + (barrelLength / numRings) * i;
            const ringAlpha = Math.max(0, 1 - Math.abs(pulse - (i / numRings)));

            ctx.strokeStyle = `rgba(255, 200, 0, ${ringAlpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(255, 200, 0, ${ringAlpha})`;
            ctx.beginPath();
            ctx.arc(x, ringY, barrelWidth * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Mount
        ctx.fillStyle = '#333';
        ctx.fillRect(x - this.tileSize * 0.25, y + barrelLength / 2 - 4, this.tileSize * 0.5, 6);
    }

    renderPlasmaCannon(ctx, x, y, time) {
        // Plasma containment sphere with rotating energy
        const radius = this.tileSize * 0.4;

        // Containment field hexagon
        ctx.strokeStyle = '#5a3a7a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Plasma core (pulsing)
        const pulse = Math.sin(time * 4) * 0.4 + 0.6;
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.7);
        coreGradient.addColorStop(0, `rgba(255, 0, 255, ${pulse})`);
        coreGradient.addColorStop(0.5, `rgba(200, 0, 255, ${pulse * 0.6})`);
        coreGradient.addColorStop(1, 'rgba(100, 0, 200, 0)');

        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rotating energy streams
        const rotation = time * 2;
        for (let i = 0; i < 3; i++) {
            const angle = rotation + (i * Math.PI * 2 / 3);
            const streamRadius = radius * 0.5;
            const sx = x + Math.cos(angle) * streamRadius;
            const sy = y + Math.sin(angle) * streamRadius;

            ctx.fillStyle = `rgba(255, 100, 255, 0.6)`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderPulseLaser(ctx, x, y, time) {
        // Triple barrel pulse laser array
        const barrelLength = this.tileSize * 0.7;
        const barrelWidth = 3;
        const spacing = 6;

        // Three barrels
        const barrels = [-spacing, 0, spacing];
        for (const offset of barrels) {
            ctx.fillStyle = '#555';
            ctx.fillRect(x + offset - barrelWidth / 2, y - barrelLength / 2, barrelWidth, barrelLength);
        }

        // Pulsing charge effect (staggered)
        for (let i = 0; i < 3; i++) {
            const pulse = Math.sin(time * 6 + i * 1.5) * 0.5 + 0.5;
            if (pulse > 0.7) {
                const offset = barrels[i];
                ctx.fillStyle = `rgba(255, 136, 0, ${pulse})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ff8800';
                ctx.fillRect(x + offset - barrelWidth / 2, y - barrelLength / 2 - 3, barrelWidth, 3);
                ctx.shadowBlur = 0;
            }
        }

        // Mount base
        ctx.fillStyle = '#444';
        ctx.fillRect(x - this.tileSize * 0.3, y + barrelLength / 2 - 4, this.tileSize * 0.6, 5);
    }
}
