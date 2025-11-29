class SceneManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentScene = 'PORT';
        this.shipRenderer = new ShipRenderer(gameEngine);
        this.player = new Player(gameEngine);
        this.hoveredCrew = null;
        this.tooltip = document.getElementById('crew-tooltip');
    }

    changeScene(sceneName) {
        console.log(`SceneManager: Switching to scene: ${sceneName}`);
        this.currentScene = sceneName;

        // Clear planet when entering ship view (for encounters to work)
        if (sceneName === 'SHIP') {
            this.game.state.currentPlanet = null;
            console.log('[SceneManager] Cleared currentPlanet for space travel');
        }

        if (this.game.ui) {
            this.game.ui.setMode(sceneName);
        }
    }

    update(dt) {
        if (this.currentScene === 'SHIP') {
            this.player.update(dt);
            this.game.state.updateCrewAI();

            // Update life support systems (O2, fire, etc.)
            if (this.game.state.lifeSupportManager) {
                this.game.state.lifeSupportManager.tick();
            }

            // Update weapon charging/cooldown
            if (this.game.state.weaponManager) {
                this.game.state.weaponManager.update(dt);
            }
            if (this.game.state.shieldManager) {
                this.game.state.shieldManager.update(dt);
            }

            this.shipRenderer.computeVisibility(this.player);
            this.handleCrewInteraction();
        } else if (this.currentScene === 'COMBAT') {
            // Combat scene update
            if (this.game.state.combatManager) {
                this.game.state.combatManager.tick(dt);
            }
        }
    }

    handleCrewInteraction() {
        const mouse = this.game.input.getMousePosition();
        const crewUnderMouse = this.getCrewAtPosition(mouse.x, mouse.y);

        if (crewUnderMouse) {
            this.hoveredCrew = crewUnderMouse;
            this.showCrewTooltip(crewUnderMouse, mouse.x, mouse.y);

            if (this.game.input.wasClicked()) {
                if (this.game.ui) {
                    this.game.ui.showCrewDetail(crewUnderMouse.id);
                }
            }
        } else {
            this.hoveredCrew = null;
            this.hideCrewTooltip();
        }
    }

    getCrewAtPosition(mouseX, mouseY) {
        const offsetX = this.shipRenderer.offsetX || 0;
        const offsetY = this.shipRenderer.offsetY || 0;

        const canvasX = mouseX - offsetX;
        const canvasY = mouseY - offsetY;

        for (const crew of this.game.state.ship.crew) {
            const dx = canvasX - crew.x;
            const dy = canvasY - crew.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 12) {
                return crew;
            }
        }

        return null;
    }

    showCrewTooltip(crew, mouseX, mouseY) {
        if (!this.tooltip) return;

        const primarySkill = this.game.state.getRolePrimarySkill(crew.role);
        const skillLevel = crew.skills[primarySkill]?.level || 1;

        const assignedSystem = this.game.state.ship.systems.find(s => s.assignedCrew?.id === crew.id);
        const assignment = assignedSystem ? assignedSystem.name : 'Unassigned';

        this.tooltip.innerHTML = `
            <div style="font-family: 'Rajdhani', sans-serif; color: var(--text);">
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--secondary); margin-bottom: 6px;">${crew.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px;">${crew.species} · ${crew.role}</div>
                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.7rem;">
                    <div>
                        <div style="color: var(--text-dim);">Health</div>
                        <div style="color: var(--success);">${crew.health}/${crew.maxHealth}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-dim);">Morale</div>
                        <div style="color: var(--warning);">${crew.morale}%</div>
                    </div>
                    <div>
                        <div style="color: var(--text-dim);">${primarySkill}</div>
                        <div style="color: var(--secondary);">Lv ${skillLevel}</div>
                    </div>
                </div>
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; color: var(--text-dim);">
                    ${assignment}
                </div>
                <div style="margin-top: 4px; font-size: 0.65rem; color: rgba(0,240,255,0.6); font-style: italic;">
                    Click to view details
                </div>
            </div>
        `;

        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (mouseX + 15) + 'px';
        this.tooltip.style.top = (mouseY + 15) + 'px';
    }

    hideCrewTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }

    render(ctx) {
        if (this.currentScene === 'SHIP') {
            this.shipRenderer.render(ctx);
            this.player.render(ctx);
        } else if (this.currentScene === 'PORT') {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (this.currentScene === 'COMBAT') {
            // Render ship (no player control during combat)
            this.shipRenderer.render(ctx);
            // Combat UI is rendered via UIManager
        }
    }
}
