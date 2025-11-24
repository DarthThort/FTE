updateCrewAI() {
    for (const crew of this.ship.crew) {
        if (crew.state === 'moving' && crew.targetX !== null && crew.targetY !== null) {
            // If no path or path is empty, calculate new path
            if (!crew.path || crew.path.length === 0) {
                const startX = Math.floor(crew.x / 32);
                const startY = Math.floor(crew.y / 32);
                const targetX = Math.floor(crew.targetX / 32);
                const targetY = Math.floor(crew.targetY / 32);

                crew.path = this.findPath(startX, startY, targetX, targetY);
            }

            // Follow the path
            if (crew.path && crew.path.length > 0) {
                const nextNode = crew.path[0];
                const nextX = nextNode.x * 32 + 16;
                const nextY = nextNode.y * 32 + 16;

                const dx = nextX - crew.x;
                const dy = nextY - crew.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 2) {
                    // Reached waypoint, remove from path
                    crew.path.shift();

                    // If path is empty, we reached destination
                    if (crew.path.length === 0) {
                        crew.x = crew.targetX;
                        crew.y = crew.targetY;
                        crew.state = 'working';
                        crew.targetX = null;
                        crew.targetY = null;
                    }
                } else {
                    // Move toward next waypoint
                    const moveX = (dx / distance) * crew.speed;
                    const moveY = (dy / distance) * crew.speed;
                    crew.x += moveX;
                    crew.y += moveY;
                }
            }
        }
    }
}

findPath(startX, startY, targetX, targetY) {
    // A* pathfinding
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
        // Find node with lowest f score
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();

        // Check if reached target
        if (current.x === targetX && current.y === targetY) {
            return this.reconstructPath(current);
        }

        closedList.add(`${current.x},${current.y}`);

        // Check neighbors
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const neighbor of neighbors) {
            const key = `${neighbor.x},${neighbor.y}`;

            if (closedList.has(key)) continue;

            // Check if walkable
            if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

            const g = current.g + 1;
            const h = this.heuristic(neighbor.x, neighbor.y, targetX, targetY);
            const f = g + h;

            // Check if already in open list
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

    // No path found, return empty array
    return [];
}

heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

isWalkable(x, y) {
    if (!this.ship.layout[y] || !this.ship.layout[y][x]) return false;

    const tile = this.ship.layout[y][x];
    // Walkable: Floor (2), Slot (3), Open Door (5)
    return tile === 2 || tile === 3 || tile === 5;
}

reconstructPath(node) {
    const path = [];
    let current = node;

    while (current.parent) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }

    return path;
}
}
