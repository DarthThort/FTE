class Player {
    constructor(gameEngine) {
        this.game = gameEngine;
        // Start position (Bridge)
        this.x = 8 * 32;
        this.y = 2 * 32;
        this.speed = 150; // Pixels per second
        this.size = 16;
        this.color = '#00f0ff';
    }

    update(dt) {
        const input = this.game.input;
        let dx = 0;
        let dy = 0;

        if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;

        // Normalize vector
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            // Move
            const nextX = this.x + dx * this.speed * dt;
            const nextY = this.y + dy * this.speed * dt;

            // Collision Check (Check X and Y separately for sliding)
            if (this.checkCollision(nextX, this.y)) this.x = nextX;
            if (this.checkCollision(this.x, nextY)) this.y = nextY;
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
            if (target.type === 'system') {
                this.game.ui.showInteractionPrompt(`Press E to access ${target.data.name}`);
                if (this.game.input.isDown('KeyE')) {
                    if (!this.game.ui.isConsoleOpen) {
                        this.game.ui.renderSystemConsole(target.data);
                        this.game.input.keys['KeyE'] = false;
                    }
                }
            } else if (target.type === 'slot') {
                this.game.ui.showInteractionPrompt(`Press E to Install Module`);
                if (this.game.input.isDown('KeyE')) {
                    if (!this.game.ui.isConsoleOpen) {
                        this.game.ui.renderInstallMenu(target.x, target.y);
                        this.game.input.keys['KeyE'] = false;
                    }
                }
            } else if (target.type === 'door') {
                this.game.ui.showInteractionPrompt(`Press E to ${target.state === 4 ? 'Open' : 'Close'} Door`);
                if (this.game.input.isDown('KeyE')) {
                    this.game.state.toggleDoor(target.x, target.y);
                    this.game.input.keys['KeyE'] = false;
                }
            }
        } else {
            this.game.ui.hideInteractionPrompt();
        }
    }

    checkCollision(x, y) {
        const renderer = this.game.sceneManager.shipRenderer;
        if (!renderer) return true;

        // Define bounding box corners (with a small margin to avoid getting stuck)
        const margin = 2;
        const points = [
            { x: x + margin, y: y + margin }, // Top-Left
            { x: x + this.size - margin, y: y + margin }, // Top-Right
            { x: x + margin, y: y + this.size - margin }, // Bottom-Left
            { x: x + this.size - margin, y: y + this.size - margin } // Bottom-Right
        ];

        for (let p of points) {
            const gridX = Math.floor(p.x / renderer.tileSize);
            const gridY = Math.floor(p.y / renderer.tileSize);

            // Check bounds
            const layout = this.game.state.ship.layout;
            if (gridY < 0 || gridY >= layout.length || gridX < 0 || gridX >= layout[0].length) {
                return false;
            }

            const tile = layout[gridY][gridX];
            // 0 = Void, 1 = Wall, 4 = Closed Door. Collision if tile is 0, 1 or 4.
            if (tile === 1 || tile === 0 || tile === 4) return false;
        }
        return true;
    }

    render(ctx) {
        const renderer = this.game.sceneManager.shipRenderer;
        const drawX = this.x + renderer.offsetX;
        const drawY = this.y + renderer.offsetY;

        // Draw Player
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(drawX + this.size / 2, drawY + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
