class CrewMember {
    constructor(data, gameState) {
        this.id = data.id;
        this.name = data.name;
        this.role = data.role;
        this.skill = data.skill;

        // Position (in grid coordinates, centered on tile)
        this.x = (data.x || 8) + 0.5;
        this.y = (data.y || 12) + 0.5; // Default to quarters
        this.targetX = null;
        this.targetY = null;
        this.path = []; // Waypoints to follow
        this.currentWaypoint = 0;

        // AI State
        this.state = 'idle'; // idle, wandering, moving, working
        this.stateTimer = 0;
        this.idleTimer = Math.random() * 5 + 3; // 3-8 seconds before wandering
        this.speed = 2.5; // tiles per second
        this.stuckTimer = 0;

        // Visual
        this.color = this.getRoleColor();

        this.gameState = gameState;
    }

    getRoleColor() {
        switch (this.role) {
            case 'Engineer': return '#ff9500';
            case 'Pilot': return '#00f0ff';
            case 'Gunner': return '#ff0055';
            case 'Doctor': return '#00ff55';
            case 'Navigator': return '#5500ff';
            case 'Scientist': return '#ffff00';
            case 'Security': return '#ff5500';
            case 'Comms': return '#00aaff';
            default: return '#ffffff';
        }
    }

    update(dt) {
        this.stateTimer += dt;

        switch (this.state) {
            case 'idle':
                this.updateIdle(dt);
                break;
            case 'wandering':
            case 'moving':
                this.updateMovement(dt);
                break;
            case 'working':
                // Just stay at station
                break;
        }
    }

    updateIdle(dt) {
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) {
            // Start wandering to recreation area
            this.setTarget(8.5, 4.5);
            this.state = 'wandering';
        }
    }

    updateMovement(dt) {
        if (this.path.length === 0) {
            // No path, become idle
            this.state = 'idle';
            this.idleTimer = Math.random() * 5 + 3;
            return;
        }

        // Get current waypoint
        const waypoint = this.path[this.currentWaypoint];
        const dx = waypoint.x - this.x;
        const dy = waypoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.3) {
            // Reached waypoint, move to next
            this.currentWaypoint++;

            if (this.currentWaypoint >= this.path.length) {
                // Reached final destination
                this.x = this.path[this.path.length - 1].x;
                this.y = this.path[this.path.length - 1].y;
                this.path = [];
                this.currentWaypoint = 0;
                this.stuckTimer = 0;

                if (this.state === 'wandering') {
                    this.state = 'idle';
                    this.idleTimer = Math.random() * 5 + 3;
                    setTimeout(() => {
                        if (this.state === 'idle') {
                            this.setTarget(8.5, 12.5);
                            this.state = 'wandering';
                        }
                    }, (Math.random() * 3 + 2) * 1000);
                } else if (this.state === 'moving') {
                    this.state = 'working';
                }
            }
        } else {
            // Move towards current waypoint
            const moveDistance = this.speed * dt;
            const ratio = Math.min(1, moveDistance / distance);

            const newX = this.x + dx * ratio;
            const newY = this.y + dy * ratio;

            // Simple movement towards waypoint
            this.x = newX;
            this.y = newY;

            // Try to open doors ahead
            this.tryOpenDoor();
        }
    }

    tryOpenDoor() {
        const layout = this.gameState.ship.layout;
        const gridX = Math.floor(this.x);
        const gridY = Math.floor(this.y);

        // Check adjacent tiles for closed doors
        const neighbors = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        for (const offset of neighbors) {
            const checkX = gridX + offset.x;
            const checkY = gridY + offset.y;

            if (checkY >= 0 && checkY < layout.length && checkX >= 0 && checkX < layout[0].length) {
                if (layout[checkY][checkX] === 4) {
                    this.gameState.toggleDoor(checkX, checkY);
                }
            }
        }
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;

        // Calculate path using A*
        const startX = Math.floor(this.x);
        const startY = Math.floor(this.y);
        const endX = Math.floor(x);
        const endY = Math.floor(y);

        this.path = this.findPath(startX, startY, endX, endY);
        this.currentWaypoint = 0;
        this.stuckTimer = 0;
    }

    findPath(startX, startY, endX, endY) {
        const layout = this.gameState.ship.layout;
        const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();

        while (openSet.length > 0) {
            // Find node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            // Reached goal?
            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(current);
            }

            closedSet.add(`${current.x},${current.y}`);

            // Check neighbors
            const neighbors = [
                { x: current.x, y: current.y - 1 }, // Up
                { x: current.x, y: current.y + 1 }, // Down
                { x: current.x - 1, y: current.y }, // Left
                { x: current.x + 1, y: current.y }  // Right
            ];

            for (const neighbor of neighbors) {
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const g = current.g + 1;
                const h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
                const f = g + h;

                const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (existingNode && existingNode.g <= g) continue;

                if (existingNode) {
                    existingNode.g = g;
                    existingNode.f = f;
                    existingNode.parent = current;
                } else {
                    openSet.push({ x: neighbor.x, y: neighbor.y, g, h, f, parent: current });
                }
            }
        }

        // No path found, return direct line
        return [{ x: endX + 0.5, y: endY + 0.5 }];
    }

    reconstructPath(node) {
        const path = [];
        let current = node;
        while (current) {
            path.unshift({ x: current.x + 0.5, y: current.y + 0.5 });
            current = current.parent;
        }
        return path;
    }

    isWalkable(x, y) {
        const layout = this.gameState.ship.layout;
        if (y < 0 || y >= layout.length || x < 0 || x >= layout[0].length) {
            return false;
        }
        const tile = layout[y][x];
        // 2=Floor, 3=Slot, 4=Door(Closed), 5=Door(Open)
        // Allow walking through closed doors (we'll open them)
        return tile === 2 || tile === 3 || tile === 4 || tile === 5;
    }

    assignToStation(systemX, systemY) {
        this.setTarget(systemX + 0.5, systemY + 0.5);
        this.state = 'moving';
    }

    unassign() {
        this.setTarget(8.5, 12.5);
        this.state = 'moving';
    }

    render(ctx, tileSize, cameraX, cameraY) {
        const screenX = (this.x - 0.5) * tileSize - cameraX;
        const screenY = (this.y - 0.5) * tileSize - cameraY;
        const radius = tileSize * 0.3;

        // Draw crew circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw name label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.split(' ')[0], screenX + tileSize / 2, screenY - 5);

        // Draw state indicator
        if (this.state === 'working') {
            ctx.fillStyle = '#00ff55';
            ctx.fillRect(screenX + tileSize / 2 - 3, screenY + tileSize - 8, 6, 3);
        }
    }
}
