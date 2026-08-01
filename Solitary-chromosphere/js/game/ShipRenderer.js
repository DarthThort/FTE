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
            /**
     * Initialize Three.js 3D WebGL renderer for the Stanford Torus space station
     */
    

        /**
     * Generate procedural metallic panel texture for 3D station hull
     */
    _generateStationHullTexture() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Base metallic plating background
        ctx.fillStyle = '#2c394b';
        ctx.fillRect(0, 0, c.width, c.height);

        // Panel seams grid
        ctx.strokeStyle = '#151d28';
        ctx.lineWidth = 3;
        const cols = 32;
        const rows = 16;
        const colW = c.width / cols;
        const rowH = c.height / rows;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                // Randomize panel shading for realistic armor plating
                if ((i + j) % 2 === 0) {
                    ctx.fillStyle = '#37475d';
                    ctx.fillRect(i * colW + 2, j * rowH + 2, colW - 4, rowH - 4);
                } else if ((i + j) % 5 === 0) {
                    ctx.fillStyle = '#202b3b';
                    ctx.fillRect(i * colW + 2, j * rowH + 2, colW - 4, rowH - 4);
                }

                ctx.strokeRect(i * colW, j * rowH, colW, rowH);
            }
        }

        // Panel rivet dots
        ctx.fillStyle = '#607490';
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * colW;
                const y = j * rowH;
                ctx.fillRect(x + 4, y + 4, 2, 2);
                ctx.fillRect(x + colW - 6, y + 4, 2, 2);
            }
        }

        // Illuminated Habitat Windows band (warm yellow + cyan)
        const winY1 = c.height * 0.38;
        const winY2 = c.height * 0.58;
        for (let i = 0; i < cols * 2; i++) {
            const wx = (i / (cols * 2)) * c.width + 4;
            ctx.fillStyle = i % 4 === 0 ? '#00f0ff' : '#ffe088';
            ctx.fillRect(wx, winY1, colW * 0.35, rowH * 0.45);
            ctx.fillRect(wx, winY2, colW * 0.35, rowH * 0.45);
        }

        return c;
    }

    /**
     * Initialize Three.js 3D WebGL renderer for the Stanford Torus space station
     */
    initStationThreeJS() {
        if (!window.THREE || this.station3D) return;

        try {
            const width = 450;
            const height = 400;

            const offscreen = document.createElement('canvas');
            offscreen.width = width;
            offscreen.height = height;

            const renderer = new THREE.WebGLRenderer({
                canvas: offscreen,
                alpha: true,
                antialias: true
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(1);
            if (THREE.ACESFilmicToneMapping) {
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.3;
            }

            const scene = new THREE.Scene();

            // Camera positioned further back to avoid clipping and fit perfectly
            const camera = new THREE.PerspectiveCamera(35, width / height, 1, 1000);
            camera.position.set(0, 120, 380);
            camera.lookAt(0, 0, 0);

            // Lighting (Directional Sunlight + Ambient + Point light)
            const sun = new THREE.DirectionalLight(0xffffff, 2.8);
            sun.position.set(-250, 200, 180);
            scene.add(sun);

            const ambient = new THREE.AmbientLight(0x28384e, 0.6);
            scene.add(ambient);

            const cyanGlow = new THREE.PointLight(0x00f0ff, 2.5, 180);
            cyanGlow.position.set(0, 25, 0);
            scene.add(cyanGlow);

            const stationGroup = new THREE.Group();
            stationGroup.rotation.x = Math.PI / 3.4; // Tilted angle matching reference photo
            stationGroup.rotation.z = -0.15;

            // Generate procedural hull texture
            const hullCanvas = this._generateStationHullTexture();
            const hullTex = new THREE.CanvasTexture(hullCanvas);
            hullTex.wrapS = THREE.RepeatWrapping;
            hullTex.wrapT = THREE.RepeatWrapping;
            hullTex.repeat.set(4, 1);

            // 1. Outer Habitat Torus Ring (Smaller radius: 68px)
            const torusGeo = new THREE.TorusGeometry(68, 12, 24, 64);
            const torusMat = new THREE.MeshStandardMaterial({
                map: hullTex,
                bumpMap: hullTex,
                bumpScale: 0.15,
                metalness: 0.8,
                roughness: 0.3
            });
            const torusRing = new THREE.Mesh(torusGeo, torusMat);
            stationGroup.add(torusRing);

            // 2. Inner Lattice Truss Ring
            const trussGeo = new THREE.TorusGeometry(46, 2.5, 12, 48);
            const trussMat = new THREE.MeshStandardMaterial({
                color: 0x788da6,
                metalness: 0.9,
                roughness: 0.2
            });
            const trussRing = new THREE.Mesh(trussGeo, trussMat);
            stationGroup.add(trussRing);

            // 3. Central Command Cylinder
            const hubGeo = new THREE.CylinderGeometry(15, 15, 36, 32);
            const hubMat = new THREE.MeshStandardMaterial({
                map: hullTex,
                metalness: 0.75,
                roughness: 0.35
            });
            const hub = new THREE.Mesh(hubGeo, hubMat);
            hub.rotation.x = Math.PI / 2;
            stationGroup.add(hub);

            // Hub Top Cap
            const capGeo = new THREE.CylinderGeometry(12, 15, 4, 32);
            const capMat = new THREE.MeshStandardMaterial({ color: 0x90a4bc, metalness: 0.9, roughness: 0.2 });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.rotation.x = Math.PI / 2;
            cap.position.z = 18;
            stationGroup.add(cap);

            // Docking Bay Glow Aperture
            const bayGeo = new THREE.CircleGeometry(6, 32);
            const bayMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
            const bay = new THREE.Mesh(bayGeo, bayMat);
            bay.position.z = 20.2;
            stationGroup.add(bay);

            // 4. Structural Spokes (Connecting hub to torus)
            const numSpokes = 4;
            const spokeMat = new THREE.MeshStandardMaterial({ color: 0x3a4859, metalness: 0.8, roughness: 0.3 });
            for (let i = 0; i < numSpokes; i++) {
                const angle = (i / numSpokes) * Math.PI * 2;
                const spoke = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 105, 16), spokeMat);
                spoke.rotation.z = angle + Math.PI / 2;
                stationGroup.add(spoke);
            }

            scene.add(stationGroup);

            this.station3D = {
                renderer,
                scene,
                camera,
                stationGroup,
                canvas: offscreen,
                width,
                height
            };
        } catch (e) {
            console.warn('[ShipRenderer] Failed to init 3D station renderer:', e);
        }
    }

    renderStation(ctx) {
        const currentPlanet = this.game.state.currentPlanet;
        if (!currentPlanet || !currentPlanet.hasStation) {
            return;
        }

        // Init 3D WebGL renderer if Three.js is available
        if (window.THREE && !this.station3D) {
            this.initStationThreeJS();
        }

        const stationX = ctx.canvas.width - 560;
        const stationY = 150;

        if (this.station3D) {
            // Render 3D WebGL scene offscreen
            this.station3D.stationGroup.rotation.z += 0.0025;
            this.station3D.renderer.render(this.station3D.scene, this.station3D.camera);

            // Draw WebGL canvas frame into 2D game canvas nicely scaled (no clipping)
            ctx.drawImage(
                this.station3D.canvas,
                stationX - 180,
                stationY - 140,
                360,
                300
            );
        }

        // Technical Station Label (Spanish)
        const labelY = stationY + 115;
        ctx.save();
        ctx.font = '700 13px var(--font-tech, monospace)';
        ctx.textAlign = 'center';

        const text = 'ESTACION ' + (currentPlanet && currentPlanet.name ? currentPlanet.name.toUpperCase() : 'ESPACIAL') + ' [OPERATIVA]';
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(stationX - textWidth / 2 - 12, labelY - 14, textWidth + 24, 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(text, stationX, labelY);

        ctx.restore();
    }
}
