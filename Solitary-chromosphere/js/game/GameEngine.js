class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;

        this.state = new GameState();
        this.input = new InputHandler();
        this.sceneManager = new SceneManager(this);

        // Setup click handler for crew members
        this.input.onCanvasClick((x, y) => this.handleCrewClick(x, y));

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

        // Update crew AI
        const crewMembers = this.state.crewMembers || [];
        for (const crew of crewMembers) {
            crew.update(dt);
        }
    }

    render() {
        // Clear screen
        this.ctx.fillStyle = '#05050a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.sceneManager.render(this.ctx);

        // Update crew tooltip if in ship scene
        if (this.sceneManager.currentScene === 'SHIP') {
            this.updateCrewTooltip();
        }
    }

    updateCrewTooltip() {
        const mousePos = this.input.getMousePosition();
        const crewMembers = this.state.crewMembers || [];
        const tooltip = document.getElementById('crew-tooltip');
        if (!tooltip) {
            console.warn('Tooltip element not found');
            return;
        }

        // Get canvas offset
        const canvasRect = this.canvas.getBoundingClientRect();
        const mouseCanvasX = mousePos.x - canvasRect.left;
        const mouseCanvasY = mousePos.y - canvasRect.top;

        // Check if hovering over any crew member
        let hoveredCrew = null;
        for (const crew of crewMembers) {
            const renderer = this.sceneManager.shipRenderer;
            if (!renderer) continue;

            const screenX = (crew.x - 0.5) * renderer.tileSize + renderer.offsetX;
            const screenY = (crew.y - 0.5) * renderer.tileSize + renderer.offsetY;
            const radius = renderer.tileSize * 0.3;

            const dx = mouseCanvasX - (screenX + renderer.tileSize / 2);
            const dy = mouseCanvasY - (screenY + renderer.tileSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                hoveredCrew = crew;
                console.log('Hovering over crew:', crew.name);
                break;
            }
        }

        if (hoveredCrew) {
            const crewData = this.state.ship.crew.find(c => c.id === hoveredCrew.id);
            if (!crewData) {
                console.warn('Crew data not found for id:', hoveredCrew.id);
                return;
            }

            const assignment = this.state.ship.systems.find(s => s.assignedCrew?.id === hoveredCrew.id);
            const primarySkill = this.state.getRolePrimarySkill(crewData.role);
            const primaryLevel = crewData.skills[primarySkill]?.level || crewData.skill;

            tooltip.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px; color: var(--secondary);">${crewData.name}</div>
                <div style="font-size: 0.75rem; margin-bottom: 5px; color: #aaa;">${crewData.role} • Lvl ${primaryLevel}</div>
                <div style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 3px; font-size: 0.7rem;">
                    <span>Health:</span>
                    <span style="color: var(--success);">${crewData.health}/${crewData.maxHealth}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 0.7rem;">
                    <span>Morale:</span>
                    <span style="color: ${crewData.morale > 70 ? 'var(--success)' : crewData.morale > 40 ? 'var(--warning)' : 'var(--danger)'};">${crewData.morale}/100</span>
                </div>
                ${assignment ? `<div style="margin-top: 5px; font-size: 0.7rem; color: var(--primary);">⚙️ ${assignment.name}</div>` : `<div style="margin-top: 5px; font-size: 0.7rem; color: var(--text-dim);">Idle</div>`}
            `;

            tooltip.style.display = 'block';
            tooltip.style.left = (mousePos.x + 15) + 'px';
            tooltip.style.top = (mousePos.y + 15) + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    }

    handleCrewClick(x, y) {
        // Only handle clicks in SHIP scene
        if (this.sceneManager.currentScene !== 'SHIP') return;

        const canvasRect = this.canvas.getBoundingClientRect();
        const mouseCanvasX = x - canvasRect.left;
        const mouseCanvasY = y - canvasRect.top;

        const crewMembers = this.state.crewMembers || [];
        for (const crew of crewMembers) {
            const renderer = this.sceneManager.shipRenderer;
            if (!renderer) continue;

            const screenX = (crew.x - 0.5) * renderer.tileSize + renderer.offsetX;
            const screenY = (crew.y - 0.5) * renderer.tileSize + renderer.offsetY;
            const radius = renderer.tileSize * 0.3;

            const dx = mouseCanvasX - (screenX + renderer.tileSize / 2);
            const dy = mouseCanvasY - (screenY + renderer.tileSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                // Clicked on this crew member!
                if (window.uiManager) {
                    window.uiManager.showCrewDetail(crew.id);
                }
                break;
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
