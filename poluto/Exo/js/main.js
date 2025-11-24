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

        // World
        this.world = null;

        // Entities
        this.creatures = [];
        this.cadavers = [];

        // Time
        this.lastTime = 0;
        this.gameTime = 0;
        this.timeScale = 1.0;
        this.isPaused = false;

        // God powers
        this.selectedGodPower = null;

        // Input
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0 };

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

        // Generate world
        const worldWidth = 1600;
        const worldHeight = 1200;
        this.world = new WorldMap(worldWidth, worldHeight, 8, Date.now());

        // Center camera
        this.renderer.cameraX = 0;
        this.renderer.cameraY = 0;

        // Spawn initial creatures
        this.spawnInitialCreatures(20);

        console.log('Game initialized!');
        this.ui.logEvent('El mundo ha sido creado', 'event-birth');
        this.ui.logEvent('Las primeras formas de vida emergen...', 'event-birth');

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.resize(width, height);
    }

    spawnInitialCreatures(count) {
        const worldWidth = this.world.cols * this.world.tileSize;
        const worldHeight = this.world.rows * this.world.tileSize;

        for (let i = 0; i < count; i++) {
            let x, y, tile;
            let attempts = 0;

            // Find valid spawn location (not in water)
            do {
                x = Utils.randomRange(worldWidth * 0.2, worldWidth * 0.8);
                y = Utils.randomRange(worldHeight * 0.2, worldHeight * 0.8);
                tile = this.world.getTileAt(x, y);
                attempts++;
            } while ((!tile || tile.biome.includes('OCEAN')) && attempts < 50);

            const creature = new Creature(x, y);
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

        // Update world (biomass growth)
        this.world.update(deltaTime);

        // Update creatures
        const newBorns = [];
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];

            // Update creature
            creature.update(deltaTime, this.world, this.creatures);

            // AI decision making (every 0.5 seconds)
            if (this.gameTime % 0.5 < deltaTime) {
                const action = UtilityAI.decideAction(creature, this.world, this.creatures, this.cadavers);

                if (action) {
                    const result = action.execute(deltaTime, this.world, this.creatures);

                    // Check for birth from mating
                    if (result instanceof Creature) {
                        newBorns.push(result);
                    }
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
                this.cadavers.push(cadaver);
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

        // Population control (prevent lag)
        if (this.creatures.length > 200) {
            const toRemove = this.creatures.length - 200;
            // Remove oldest creatures
            this.creatures.sort((a, b) => b.age - a.age);
            this.creatures.splice(0, toRemove);
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

        // Render minimap
        this.renderer.renderMinimap(this.minimapCanvas, this.world, this.creatures);

        // Update UI
        this.ui.update({
            time: this.gameTime,
            creatures: this.creatures,
            cadavers: this.cadavers
        });
    }

    handleClick(e) {
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

        this.ui.selectCreature(closest);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
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
        const killCount = 0;

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
