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
    }

    render() {
        this.ctx.fillStyle = '#05050a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.sceneManager.render(this.ctx);

        // Render CombatUI as overlay if combat is active (regardless of scene)
        if (this.state.combatManager && (this.state.combatManager.active || this.state.combatManager.victor)) {
            this.renderCombatUI();
        }
    }

    renderCombatUI() {
        // Create/update combat UI
        let combatUIContainer = document.getElementById('combat-ui-container');

        if (!combatUIContainer) {
            combatUIContainer = document.createElement('div');
            combatUIContainer.id = 'combat-ui-container';
            document.body.appendChild(combatUIContainer);
        }

        // Create CombatUI if not exists
        if (!this.combatUI) {
            this.combatUI = new CombatUI(this);
        }

        // Initialize with current combat manager
        if (this.state.combatManager && this.state.combatManager.active) {
            this.combatUI.initialize(this.state.combatManager);
            combatUIContainer.innerHTML = this.combatUI.render();
            this.combatUI.attachEventListeners();
        } else if (this.state.combatManager && this.state.combatManager.victor) {
            // Show victory/defeat screen
            const status = this.state.combatManager.getStatus();
            if (status.victor === 'player') {
                combatUIContainer.innerHTML = this.combatUI.showVictoryScreen(status.rewards);
            } else {
                combatUIContainer.innerHTML = this.combatUI.showDefeatScreen();
            }
            this.combatUI.attachEventListeners();
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
