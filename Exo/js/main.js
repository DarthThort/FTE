// =============================================================================
// MAIN.JS - Game Initialization and Main Loop
// =============================================================================

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.minimapCanvas = document.getElementById('minimap');

        // Core systems
        this.renderer = new Renderer(this.canvas);
        this.ui = new UIManager();
        this.ui.game = this; // Give UI reference to game
        this.dayNightCycle = new DayNightCycle();
        this.seasonalCycle = new SeasonalCycle();
        this.genealogy = new GenealogyTree(this);
        this.pathogenManager = new PathogenManager();
        this.statisticsManager = null; // Will be initialized with world

        // World
        this.world = null;

        // Entities
        this.creatures = [];
        this.cadavers = [];
        this.deadCreatures = []; // Track dead creatures for genealogy

        // Time
        this.lastTime = 0;
        this.gameTime = 0;
        this.timeScale = 1.0;
        this.isPaused = false;

        // God powers
        this.selectedGodPower = null;

        // Input
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0 };

        // Camera controls
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.cameraSpeed = 300; // pixels per second

        // Camera dragging
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.cameraStartX = 0;
        this.cameraStartY = 0;

        // Performance tracking para culling
        this.fpsHistory = [];
        this.currentFPS = 60;
        this.lastDeltaTime = 0;


        // Sistema de enfermedades ??
        this.pathogenManager = new PathogenManager();

        this.init();
    }

    init() {
        console.log('Initializing Exo-Génesis...');

        // Resize canvas to window
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Camera drag with mouse
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.cameraStartX = this.renderer.cameraX;
                this.cameraStartY = this.renderer.cameraY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isDragging = false;
                this.canvas.style.cursor = 'default';
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });

        // Camera controls - Keyboard
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                this.keys[key] = true;
            }
            // Panel toggles
            if (key === 'q') {
                this.ui.toggleWorldInfo();
            }
            if (key === 'e') {
                this.ui.toggleEvolutionPanel();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                this.keys[key] = false;
                e.preventDefault();
            }
        });

        // Camera controls - Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const zoomSpeed = 0.1;
            const delta = -Math.sign(e.deltaY);
            const newZoom = Utils.clamp(this.renderer.zoom + delta * zoomSpeed, 0.3, 3.0);

            // Zoom towards mouse position
            const mouseWorldX = this.mouse.worldX;
            const mouseWorldY = this.mouse.worldY;

            this.renderer.zoom = newZoom;
        }, { passive: false });

        // God power buttons
        document.getElementById('btn-rain').addEventListener('click', () => this.applyGlobalEffect('RAIN'));
        document.getElementById('btn-drought').addEventListener('click', () => this.applyGlobalEffect('DROUGHT'));
        document.getElementById('btn-heat').addEventListener('click', () => this.applyGlobalEffect('HEAT'));
        document.getElementById('btn-freeze').addEventListener('click', () => this.applyGlobalEffect('FREEZE'));
        document.getElementById('btn-meteor').addEventListener('click', () => this.selectedGodPower = 'METEOR');
        document.getElementById('btn-spawn').addEventListener('click', () => this.selectedGodPower = 'SPAWN');

        // Time controls
        document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-speed-1x').addEventListener('click', () => this.setTimeScale(1.0));
        document.getElementById('btn-speed-2x').addEventListener('click', () => this.setTimeScale(2.0));
        document.getElementById('btn-speed-5x').addEventListener('click', () => this.setTimeScale(5.0));

        // Setup Modal Controls
        const popSlider = document.getElementById('initial-pop');
        const popValue = document.getElementById('pop-value');
        popSlider.addEventListener('input', (e) => popValue.textContent = e.target.value);

        document.getElementById('btn-start-game').addEventListener('click', () => {
            const count = parseInt(popSlider.value);
            document.getElementById('setup-modal').style.display = 'none';
            this.spawnInitialCreatures(count, 'ARCHETYPE');
            this.isPaused = false;
            this.ui.logEvent(`Simulación iniciada con ${count} criaturas Arquetipo`, 'event-birth');
        });

        // Generate world
        const worldWidth = 1600;
        const worldHeight = 1200;
        this.world = new WorldMap(worldWidth, worldHeight, 8, Date.now());

        // Initialize statistics manager after world is created
        this.statisticsManager = new StatisticsManager(this.world);

        // Center camera
        this.renderer.cameraX = 0;
        this.renderer.cameraY = 0;

        // Start paused until user clicks start
        this.isPaused = true;

        console.log('Game initialized! Waiting for user setup...');

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.resize(width, height);
    }

    spawnInitialCreatures(count, mode = 'RANDOM') {
        const worldWidth = this.world.cols * this.world.tileSize;
        const worldHeight = this.world.rows * this.world.tileSize;

        for (let i = 0; i < count; i++) {
            let x, y, tile;
            let attempts = 0;

            // Find valid spawn location (land)
            do {
                x = Math.random() * worldWidth;
                y = Math.random() * worldHeight;
                tile = this.world.getTileAt(x, y);
                attempts++;
            } while (tile && tile.biome.includes('OCEAN') && attempts < 100);

            const dna = new DNA(null, mode);
            const creature = new Creature(x, y, dna);
            this.creatures.push(creature);
        }
    }



    gameLoop(currentTime) {
        requestAnimationFrame((time) => this.gameLoop(time));

        // Calculate delta time
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;

        if (!this.isPaused) {
            const scaledDeltaTime = deltaTime * this.timeScale;
            this.update(scaledDeltaTime);
        }

        this.render();
    }

    update(deltaTime) {
        this.gameTime += deltaTime;

        // Update camera position based on WASD keys
        const cameraMoveSpeed = this.cameraSpeed * deltaTime / this.renderer.zoom;

        if (this.keys.w) {
            this.renderer.cameraY -= cameraMoveSpeed;
        }
        if (this.keys.s) {
            this.renderer.cameraY += cameraMoveSpeed;
        }
        if (this.keys.a) {
            this.renderer.cameraX -= cameraMoveSpeed;
        }
        if (this.keys.d) {
            this.renderer.cameraX += cameraMoveSpeed;
        }

        // Clamp camera to world bounds
        const worldWidth = this.world.cols * this.world.tileSize;
        const worldHeight = this.world.rows * this.world.tileSize;
        this.renderer.cameraX = Utils.clamp(this.renderer.cameraX, 0, worldWidth);
        this.renderer.cameraY = Utils.clamp(this.renderer.cameraY, 0, worldHeight);

        // Update day/night cycle
        this.dayNightCycle.update(deltaTime);

        // Update seasonal cycle
        this.seasonalCycle.update(deltaTime);

        // Apply seasonal effects (every 10 seconds)
        if (Math.floor(this.gameTime) % 10 === 0 && Math.floor(this.gameTime - deltaTime) % 10 !== 0) {
            this.seasonalCycle.applyToWorld(this.world);
        }

        // Apply night vision effects
        if (this.dayNightCycle.isNight()) {
            this.dayNightCycle.applyToCreatures(this.creatures);
        } else {
            this.dayNightCycle.resetCreatureVision(this.creatures);
        }

        // Update world (biomass growth)
        this.world.update(deltaTime);


        // Sistema de pat�genos
        this.pathogenManager.update(deltaTime, this.world, this.creatures);

        // Update statistics manager
        if (this.statisticsManager) {
            const activePathogens = this.pathogenManager ? this.pathogenManager.activePathogens : [];
            this.statisticsManager.update(this.creatures, activePathogens);
        }

        // Sistema de enfermedades
        for (let creature of this.creatures) {
            DiseaseManager.updateInfection(creature, deltaTime);
        }
        DiseaseManager.propagateDiseases(this.creatures, deltaTime);
        DiseaseManager.propagateFromCadavers(this.creatures, this.cadavers);

        // Update statistics manager
        if (this.statisticsManager) {
            const activePathogens = this.pathogenManager ? this.pathogenManager.activePathogens : [];
            this.statisticsManager.update(this.creatures, activePathogens);
        }

        // Update creatures
        const newBorns = [];
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];

            // Update creature
            creature.update(deltaTime, this.world, this.creatures);

            // Apply Boids behavior (social creatures)
            BoidsBehavior.apply(creature, this.creatures, deltaTime);

            // AI decision making (every 0.5 seconds)
            // We use a timer on the creature or global time check
            // To avoid all creatures thinking at the exact same frame, we could randomize, but for now global is fine
            if (this.gameTime % 0.5 < deltaTime || !creature.currentAction) {
                const action = UtilityAI.decideAction(creature, this.world, this.creatures, this.cadavers);
                if (action) {
                    creature.currentAction = action;
                }
            }

            // Execute current action (EVERY FRAME)
            if (creature.currentAction) {
                const result = creature.currentAction.execute(deltaTime, this.world, this.creatures);

                // Check for birth from mating
                if (result instanceof Creature) {
                    newBorns.push(result);
                }
            }

            // Check for asexual reproduction
            if (creature.dna.getReproMode() === 'ASEXUAL' && creature.canReproduce()) {
                const child = creature.reproduceAsexual();
                if (child) {
                    newBorns.push(child);
                    this.ui.logEvent(`Criatura ${creature.id.substring(0, 6)} se ha reproducido asexualmente`, 'event-birth');
                }
            }

            // Remove dead creatures
            if (creature.isDead) {
                const cadaver = new Cadaver(creature);
                CadaverManager.initializeCadaver(cadaver, creature);
                this.cadavers.push(cadaver);

                // Store dead creature for genealogy (limit to last 200)
                this.deadCreatures.push(creature);
                if (this.deadCreatures.length > 200) {
                    this.deadCreatures.shift();
                }

                this.creatures.splice(i, 1);

                this.ui.logEvent(`Criatura murió: ${creature.causeOfDeath}`, 'event-death');

                // Check for extinction
                if (this.creatures.length === 0) {
                    this.ui.logEvent('¡EXTINCIÓN TOTAL! Generando nuevas formas de vida...', 'event-extinction');
                    this.spawnInitialCreatures(10);
                }
            }
        }

        // Add newborns
        this.creatures.push(...newBorns);
        if (newBorns.length > 0) {
            this.ui.logEvent(`${newBorns.length} nueva(s) criatura(s) nacieron`, 'event-birth');
        }

        // Update cadavers
        for (let i = this.cadavers.length - 1; i >= 0; i--) {
            this.cadavers[i].update(deltaTime);
            if (this.cadavers[i].isDecayed()) {
                this.cadavers.splice(i, 1);
            }
        }

        // Performance culling (válvula de seguridad técnica)
        this.performanceCulling(deltaTime);
    }

    performanceCulling(deltaTime) {
        // Calcular FPS promedio
        this.lastDeltaTime = deltaTime;
        this.currentFPS = 1 / deltaTime;
        this.fpsHistory.push(this.currentFPS);
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }

        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

        // Si FPS cae por debajo de 25, activar "naturaleza hostil"
        if (avgFPS < 25 && this.creatures.length > 50) {
            for (let creature of this.creatures) {
                const isOld = creature.age > creature.phenotype.maxLifespan * 0.8;
                const isWeak = creature.energy < 30;

                if (isOld || isWeak) {
                    // 10% de probabilidad de "muerte natural" por frame
                    if (Math.random() < 0.1) {
                        creature.die('natural_causes');
                    }
                }
            }
        }
    }

    render() {
        // Clear
        this.renderer.clear();

        // Render world
        this.renderer.renderWorld(this.world);

        // Render cadavers
        this.renderer.renderCadavers(this.cadavers);

        // Render creatures
        this.renderer.renderCreatures(this.creatures);

        // Render darkness overlay (night)
        const darkness = this.dayNightCycle.getDarkness();
        this.renderer.renderNightShader(darkness);

        // Render minimap
        this.renderer.renderMinimap(this.minimapCanvas, this.world, this.creatures);

        // Update UI
        this.ui.update({
            time: this.gameTime,
            creatures: this.creatures,
            cadavers: this.cadavers,
            dayNightCycle: this.dayNightCycle,
            seasonalCycle: this.seasonalCycle
        });
    }

    handleClick(e) {
        // Ignore click if we just finished dragging
        if (this.isDragging) {
            return;
        }

        // Check if there was significant mouse movement (drag vs click)
        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - this.dragStartX, 2) +
            Math.pow(e.clientY - this.dragStartY, 2)
        );

        if (dragDistance > 5) { // More than 5 pixels = drag, not click
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to world coordinates
        const worldX = (x / this.renderer.zoom) + this.renderer.cameraX;
        const worldY = (y / this.renderer.zoom) + this.renderer.cameraY;

        // God powers
        if (this.selectedGodPower) {
            if (this.selectedGodPower === 'SPAWN') {
                const creature = new Creature(worldX, worldY);
                this.creatures.push(creature);
                this.ui.logEvent('Criatura creada por intervención divina', 'event-birth');
            } else if (this.selectedGodPower === 'METEOR') {
                this.spawnMeteor(worldX, worldY);
            }
            this.selectedGodPower = null;
            return;
        }

        // Select creature
        let closest = null;
        let closestDist = Infinity;

        for (let creature of this.creatures) {
            const dist = Utils.distance(worldX, worldY, creature.x, creature.y);
            if (dist < creature.getVisualSize() + 10 && dist < closestDist) {
                closest = creature;
                closestDist = dist;
            }
        }

        if (closest) {
            this.ui.selectCreature(closest);
        } else {
            // Si no hay criatura, mostrar info del tile
            const tile = this.world.getTileAt(worldX, worldY);
            if (tile && tile.plantDNA) {
                this.ui.selectTile(tile);
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Update camera if dragging
        if (this.isDragging) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;

            // Move camera in opposite direction of drag (pan, not slide)
            this.renderer.cameraX = this.cameraStartX - deltaX / this.renderer.zoom;
            this.renderer.cameraY = this.cameraStartY - deltaY / this.renderer.zoom;

            // Clamp to world bounds
            const worldWidth = this.world.cols * this.world.tileSize;
            const worldHeight = this.world.rows * this.world.tileSize;
            this.renderer.cameraX = Utils.clamp(this.renderer.cameraX, 0, worldWidth);
            this.renderer.cameraY = Utils.clamp(this.renderer.cameraY, 0, worldHeight);
        }

        // Update world coordinates
        this.mouse.worldX = (this.mouse.x / this.renderer.zoom) + this.renderer.cameraX;
        this.mouse.worldY = (this.mouse.y / this.renderer.zoom) + this.renderer.cameraY;
    }

    applyGlobalEffect(effect) {
        switch (effect) {
            case 'RAIN':
                for (let row of this.world.tiles) {
                    for (let tile of row) {
                        tile.humidity = Math.min(1, tile.humidity + 0.2);
                        tile.biome = this.world.classifyBiome(tile);
                    }
                }
                this.ui.logEvent('Se desata una gran lluvia sobre el mundo', 'event-mutation');
                break;

            case 'DROUGHT':
                for (let row of this.world.tiles) {
                    for (let tile of row) {
                        tile.humidity = Math.max(0, tile.humidity - 0.3);
                        tile.biomass *= 0.5;
                        tile.biome = this.world.classifyBiome(tile);
                    }
                }
                this.ui.logEvent('Una terrible sequía arrasa el mundo', 'event-extinction');
                break;

            case 'HEAT':
                for (let row of this.world.tiles) {
                    for (let tile of row) {
                        tile.temperature = Math.min(1, tile.temperature + 0.15);
                        tile.biome = this.world.classifyBiome(tile);
                    }
                }
                this.ui.logEvent('El calor aumenta globalmente', 'event-mutation');
                break;

            case 'FREEZE':
                for (let row of this.world.tiles) {
                    for (let tile of row) {
                        tile.temperature = Math.max(0, tile.temperature - 0.15);
                        tile.biome = this.world.classifyBiome(tile);
                    }
                }
                this.ui.logEvent('Una era glacial comienza', 'event-extinction');
                break;
        }
    }

    spawnMeteor(x, y) {
        const radius = 100;

        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            const dist = Utils.distance(x, y, creature.x, creature.y);

            if (dist < radius) {
                creature.die('METEOR');
            }
        }

        // Destroy biomass
        const tileX = Math.floor(x / this.world.tileSize);
        const tileY = Math.floor(y / this.world.tileSize);
        const tileRadius = Math.floor(radius / this.world.tileSize);

        for (let dy = -tileRadius; dy <= tileRadius; dy++) {
            for (let dx = -tileRadius; dx <= tileRadius; dx++) {
                const tile = this.world.getTile(tileX + dx, tileY + dy);
                if (tile) {
                    tile.biomass = 0;
                }
            }
        }

        this.ui.logEvent('¡Un meteorito impacta la superficie!', 'event-extinction');
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-pause').textContent = this.isPaused ? '▶ Continuar' : '⏸ Pausar';
    }

    setTimeScale(scale) {
        this.timeScale = scale;

        // Update button states
        document.querySelectorAll('.time-btn').forEach(btn => {
            if (btn.id.includes('speed')) {
                btn.classList.remove('active');
            }
        });

        if (scale === 1.0) document.getElementById('btn-speed-1x').classList.add('active');
        if (scale === 2.0) document.getElementById('btn-speed-2x').classList.add('active');
        if (scale === 5.0) document.getElementById('btn-speed-5x').classList.add('active');
    }
}

// =============================================================================
// Start the game when page loads
// =============================================================================
window.addEventListener('load', () => {
    const game = new Game();

    // Expose to console for debugging
    window.game = game;
});
