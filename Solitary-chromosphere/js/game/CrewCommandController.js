/**
 * CrewCommandController.js
 * Tactical RTS style click & drag order system for commanding crew members to move or occupy consoles.
 * Single click opens crew dossier; Click & drag issues movement/assignment command.
 */
class CrewCommandController {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.selectedCrew = null;
        this.clickedCrew = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentMouseX = 0;
        this.currentMouseY = 0;

        this.initEventListeners();
    }

    initEventListeners() {
        const canvas = this.game.canvas;
        if (!canvas) return;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Right-click or Escape deselects
        canvas.addEventListener('contextmenu', (e) => {
            if (this.selectedCrew || this.clickedCrew) {
                e.preventDefault();
                this.selectedCrew = null;
                this.clickedCrew = null;
                this.isDragging = false;
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.selectedCrew = null;
                this.clickedCrew = null;
                this.isDragging = false;
            }
        });
    }

    getShipGridCoords(clientX, clientY) {
        const canvas = this.game.canvas;
        const renderer = this.game.sceneManager?.shipRenderer;
        if (!canvas || !renderer) return null;

        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const worldX = mouseX - renderer.offsetX;
        const worldY = mouseY - renderer.offsetY;

        const gridX = Math.floor(worldX / renderer.tileSize);
        const gridY = Math.floor(worldY / renderer.tileSize);

        return { gridX, gridY, mouseX, mouseY, worldX, worldY };
    }

    onMouseDown(e) {
        if (e.button !== 0) return; // Left-click only

        const coords = this.getShipGridCoords(e.clientX, e.clientY);
        if (!coords) return;

        const ship = this.game.state?.ship;
        if (!ship || !ship.crew) return;

        // Check if clicking directly on a crew member (within 24px threshold)
        const foundCrew = ship.crew.find(c => {
            const dx = coords.worldX - c.x;
            const dy = coords.worldY - c.y;
            return Math.hypot(dx, dy) <= 24;
        });

        if (foundCrew) {
            this.clickedCrew = foundCrew;
            this.isDragging = false;
            this.dragStartX = coords.mouseX;
            this.dragStartY = coords.mouseY;
        } else {
            this.clickedCrew = null;
            this.selectedCrew = null;
            this.isDragging = false;
        }
    }

    onMouseMove(e) {
        const coords = this.getShipGridCoords(e.clientX, e.clientY);
        if (coords) {
            this.currentMouseX = coords.mouseX;
            this.currentMouseY = coords.mouseY;

            if (this.clickedCrew) {
                const dragDist = Math.hypot(coords.mouseX - this.dragStartX, coords.mouseY - this.dragStartY);
                if (dragDist > 10) {
                    this.isDragging = true;
                    this.selectedCrew = this.clickedCrew;
                }
            }
        }
    }

    onMouseUp(e) {
        if (e.button !== 0) return;

        const coords = this.getShipGridCoords(e.clientX, e.clientY);

        if (this.isDragging && this.selectedCrew && coords) {
            // Drag & drop order completed -> issue movement/assignment command!
            this.issueCommand(this.selectedCrew, coords.gridX, coords.gridY);
        } else if (this.clickedCrew && !this.isDragging) {
            // Pure single click on crew member -> open dossier modal!
            console.log(`[CrewCommand] Single click on ${this.clickedCrew.name}. Opening dossier modal.`);
            if (this.game.ui && this.game.ui.showCrewDetail) {
                this.game.ui.showCrewDetail(this.clickedCrew.id);
            }
        }

        this.clickedCrew = null;
        this.selectedCrew = null;
        this.isDragging = false;
    }

    issueCommand(crew, gridX, gridY) {
        if (!crew) return;

        const state = this.game.state;
        const ship = state.ship;

        // Check if target tile is a system console
        const system = ship.systems.find(s => s.x === gridX && s.y === gridY);

        if (system) {
            // Assign crew to system console
            const result = state.assignCrewToSystem(crew.id, system.id);
            if (this.game.ui && this.game.ui.hud) {
                this.game.ui.hud.showNotification(`🎯 ${crew.name} asignado a la consola de ${system.name}`, 'success');
            }
        } else {
            // Check if target tile is walkable room space
            if (state.shipCoords && state.shipCoords.isWalkable(ship.layout, gridX, gridY)) {
                // Remove from previous system assignment if any
                const prevSystem = ship.systems.find(s => s.assignedCrew?.id === crew.id);
                if (prevSystem) {
                    prevSystem.assignedCrew = null;
                }

                crew.targetX = gridX * 32 + 16;
                crew.targetY = gridY * 32 + 16;
                crew.state = 'moving';
                crew.path = [];
                crew.wanderTimer = 0;

                state.saveGame();
                state.notify();

                if (this.game.ui && this.game.ui.hud) {
                    this.game.ui.hud.showNotification(`🚶 ${crew.name} enviado a la posición (${gridX}, ${gridY})`, 'info');
                }
            }
        }
    }

    renderTacticalOverlay(ctx) {
        if (!this.selectedCrew || !this.isDragging) return;

        const renderer = this.game.sceneManager?.shipRenderer;
        if (!renderer) return;

        const crew = this.selectedCrew;
        const crewScreenX = crew.x + renderer.offsetX;
        const crewScreenY = crew.y + renderer.offsetY;

        ctx.save();

        // 1. Draw glowing cyan selection ring around selected crew
        const time = Date.now() / 1000;
        const pulse = 14 + Math.sin(time * 8) * 2;

        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(crewScreenX, crewScreenY, pulse, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Draw tactical targeting vector line to mouse cursor
        if (this.currentMouseX && this.currentMouseY) {
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(crewScreenX, crewScreenY);
            ctx.lineTo(this.currentMouseX, this.currentMouseY);
            ctx.stroke();

            // 3. Draw targeting reticle at mouse grid tile
            const rect = this.game.canvas.getBoundingClientRect();
            const coords = this.getShipGridCoords(this.currentMouseX + rect.left, this.currentMouseY + rect.top);
            if (coords) {
                const tileScreenX = coords.gridX * 32 + renderer.offsetX;
                const tileScreenY = coords.gridY * 32 + renderer.offsetY;

                const isSystem = this.game.state?.ship?.systems.some(s => s.x === coords.gridX && s.y === coords.gridY);
                const color = isSystem ? '#00ff55' : '#00f0ff';

                ctx.setLineDash([]);
                ctx.strokeStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.strokeRect(tileScreenX, tileScreenY, 32, 32);

                // Draw Reticle Brackets [ ]
                ctx.fillStyle = color;
                ctx.font = '700 11px "Rajdhani", var(--font-tech, monospace)';
                ctx.textAlign = 'center';
                ctx.fillText(isSystem ? 'ASIGNAR CONSOLA' : 'ORDEN DE DESPLAZAMIENTO', tileScreenX + 16, tileScreenY - 4);
            }
        }

        ctx.restore();
    }
}
