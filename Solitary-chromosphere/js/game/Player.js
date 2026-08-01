class Player {
    constructor(gameEngine) {
        this.game = gameEngine;
        // Start position (13, 8)
        this.x = 13 * 32;
        this.y = 8 * 32;
        this.speed = 150; // Pixels per second
        this.size = 16;
        this.color = '#00f0ff';
        this.engineeringSkill = 0; // For breach repairs (upgradeable)
        this.facingAngle = Math.PI / 2; // Default facing down
        this.isMoving = false;
        this.id = 99999;
        this.name = 'Capitán';
        this.role = 'Captain';
        this.species = 'Humano';
    }

    update(dt) {
        // Don't allow movement if combat is paused
        if (this.game.state.combatManager && this.game.state.combatManager.paused) {
            return;
        }

        const input = this.game.input;
        let dx = 0;
        let dy = 0;

        if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;

        // Normalize vector & update movement facing angle
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            this.facingAngle = Math.atan2(dy, dx);
            this.isMoving = true;

            // Move
            const nextX = this.x + dx * this.speed * dt;
            const nextY = this.y + dy * this.speed * dt;

            // Collision Check (Check X and Y separately for sliding)
            if (this.checkCollision(nextX, this.y)) this.x = nextX;
            if (this.checkCollision(this.x, nextY)) this.y = nextY;
        } else {
            this.isMoving = false;
        }

        // Interaction Check
        this.checkInteraction();
    }

    checkInteraction() {
        const renderer = this.game.sceneManager.shipRenderer;
        if (!renderer) return;

        // Center of player
        const cx = this.x + this.size / 2;
        const cy = this.y + this.size / 2;

        const gridX = Math.floor(cx / renderer.tileSize);
        const gridY = Math.floor(cy / renderer.tileSize);

        // Helper to check a specific tile
        const checkTile = (gx, gy) => {
            // Check Systems
            const system = this.game.state.ship.systems.find(s => s.x === gx && s.y === gy);
            if (system) return { type: 'system', data: system, x: gx, y: gy };

            // Check Layout
            const layout = this.game.state.ship.layout;
            if (gy >= 0 && gy < layout.length && gx >= 0 && gx < layout[0].length) {
                const tile = layout[gy][gx];
                if (tile === 3) return { type: 'slot', x: gx, y: gy };
                if (tile === 4 || tile === 5) return { type: 'door', state: tile, x: gx, y: gy };
            }
            return null;
        };

        // 1. Check Current Tile (Priority)
        let target = checkTile(gridX, gridY);

        // 2. If nothing on current tile, check Neighbors
        if (!target) {
            const neighbors = [
                { x: 0, y: -1 }, // Up
                { x: 0, y: 1 },  // Down
                { x: -1, y: 0 }, // Left
                { x: 1, y: 0 }   // Right
            ];

            for (let offset of neighbors) {
                const neighborTarget = checkTile(gridX + offset.x, gridY + offset.y);
                if (neighborTarget) {
                    // Filter: Only allow Doors and Slots from neighbors. Systems require standing on them.
                    if (neighborTarget.type === 'door' || neighborTarget.type === 'slot') {
                        target = neighborTarget;
                        break;
                    }
                }
            }
        }

        if (target) {
            const promptText = target.type === 'system' ? `Presiona E para acceder a ${target.data.name}` :
                               target.type === 'slot' ? `Presiona E para instalar módulo` :
                               target.type === 'door' ? `Presiona E para ${target.state === 4 ? 'Abrir' : 'Cerrar'} puerta` : null;

            if (promptText && this.game.ui && this.game.ui.showInteractionPrompt) {
                this.game.ui.showInteractionPrompt(promptText);
            }

            if (this.game.input.isDown('KeyE')) {
                if (target.type === 'system' && !this.game.ui.isConsoleOpen) {
                    this.game.ui.renderSystemConsole(target.data);
                    this.game.input.keys['KeyE'] = false;
                } else if (target.type === 'slot' && !this.game.ui.isConsoleOpen) {
                    this.game.ui.renderInstallMenu(target.x, target.y);
                    this.game.input.keys['KeyE'] = false;
                } else if (target.type === 'door') {
                    this.game.state.toggleDoor(target.x, target.y);
                    this.game.input.keys['KeyE'] = false;
                }
            }
        } else {
            if (this.game.ui && this.game.ui.hideInteractionPrompt) {
                this.game.ui.hideInteractionPrompt();
            }
        }
    }

    checkCollision(x, y) {
        const renderer = this.game.sceneManager.shipRenderer;
        if (!renderer) return true;

        // Define bounding box corners
        const margin = 2;
        const points = [
            { x: x + margin, y: y + margin },
            { x: x + this.size - margin, y: y + margin },
            { x: x + margin, y: y + this.size - margin },
            { x: x + this.size - margin, y: y + this.size - margin }
        ];

        for (let p of points) {
            const gridX = Math.floor(p.x / renderer.tileSize);
            const gridY = Math.floor(p.y / renderer.tileSize);

            const layout = this.game.state.ship.layout;
            if (gridY < 0 || gridY >= layout.length || gridX < 0 || gridX >= layout[0].length) {
                return false;
            }

            const tile = layout[gridY][gridX];
            if (tile === 1 || tile === 0 || tile === 4) return false;
        }
        return true;
    }

    render(ctx) {
        const renderer = this.game.sceneManager.shipRenderer;
        if (!renderer) return;

        const drawX = this.x + renderer.offsetX + this.size / 2;
        const drawY = this.y + renderer.offsetY + this.size / 2;
        const time = Date.now() / 1000;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(this.facingAngle || 0);

        // Render Captain using CrewUIRenderer high-detail character engine
        if (renderer.crewUIRenderer) {
            renderer.crewUIRenderer.renderCharacter(ctx, this, time, true);
        }

        ctx.restore();

        // Captain Badge Overlay in screen space
        ctx.save();
        ctx.font = '700 9px "Rajdhani", var(--font-tech, monospace)';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(drawX - 22, drawY - 22, 44, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.fillText('CAPITÁN', drawX, drawY - 13);
        ctx.restore();
    }
}
