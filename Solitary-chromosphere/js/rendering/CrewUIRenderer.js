/**
 * CrewUIRenderer.js
 * High-detail top-down sci-fi crew member renderer with species variations,
 * accurate movement facing directions, walking steps, and repair animations.
 */

class CrewUIRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
    }

    /**
     * Draw all crew members on the ship
     */
    drawCrew(ctx, ship, visible) {
        if (!ship.crew || ship.crew.length === 0) return;

        const time = Date.now() / 1000;

        for (const crew of ship.crew) {
            const posX = crew.x || 0;
            const posY = crew.y || 0;

            // Track movement vector for exact facing direction
            if (crew.lastPosX === undefined) crew.lastPosX = posX;
            if (crew.lastPosY === undefined) crew.lastPosY = posY;

            const dx = posX - crew.lastPosX;
            const dy = posY - crew.lastPosY;

            if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
                // Calculate exact movement angle (0 rad = facing Right along +X)
                crew.facingAngle = Math.atan2(dy, dx);
            } else if (crew.facingAngle === undefined) {
                crew.facingAngle = Math.PI / 2; // Default facing Down (+Y)
            }

            crew.lastPosX = posX;
            crew.lastPosY = posY;

            // Render high-detail top-down character
            ctx.save();
            ctx.translate(posX, posY);
            ctx.rotate(crew.facingAngle);

            this.renderCharacter(ctx, crew, time, false);
            ctx.restore();

            // Draw UI overlays (Name Tag, Health, Repairing) in screen space
            const gridX = Math.floor(posX / this.tileSize);
            const gridY = Math.floor(posY / this.tileSize);
            if (visible && visible[gridY] && visible[gridY][gridX]) {
                const firstName = crew.name ? crew.name.split(' ')[0] : 'Crew';
                const roleColor = this.getCrewColor(crew.role);

                // Name Tag Badge
                ctx.save();
                ctx.font = '700 9px "Rajdhani", var(--font-tech, monospace)';
                ctx.textAlign = 'center';

                const textWidth = ctx.measureText(firstName).width;
                ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
                ctx.strokeStyle = roleColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(posX - textWidth / 2 - 4, posY - 22, textWidth + 8, 12);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.fillText(firstName, posX, posY - 13);
                ctx.restore();

                // Repairing or Health Status
                if (crew.state === 'repairing' && crew.repairProgress !== undefined) {
                    this.drawRepairIndicator(ctx, posX, posY, 12, crew.repairProgress);
                } else if (crew.health < crew.maxHealth) {
                    this.drawHealthBar(ctx, posX, posY, 12, crew.health, crew.maxHealth);
                }
            }
        }
    }

    /**
     * Render High-Detail Sci-Fi Character (Front = +X axis)
     */
    renderCharacter(ctx, charObj, time, isPlayer = false) {
        const seed = (charObj.id || 0) + (charObj.name ? charObj.name.length : 0);
        const species = charObj.species || 'Humano';
        const role = isPlayer ? 'Captain' : (charObj.role || 'General Staff');
        const state = charObj.state || 'idle';

        const roleColor = this.getCrewColor(role);
        const skinColor = this.getSkinColor(species, seed);
        const hairColor = this.getHairColor(species, seed);

        const isWalking = state === 'moving' || state === 'wandering' || (isPlayer && (charObj.isMoving || false));
        const isRepairing = state === 'repairing' || state === 'working';

        const walkCycle = isWalking ? time * 12 + seed : 0;
        const stepOffset = isWalking ? Math.sin(walkCycle) * 4 : 0;
        const armSwing = isWalking ? Math.sin(walkCycle) * 3 : 0;

        const isTellarite = species === 'Tellarita' || species === 'Tellarite';
        const isAndorian = species === 'Andoriano' || species === 'Andorian';
        const isVulcan = species === 'Vulcano' || species === 'Vulcan';

        // 1. Soft Drop Shadow on Deck Floor
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Magnetic Boots (Front = +X)
        ctx.fillStyle = '#1e293b';
        // Left foot (upper -Y)
        ctx.beginPath();
        ctx.ellipse(stepOffset, -6, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right foot (lower +Y)
        ctx.beginPath();
        ctx.ellipse(-stepOffset, 6, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Oxygen / Power Backpack Tank (-X)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = roleColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-9, -5, 4, 10);
        ctx.fill();
        ctx.stroke();

        // 4. Armored Exo-Suit Torso & Shoulder Pauldrons
        ctx.fillStyle = '#1e293b'; // Main suit armor
        ctx.beginPath();
        ctx.ellipse(-1, 0, 7, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shoulder Pauldrons (Left & Right)
        ctx.fillStyle = roleColor;
        // Left shoulder (-Y)
        ctx.beginPath();
        ctx.ellipse(-1, -7, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right shoulder (+Y)
        ctx.beginPath();
        ctx.ellipse(-1, 7, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chest Plate Armor & Rank Insignia
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(1, 0, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Role Chest Badge
        ctx.fillStyle = roleColor;
        ctx.shadowColor = roleColor;
        ctx.shadowBlur = 6;
        ctx.fillRect(2, -1.5, 2, 3);
        ctx.shadowBlur = 0;

        // 5. Arms & Hands
        ctx.fillStyle = skinColor;
        if (isRepairing) {
            // Hands extended forward (+X) holding welding arc tool
            const workSwing = Math.sin(time * 16) * 1.5;

            // Left hand
            ctx.beginPath();
            ctx.arc(8 + workSwing, -3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Right hand
            ctx.beginPath();
            ctx.arc(8 - workSwing, 3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Welding Arc Tool & Sparks
            ctx.fillStyle = '#475569';
            ctx.fillRect(7, -1, 5, 2);

            ctx.fillStyle = time % 0.15 > 0.075 ? '#00f0ff' : '#ffffaa';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(13, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            // Normal walking / idle arms
            // Left arm (-Y)
            ctx.beginPath();
            ctx.arc(armSwing, -8, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Right arm (+Y)
            ctx.beginPath();
            ctx.arc(-armSwing, 8, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 6. Detailed Head & Visor Helmet
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(1, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Helmet
        ctx.fillStyle = hairColor;
        const hairStyle = seed % 3;
        if (hairStyle === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 4.8, Math.PI * 0.5, Math.PI * 1.5);
            ctx.fill();
        } else if (hairStyle === 1) {
            ctx.beginPath();
            ctx.ellipse(-2, 0, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Helmet Visor / Face (+X direction)
        const visorColor = isPlayer ? '#00f0ff' : roleColor;
        ctx.fillStyle = visorColor;
        ctx.shadowColor = visorColor;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.ellipse(3.5, 0, 2, 3.5, 0, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Species Features:
        if (isAndorian) {
            // Andorian Antennae pointing forward (+X)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(1, -3);
            ctx.lineTo(6, -6);
            ctx.moveTo(1, 3);
            ctx.lineTo(6, 6);
            ctx.stroke();
        } else if (isVulcan) {
            // Vulcan Pointed Ears
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.moveTo(-1, -5); ctx.lineTo(-1, -8); ctx.lineTo(1, -5);
            ctx.moveTo(-1, 5); ctx.lineTo(-1, 8); ctx.lineTo(1, 5);
            ctx.fill();
        } else if (isTellarite) {
            // Tellarite Heavy Facial Beard
            ctx.fillStyle = '#543d2b';
            ctx.beginPath();
            ctx.arc(2, 0, 4, -Math.PI / 2, Math.PI / 2);
            ctx.fill();
        }
    }

    /**
     * Get skin color based on species and seed
     */
    getSkinColor(species, seed) {
        if (species === 'Andoriano' || species === 'Andorian') {
            const blues = ['#38bdf8', '#0284c7', '#0ea5e9'];
            return blues[seed % blues.length];
        }
        if (species === 'Vulcano' || species === 'Vulcan') {
            return '#e2d3c3';
        }
        if (species === 'Tellarita' || species === 'Tellarite') {
            return '#a87850';
        }

        const humanSkins = ['#f5c29b', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
        return humanSkins[seed % humanSkins.length];
    }

    /**
     * Get hair color based on species and seed
     */
    getHairColor(species, seed) {
        if (species === 'Andoriano' || species === 'Andorian') {
            return '#ffffff'; // White hair
        }
        if (species === 'Vulcano' || species === 'Vulcan') {
            return '#18181b'; // Dark black hair
        }

        const colors = ['#271b12', '#4a3728', '#b55225', '#e6c875', '#1c1917'];
        return colors[seed % colors.length];
    }

    /**
     * Get color for crew role
     */
    getCrewColor(role) {
        const colors = {
            'Captain': '#00f0ff',
            'Capitán': '#00f0ff',
            'Engineer': '#f59e0b',
            'Ingeniero': '#f59e0b',
            'Pilot': '#3b82f6',
            'Piloto': '#3b82f6',
            'Gunner': '#ef4444',
            'Artillero': '#ef4444',
            'Weapon Specialist': '#ef4444',
            'Medic': '#10b981',
            'Médico': '#10b981',
            'Doctor': '#10b981',
            'Esp. Escudos': '#38bdf8',
            'General Staff': '#a855f7',
            'Personal General': '#a855f7'
        };
        return colors[role] || '#9ca3af';
    }

    /**
     * Draw repair indicator
     */
    drawRepairIndicator(ctx, posX, posY, radius, progress) {
        ctx.save();
        ctx.fillStyle = '#00ff55';
        ctx.font = 'bold 10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('REPARANDO', posX, posY - radius - 18);

        const barWidth = 40;
        const barHeight = 4;
        const barX = posX - barWidth / 2;
        const barY = posY - radius - 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#00ff55';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.restore();
    }

    /**
     * Draw compact health bar for injured crew
     */
    drawHealthBar(ctx, posX, posY, radius, health, maxHealth) {
        ctx.save();
        const pct = Math.max(0, health / maxHealth);
        const barWidth = 28;
        const barHeight = 3;
        const barX = posX - barWidth / 2;
        const barY = posY + radius + 4;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * pct, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.restore();
    }

    /**
     * Draw fog of war over non-visible tiles
     */
    drawFog(ctx, layout, visible) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[0].length; x++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                if (layout[y][x] === 0) continue;

                if (!visible[y][x]) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    /**
     * Generate procedural avatar data URL PNG for crew UI elements
     */
    generateCrewAvatarDataURL(crew) {
        if (!crew) return '';

        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');

        const roleColor = this.getCrewColor(crew.role);

        // Radial background
        const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.7, '#0f172a');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        // Role outer ring
        ctx.strokeStyle = roleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Render character model facing DOWN (Math.PI / 2) at 2.2x scale
        ctx.save();
        ctx.translate(32, 32);
        ctx.rotate(Math.PI / 2);
        ctx.scale(2.2, 2.2);
        this.renderCharacter(ctx, crew, 0, false);
        ctx.restore();

        return c.toDataURL();
    }
}

// Global avatar generator helper
window.getCrewAvatarURL = function(crew) {
    if (window.game && window.game.sceneManager && window.game.sceneManager.shipRenderer && window.game.sceneManager.shipRenderer.crewUIRenderer) {
        return window.game.sceneManager.shipRenderer.crewUIRenderer.generateCrewAvatarDataURL(crew);
    }
    const tempRenderer = new CrewUIRenderer(null);
    return tempRenderer.generateCrewAvatarDataURL(crew);
};