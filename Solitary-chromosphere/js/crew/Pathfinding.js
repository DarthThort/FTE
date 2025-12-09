/**
 * Pathfinding.js
 * A* pathfinding algorithm for crew navigation
 * Extracted from CrewManager.js for better organization
 */

class Pathfinding {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Find path from start to target using A* algorithm
     */
    findPath(startX, startY, targetX, targetY) {
        const openList = [];
        const closedList = new Set();

        const startNode = {
            x: startX,
            y: startY,
            g: 0,
            h: this.heuristic(startX, startY, targetX, targetY),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;

        openList.push(startNode);

        while (openList.length > 0) {
            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift();

            if (current.x === targetX && current.y === targetY) {
                return this.reconstructPath(current);
            }

            closedList.add(`${current.x},${current.y}`);

            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;

                if (closedList.has(key)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const g = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, targetX, targetY);
                const f = g + h;

                const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

                if (existingNode) {
                    if (g < existingNode.g) {
                        existingNode.g = g;
                        existingNode.f = f;
                        existingNode.parent = current;
                    }
                } else {
                    openList.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g: g,
                        h: h,
                        f: f,
                        parent: current
                    });
                }
            }
        }

        return [];
    }

    /**
     * Heuristic function for A* (Manhattan distance)
     */
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /**
     * Check if tile is walkable
     */
    isWalkable(x, y) {
        if (!this.state.ship.layout[y] || !this.state.ship.layout[y][x]) return false;

        const tile = this.state.ship.layout[y][x];
        // Walkable: Floor (2), Slot (3), Closed Door (4), Open Door (5)
        return tile === 2 || tile === 3 || tile === 4 || tile === 5;
    }

    /**
     * Reconstruct path from goal node to start
     */
    reconstructPath(node) {
        const path = [];
        let current = node;

        while (current.parent) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }

        return path;
    }

    /**
     * Smooth path to remove unnecessary waypoints
     */
    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothed = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];

            const dx1 = current.x - prev.x;
            const dy1 = current.y - prev.y;
            const dx2 = next.x - current.x;
            const dy2 = next.y - current.y;

            // Check if current tile is a door
            const isDoor = this.state.ship.layout[current.y][current.x] === 4;

            if ((dx1 !== dx2 || dy1 !== dy2) || isDoor) {
                smoothed.push(current);
            }
        }

        smoothed.push(path[path.length - 1]);

        return smoothed;
    }

    /**
     * Get a random walkable position on the ship
     */
    getRandomWalkablePosition() {
        const walkableTiles = [];
        for (let y = 0; y < this.state.ship.layout.length; y++) {
            for (let x = 0; x < this.state.ship.layout[y].length; x++) {
                if (this.isWalkable(x, y)) {
                    walkableTiles.push({ x, y });
                }
            }
        }

        if (walkableTiles.length > 0) {
            return walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
        }
        return null;
    }
}
