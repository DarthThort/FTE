class ShipRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        this.powerUI = null;
        this.explored = [];
        this.visible = [];

        // Initialize starfield background
        this.starfield = new StarfieldBackground(gameEngine.canvas.width, gameEngine.canvas.height);

        // Initialize weapon fire effects
        this.weaponFireEffects = new WeaponFireEffects();

        // Initialize hazard renderer (will get manager reference later)
        this.hazardRenderer = null;
        // Rendering modules
        this.tileRenderer = new TileRenderer(gameEngine);
        this.crewUIRenderer = new CrewUIRenderer(gameEngine);
        this.weaponTurretsRenderer = new WeaponTurretsRenderer(this.tileSize);
        this.shieldRenderer = new ShieldRenderer(this.tileSize);
        this.oxygenBarsRenderer = new OxygenBarsRenderer(this.tileSize);
    }

    initFog(layout) {
        if (this.explored.length !== layout.length || (layout.length > 0 && this.explored[0].length !== layout[0].length)) {
            this.explored = Array(layout.length).fill().map((_, y) =>
                Array(layout[0].length).fill().map((_, x) =>
                    // All ship tiles (non-zero) are explored from start - it's our ship!
                    layout[y][x] !== 0
                )
            );
            this.visible = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
        }
    }

    computeVisibility(player) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) return;
        this.initFog(ship.layout);
        this.visible = this.visible.map(row => row.map(() => false));
        const playerGridX = Math.floor((player.x + player.size / 2) / this.tileSize);
        const playerGridY = Math.floor((player.y + player.size / 2) / this.tileSize);
        const viewRadius = 8;
        for (let y = 0; y < ship.layout.length; y++) {
            for (let x = 0; x < ship.layout[0].length; x++) {
                const dist = Math.sqrt((x - playerGridX) ** 2 + (y - playerGridY) ** 2);
                if (dist <= viewRadius) {
                    if (this.hasLineOfSight(playerGridX, playerGridY, x, y, ship.layout)) {
                        this.visible[y][x] = true;
                        this.explored[y][x] = true;
                    }
                }
            }
        }
    }

    hasLineOfSight(x0, y0, x1, y1, layout) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        let x = x0;
        let y = y0;
        while (true) {
            if (x === x1 && y === y1) return true;
            if (layout[y][x] === 1 || layout[y][x] === 4) return false;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    render(ctx, deltaTime = 0.016) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) {
            console.error("ShipRenderer: No ship layout found!", ship);
            return;
        }

        // Ensure starfield matches full canvas size
        if (this.starfield.width !== ctx.canvas.width || this.starfield.height !== ctx.canvas.height) {
            this.starfield.resize(ctx.canvas.width, ctx.canvas.height);
        }

        // Update and render starfield FIRST (background layer)
        this.starfield.update(deltaTime);
        this.starfield.render(ctx);

        // Update weapon fire effects
        this.weaponFireEffects.update();

        const layout = ship.layout;
        this.initFog(layout);
        const mapWidth = layout[0].length * this.tileSize;
        const mapHeight = layout.length * this.tileSize;
        this.offsetX = (ctx.canvas.width - mapWidth) / 2;
        this.offsetY = (ctx.canvas.height - mapHeight) / 2;
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        this.tileRenderer.render(ctx, layout, ship.systems);
        if (this.powerUI) {
            this.powerUI.renderRoomOverlays(ctx, layout, 0, 0, this.tileSize);
        }
        this.crewUIRenderer.drawCrew(ctx, ship, this.visible);
        this.renderOxygenBars(ctx, ship);
        this.renderEngineThruster(ctx, ship);
        this.renderWeaponTurrets(ctx, ship);

        // Render weapon fire effects (on top of weapons)
        this.weaponFireEffects.render(ctx, this.tileSize);

        // Render hazards (breaches, fires, oxygen overlay)
        if (!this.hazardRenderer && this.game.state.hazardManager) {
            this.hazardRenderer = new HazardRenderer(this.game.state.hazardManager);
        }
        if (this.hazardRenderer) {
            this.hazardRenderer.render(ctx, this.tileSize, this.offsetX, this.offsetY, this.visible);
        }

        // Render hazard UI (repair prompts, progress bars, oxygen HUD)
        if (this.game.state.hazardUI) {
            const player = this.game.sceneManager.player;
            this.game.state.hazardUI.render(ctx, this, player);
        }

        this.crewUIRenderer.drawFog(ctx, layout, this.visible);
        ctx.restore();

        // Render station if near one
        this.renderStation(ctx);

        this.renderShields(ctx);
    }


    /**
     * Render oxygen level indicators for each room
     * Shows compact horizontal bars at room centers using HazardManager data
     */
    renderOxygenBars(ctx, ship) {
        this.oxygenBarsRenderer.render(ctx, ship, this.game.state.hazardManager);
    }

    renderShields(ctx) {
        this.shieldRenderer.render(ctx, this.game.state.ship,
            this.game.state.shieldManager, this.game.state.combatManager,
            this.offsetX, this.offsetY);
    }

    /**
     * Render engine thruster visual based on installed engine module
     * Futuristic design with hexagonal nozzle, plasma particles, and energy rings
     */
    renderEngineThruster(ctx, ship) {
        // Engine is at position (13, 20)
        const engineX = 13;
        const engineY = 20;

        // Check what engine module is installed
        const engineModuleId = ship.hardpoints?.engine;
        if (!engineModuleId) return;

        const engineModule = getModule(engineModuleId);
        if (!engineModule) return;

        const time = Date.now() / 1000;
        const tier = engineModule.tier;

        // Thruster dimensions scale with tier
        const widthMultiplier = 0.7 + (tier * 0.4);
        const heightMultiplier = 1.8 + (tier * 0.5);

        const thrusterWidth = this.tileSize * widthMultiplier;
        const thrusterHeight = this.tileSize * heightMultiplier;

        const centerX = engineX * this.tileSize + this.tileSize / 2;
        const startY = (engineY + 1) * this.tileSize;

        ctx.save();

        // === HEXAGONAL NOZZLE ===
        const hexRadius = thrusterWidth * 0.5;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            hexPoints.push({
                x: centerX + Math.cos(angle) * hexRadius,
                y: startY + Math.sin(angle) * hexRadius * 0.6
            });
        }

        const nozzleGradient = ctx.createLinearGradient(centerX, startY, centerX, startY + thrusterHeight);
        nozzleGradient.addColorStop(0, '#1a2a4a');
        nozzleGradient.addColorStop(0.5, '#0d1825');
        nozzleGradient.addColorStop(1, '#050a15');

        ctx.fillStyle = nozzleGradient;
        ctx.beginPath();
        ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
        for (let i = 1; i < 6; i++) ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
        ctx.closePath();
        const bottomScale = 1.4 + tier * 0.3;
        for (let i = 5; i >= 0; i--) {
            ctx.lineTo(centerX + (hexPoints[i].x - centerX) * bottomScale, startY + thrusterHeight);
        }
        ctx.fill();

        ctx.strokeStyle = '#3a5a8a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
        for (let i = 1; i < 6; i++) ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
        ctx.closePath();
        ctx.stroke();

        // === ENERGY RINGS ===
        const numRings = 3 + tier;
        for (let i = 0; i < numRings; i++) {
            const progress = ((time * 0.5 + i * 0.3) % 1.0);
            const ringY = startY + progress * thrusterHeight;
            const ringScale = 0.3 + progress * 0.7;
            const ringAlpha = (1 - progress) * 0.6;

            ctx.strokeStyle = `rgba(0, 200, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = `rgba(0, 200, 255, ${ringAlpha})`;
            ctx.shadowBlur = 8;

            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 3) * j - Math.PI / 2;
                const radius = hexRadius * ringScale * (1 + tier * 0.2);
                const x = centerX + Math.cos(angle) * radius;
                const y = ringY + Math.sin(angle) * radius * 0.6;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // === PLASMA CORE ===
        const pulse = Math.sin(time * 5) * 0.3 + 0.7;
        const coreIntensity = pulse * (0.6 + tier * 0.1);

        const coreGradient = ctx.createRadialGradient(
            centerX, startY + thrusterHeight * 0.65, 0,
            centerX, startY + thrusterHeight * 0.65, thrusterWidth * 0.5
        );
        coreGradient.addColorStop(0, `rgba(150, 220, 255, ${coreIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(80, 150, 255, ${coreIntensity * 0.8})`);
        coreGradient.addColorStop(0.6, `rgba(0, 100, 255, ${coreIntensity * 0.5})`);
        coreGradient.addColorStop(1, 'rgba(0, 50, 200, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, startY + thrusterHeight * 0.7, thrusterWidth * 0.45, thrusterHeight * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `rgba(80, 150, 255, ${coreIntensity * 0.8})`;
        ctx.shadowBlur = 20 + tier * 5;
        ctx.fillStyle = `rgba(0, 150, 255, ${coreIntensity * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(centerX, startY + thrusterHeight * 0.75, thrusterWidth * 0.6, thrusterHeight * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === PLASMA PARTICLES ===
        const numParticles = 15 + tier * 5;
        for (let i = 0; i < numParticles; i++) {
            const particleProgress = ((time * (1 + Math.sin(i)) + i * 0.1) % 1.0);
            const particleY = startY + thrusterHeight * (0.4 + particleProgress * 0.6);
            const spread = thrusterWidth * 0.3 * (1 - particleProgress);
            const particleX = centerX + (Math.sin(i * 2.5) * spread);
            const particleAlpha = (1 - particleProgress) * 0.7;
            const particleSize = (1 + tier * 0.3) * (1 - particleProgress * 0.5);

            ctx.fillStyle = `rgba(150, 200, 255, ${particleAlpha})`;
            ctx.shadowColor = `rgba(150, 200, 255, ${particleAlpha})`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // === STRUCTURAL VENTS ===
        ctx.strokeStyle = '#4a7aaa';
        ctx.lineWidth = 1.5;
        const numVents = 2 + Math.floor(tier / 2);
        for (let i = 0; i < numVents; i++) {
            const ventY = startY + (thrusterHeight / (numVents + 1)) * (i + 1);
            const ventWidth = hexRadius * (1 + (i / numVents) * 0.5);

            ctx.beginPath();
            ctx.moveTo(centerX - ventWidth, ventY);
            ctx.lineTo(centerX - ventWidth * 0.8, ventY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX + ventWidth, ventY);
            ctx.lineTo(centerX + ventWidth * 0.8, ventY);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
 * Render weapon turrets using delegated renderer
 */
    renderWeaponTurrets(ctx, ship) {
        this.weaponTurretsRenderer.render(ctx, ship);
    }

    /**
     * Render a distant Stanford Torus space station
     * Only renders if the current planet has a station
     */
    renderStation(ctx) {
        const currentPlanet = this.game.state.currentPlanet;
        if (!currentPlanet || !currentPlanet.hasStation) {
            return; // No station to render
        }

        ctx.save();

        // Position in upper right corner (moved left to avoid UI overlap)
        const stationX = ctx.canvas.width - 400;
        const stationY = 150;
        const time = Date.now() / 1000;

        // Stanford Torus dimensions
        const outerRadius = 100;
        const innerRadius = 60;
        const thickness = outerRadius - innerRadius;

        // Draw outer ring with gradient
        const outerGradient = ctx.createRadialGradient(
            stationX, stationY, innerRadius,
            stationX, stationY, outerRadius
        );
        outerGradient.addColorStop(0, '#2a2a3e');
        outerGradient.addColorStop(0.5, '#4a4a6e');
        outerGradient.addColorStop(1, '#1a1a2e');

        // Draw main torus ring
        ctx.strokeStyle = outerGradient;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.arc(stationX, stationY, (outerRadius + innerRadius) / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner shadow for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = thickness * 0.3;
        ctx.beginPath();
        ctx.arc(stationX, stationY, innerRadius + thickness * 0.15, 0, Math.PI * 2);
        ctx.stroke();

        // Draw structural spokes (connecting hub to ring)
        const numSpokes = 8;
        const hubRadius = 15;
        ctx.strokeStyle = '#556677';
        ctx.lineWidth = 2;
        for (let i = 0; i < numSpokes; i++) {
            const angle = (i / numSpokes) * Math.PI * 2;
            const x1 = stationX + Math.cos(angle) * hubRadius;
            const y1 = stationY + Math.sin(angle) * hubRadius;
            const x2 = stationX + Math.cos(angle) * innerRadius;
            const y2 = stationY + Math.sin(angle) * innerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Draw central hub
        const hubGradient = ctx.createRadialGradient(
            stationX, stationY, 0,
            stationX, stationY, hubRadius
        );
        hubGradient.addColorStop(0, '#5a5a7e');
        hubGradient.addColorStop(1, '#2a2a4e');

        ctx.fillStyle = hubGradient;
        ctx.beginPath();
        ctx.arc(stationX, stationY, hubRadius, 0, Math.PI * 2);
        ctx.fill();

        // Add detail lines on the ring (segments)
        const numSegments = 16;
        ctx.strokeStyle = '#667788';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
            const x1 = stationX + Math.cos(angle) * innerRadius;
            const y1 = stationY + Math.sin(angle) * innerRadius;
            const x2 = stationX + Math.cos(angle) * outerRadius;
            const y2 = stationY + Math.sin(angle) * outerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Add illuminated windows on the ring
        ctx.fillStyle = '#ffcc66';
        const numWindows = 40;
        for (let i = 0; i < numWindows; i++) {
            const angle = (i / numWindows) * Math.PI * 2;
            const windowRadius = (outerRadius + innerRadius) / 2;
            const windowX = stationX + Math.cos(angle) * windowRadius;
            const windowY = stationY + Math.sin(angle) * windowRadius;

            // Some windows blink
            const blink = Math.sin(time * 2 + i * 0.5) > 0.5 ? 1.0 : 0.4;
            ctx.globalAlpha = blink;

            ctx.beginPath();
            ctx.arc(windowX, windowY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Add navigation lights
        ctx.shadowBlur = 15;

        // Red light (port side - left)
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(stationX - outerRadius, stationY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Green light (starboard side - right)
        ctx.shadowColor = '#00ff00';
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(stationX + outerRadius, stationY, 4, 0, Math.PI * 2);
        ctx.fill();

        // White light (top)
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(stationX, stationY - outerRadius, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Add station name label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(currentPlanet.name + ' Station', stationX, stationY + outerRadius + 25);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}
