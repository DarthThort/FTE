/**
 * HazardManager.js
 * Manages ship hazards including breaches, fires, and room oxygen levels
 */

class HazardManager {
    constructor(gameState) {
        this.state = gameState;
        this.breaches = [];
        this.fires = [];
        this.roomOxygen = {};
        this.rooms = [];
        this.oxygenOverlayEnabled = true; // Enabled by default

        // Initialize room detection
        this.detectRooms();
    }

    /**
     * Detect rooms using flood fill algorithm
     * A room is a connected region of walkable tiles separated by walls/doors
     */
    detectRooms() {
        const layout = this.state.ship.layout;
        const visited = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
        this.rooms = [];
        let roomId = 0;

        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];

                // Start flood fill from walkable tiles (2, 3, 7)
                if (!visited[y][x] && (tile === 2 || tile === 3 || tile === 7)) {
                    const room = this.floodFillRoom(x, y, visited, roomId);
                    this.rooms.push(room);

                    // Initialize oxygen for this room
                    this.roomOxygen[roomId] = {
                        level: 100,
                        depleting: false,
                        connectedRooms: [],
                        tiles: room.tiles
                    };

                    roomId++;
                }
            }
        }

        console.log(`[HazardManager] Detected ${this.rooms.length} rooms`);

        // Detect room connections through doors
        this.detectRoomConnections();
    }

    /**
     * Flood fill to find all tiles in a room
     */
    floodFillRoom(startX, startY, visited, roomId) {
        const layout = this.state.ship.layout;
        const stack = [{ x: startX, y: startY }];
        const tiles = [];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            // Check bounds
            if (y < 0 || y >= layout.length || x < 0 || x >= layout[0].length) continue;
            if (visited[y][x]) continue;

            const tile = layout[y][x];

            // Only walkable tiles belong to rooms (not walls, doors, or outer space)
            if (tile !== 2 && tile !== 3 && tile !== 7) continue;

            visited[y][x] = true;
            tiles.push({ x, y, roomId });

            // Check 4 adjacent tiles
            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }

        return { id: roomId, tiles };
    }

    /**
     * Detect which rooms are connected through doors
     */
    detectRoomConnections() {
        const layout = this.state.ship.layout;

        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];

                // Check if this is a door (type 4 or 5)
                if (tile === 4 || tile === 5) {
                    // Find rooms on either side of the door
                    const adjacentRooms = new Set();

                    // Check all 4 adjacent tiles
                    const adjacent = [
                        { x: x + 1, y },
                        { x: x - 1, y },
                        { x, y: y + 1 },
                        { x, y: y - 1 }
                    ];

                    for (const pos of adjacent) {
                        const roomId = this.getRoomIdAt(pos.x, pos.y);
                        if (roomId !== -1) {
                            adjacentRooms.add(roomId);
                        }
                    }

                    // Connect the rooms
                    const roomArray = Array.from(adjacentRooms);
                    if (roomArray.length === 2) {
                        const [room1, room2] = roomArray;
                        if (!this.roomOxygen[room1].connectedRooms.includes(room2)) {
                            this.roomOxygen[room1].connectedRooms.push({ roomId: room2, doorX: x, doorY: y });
                        }
                        if (!this.roomOxygen[room2].connectedRooms.includes(room1)) {
                            this.roomOxygen[room2].connectedRooms.push({ roomId: room1, doorX: x, doorY: y });
                        }
                    }
                }
            }
        }
    }

    /**
     * Get room ID at a specific tile position
     */
    getRoomIdAt(x, y) {
        for (const room of this.rooms) {
            for (const tile of room.tiles) {
                if (tile.x === x && tile.y === y) {
                    return room.id;
                }
            }
        }
        return -1;
    }

    /**
     * Create a breach at the specified location
     */
    createBreach(x, y, severity = 1) {
        // Check if breach already exists at this location
        const existing = this.breaches.find(b => b.x === x && b.y === y);
        if (existing) {
            // Increase severity
            existing.severity = Math.min(3, existing.severity + 1);
            return;
        }

        const roomId = this.getRoomIdAt(x, y);
        if (roomId === -1) return; // Not in a room

        this.breaches.push({
            x,
            y,
            severity: Math.min(3, severity),
            roomId,
            repairProgress: 0,
            assignedCrew: null
        });

        // Start oxygen depletion in this room
        if (this.roomOxygen[roomId]) {
            this.roomOxygen[roomId].depleting = true;
        }

        console.log(`[HazardManager] Breach created at (${x}, ${y}) in room ${roomId}`);
    }

    /**
     * Update hazards (called each frame)
     */
    update(deltaTime) {
        this.updateOxygen(deltaTime);
        // Fire spread will be added in Phase 2
    }

    /**
     * Update oxygen levels in all rooms
     */
    updateOxygen(deltaTime) {
        // Deplete oxygen in breached rooms
        for (const breach of this.breaches) {
            const room = this.roomOxygen[breach.roomId];
            if (room && room.level > 0) {
                // 10% per second depletion
                room.level = Math.max(0, room.level - (10 * deltaTime));
            }
        }

        // Equalize oxygen between connected rooms (through open doors)
        const layout = this.state.ship.layout;
        for (const roomId in this.roomOxygen) {
            const room = this.roomOxygen[roomId];

            for (const connection of room.connectedRooms) {
                const doorTile = layout[connection.doorY][connection.doorX];

                // Only equalize if door is open (type 5)
                if (doorTile === 5) {
                    const otherRoom = this.roomOxygen[connection.roomId];
                    if (otherRoom) {
                        // Calculate average and move towards it
                        const diff = otherRoom.level - room.level;
                        const change = (diff / 2) * deltaTime; // Equalize over 2 seconds

                        room.level += change;
                        otherRoom.level -= change;

                        // Clamp to 0-100
                        room.level = Math.max(0, Math.min(100, room.level));
                        otherRoom.level = Math.max(0, Math.min(100, otherRoom.level));
                    }
                }
            }
        }
    }

    /**
     * Get oxygen level at a specific position
     */
    getOxygenAt(x, y) {
        const roomId = this.getRoomIdAt(x, y);
        if (roomId === -1) return 100; // Not in a room = normal oxygen
        return this.roomOxygen[roomId]?.level || 100;
    }

    /**
     * Start repairing a breach
     */
    repairBreach(breachId, crewMember) {
        if (breachId < 0 || breachId >= this.breaches.length) return false;

        const breach = this.breaches[breachId];
        breach.assignedCrew = crewMember;

        return true;
    }

    /**
     * Update breach repair progress
     */
    updateBreachRepair(breachId, deltaTime, engineeringSkill = 0) {
        if (breachId < 0 || breachId >= this.breaches.length) return;

        const breach = this.breaches[breachId];
        const repairTime = Math.max(2, 10 - engineeringSkill); // Min 2 seconds

        breach.repairProgress += deltaTime;

        if (breach.repairProgress >= repairTime) {
            // Repair complete
            this.removeBreach(breachId);
        }
    }

    /**
     * Remove a breach
     */
    removeBreach(breachId) {
        if (breachId < 0 || breachId >= this.breaches.length) return;

        const breach = this.breaches[breachId];
        const roomId = breach.roomId;

        this.breaches.splice(breachId, 1);

        // Check if room still has other breaches
        const hasOtherBreaches = this.breaches.some(b => b.roomId === roomId);
        if (!hasOtherBreaches && this.roomOxygen[roomId]) {
            this.roomOxygen[roomId].depleting = false;
        }

        console.log(`[HazardManager] Breach repaired in room ${roomId}`);
    }

    /**
     * Get breach at a specific position
     */
    getBreachAt(x, y) {
        const index = this.breaches.findIndex(b => b.x === x && b.y === y);
        if (index === -1) return null;
        return { breach: this.breaches[index], index };
    }

    /**
     * Toggle oxygen overlay
     */
    toggleOxygenOverlay() {
        this.oxygenOverlayEnabled = !this.oxygenOverlayEnabled;
        console.log(`[HazardManager] Oxygen overlay: ${this.oxygenOverlayEnabled ? 'ON' : 'OFF'}`);
    }
}
