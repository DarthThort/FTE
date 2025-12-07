class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;

        this.state = new GameState();
        this.state.game = this; // Give GameState reference to game engine
        this.input = new InputHandler(canvas);
        this.sceneManager = new SceneManager(this);
        this.screenEffects = new ScreenEffects();
        this.damageNumbers = new DamageNumbers(this);
        this.combatEffects = new CombatEffects(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    stop() {
        this.isRunning = false;
    }

    loop(time) {
        if (!this.isRunning) return;

        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        this.sceneManager.update(dt);

        // Check for encounters during active FTL travel
        if (this.state.travelManager.isTraveling) {
            this.state.travelManager.updateTravel(dt);
        }

        // Update combat if active
        if (this.state.combatManager && this.state.combatManager.active) {
            this.state.combatManager.tick(dt);

            // Update combat buttons
            if (this.pauseButton) this.pauseButton.update();
            if (this.escapeButton) this.escapeButton.update();
        }

        // Update hazards (breaches, oxygen depletion) - but not when combat is paused
        if (this.state.hazardManager) {
            const combatPaused = this.state.combatManager && this.state.combatManager.active && this.state.combatManager.paused;
            if (!combatPaused) {
                this.state.hazardManager.update(dt);
            }
        }

        // Check for oxygen overlay toggle (O key)
        if (this.input.isDown('KeyO')) {
            if (!this.oxygenTogglePressed) {
                this.oxygenTogglePressed = true;
                if (this.state.hazardManager) {
                    this.state.hazardManager.toggleOxygenOverlay();
                }
            }
        } else {
            this.oxygenTogglePressed = false;
        }
        // Check for repair key (E key)
        if (this.input.isDown('KeyE')) {
            if (!this.repairKeyPressed && this.state.hazardUI) {
                this.repairKeyPressed = true;
                this.state.hazardUI.startPlayerRepair();
            }
        } else {
            this.repairKeyPressed = false;
        }

        // Check for crew assignment key (R key)  
        if (this.input.isDown('KeyR')) {
            if (!this.crewAssignKeyPressed && this.state.hazardUI) {
                this.crewAssignKeyPressed = true;
                this.state.hazardUI.toggleCrewMenu();
            }
        } else {
            this.crewAssignKeyPressed = false;
        }
        // Update screen effects





        // Update screen effects
        this.screenEffects.update(dt);

        // Update damage numbers
        this.damageNumbers.update(dt);

        // Update combat effects
        this.combatEffects.update(dt);
    }

    render() {
        // Clear canvas completely (transparent)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake offset
        const shake = this.screenEffects.getOffset();
        this.ctx.save();
        this.ctx.translate(shake.x, shake.y);

        this.sceneManager.render(this.ctx);

        this.ctx.restore();

        // Render CombatUI as overlay if combat is active (regardless of scene)
        if (this.state.combatManager && (this.state.combatManager.active || this.state.combatManager.victor)) {
            this.renderCombatUI();
        }

        // Render damage numbers
        this.damageNumbers.render();

        // Render combat effects (projectiles, particles, hit markers)
        this.combatEffects.render(this.ctx);
    }

    renderCombatUI() {
        // Create/update combat UI
        let combatUIContainer = document.getElementById('combat-ui-container');

        if (!combatUIContainer) {
            combatUIContainer = document.createElement('div');
            combatUIContainer.id = 'combat-ui-container';
            combatUIContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
            combatUIContainer.style.zIndex = '999998';
            combatUIContainer.style.position = 'relative';
            document.body.appendChild(combatUIContainer);
        }

        // Create CombatUI if not exists
        if (!this.combatUI) {
            this.combatUI = new CombatUI(this);
        }

        // Create EnemyShipOverlay if not exists
        if (!this.enemyOverlay) {
            this.enemyOverlay = new EnemyShipOverlay(this);
        }

        // Create CombatPauseButton if not exists
        if (!this.pauseButton) {
            this.pauseButton = new CombatPauseButton(this);
        }

        // Create CombatEscapeButton if not exists
        if (!this.escapeButton) {
            this.escapeButton = new CombatEscapeButton(this);
        }

        // Initialize with current combat manager
        if (this.state.combatManager && this.state.combatManager.active) {
            this.combatUI.initialize(this.state.combatManager);

            // Initialize enemy overlay
            this.enemyOverlay.initialize(this.state.combatManager.enemy);

            // Render both UIs
            combatUIContainer.innerHTML = this.combatUI.render() + this.enemyOverlay.render();
            this.combatUI.attachEventListeners();

            // Show pause and escape buttons
            this.pauseButton.show();
            this.escapeButton.show();
        } else if (this.state.combatManager && this.state.combatManager.victor) {
            // Hide pause and escape buttons when combat ends
            if (this.pauseButton) {
                this.pauseButton.hide();
            }
            if (this.escapeButton) {
                this.escapeButton.hide();
            }

            // Show victory/defeat screen (only render once)
            const existingResult = document.getElementById('combat-result');
            if (!existingResult) {
                const status = this.state.combatManager.getStatus();
                if (status.victor === 'player' || status.victor === 'player_escaped') {
                    combatUIContainer.innerHTML = this.combatUI.showVictoryScreen(status.rewards);
                } else {
                    combatUIContainer.innerHTML = this.combatUI.showDefeatScreen();
                }
                this.combatUI.attachEventListeners();
            }
        }
    }

    drawGrid() {
        const gridSize = 40;
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}
