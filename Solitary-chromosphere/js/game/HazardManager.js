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
     * Complete a breach repair (called by crew or player)
     */
    completeBreach(breachIndex) {
        const breach = this.breaches[breachIndex];
        if (!breach) return;

        console.log(`[HazardManager] Breach at (${breach.x}, ${breach.y}) repaired`);

        // Remove breach
        this.breaches.splice(breachIndex, 1);
    }

    /**
 * Create a fire at the specified location
 */
    createFire(x, y) {
        // Check if fire already exists at this tile
        if (this.fires.some(f => f.x === x && f.y === y)) return;
        // Check if tile is walkable
        const tile = this.state.ship.layout[y]?.[x];
        if (tile !== 2 && tile !== 3 && tile !== 7) return;
        const fire = {
            x,
            y,
            intensity: 1.0,  // 0.0 to 1.0
            spreadTimer: 5.0 + Math.random() * 3.0,  // 5-8 seconds (slow)
            damageTimer: 0,  // For damage tick
            animationOffset: Math.random() * Math.PI * 2 // Flame animation
        };
        this.fires.push(fire);
        console.log(`[HazardManager] Fire created at (${x}, ${y})`);
    }
    /**
     * Update all fires - handle spread, oxygen consumption, auto-extinguish
     */
    updateFires(dt) {
        for (let i = this.fires.length - 1; i >= 0; i--) {
            const fire = this.fires[i];
            // Get room oxygen level
            const roomId = this.getRoomIdAt(fire.x, fire.y);
            const oxygen = roomId !== -1 ? this.roomOxygen[roomId].level : 100;
            // Auto-extinguish in low oxygen
            if (oxygen < 10) {
                this.fires.splice(i, 1);
                console.log(`[HazardManager] Fire at (${fire.x}, ${fire.y}) extinguished (low oxygen)`);
                continue;
            }
            // Update spread timer
            fire.spreadTimer -= dt;
            if (fire.spreadTimer <= 0) {
                this.spreadFire(fire);
                fire.spreadTimer = 5.0 + Math.random() * 3.0; // Reset to 5-8 seconds
            }
            // Consume oxygen faster (5 O2/sec per fire)
            if (roomId !== -1 && this.roomOxygen[roomId]) {
                this.roomOxygen[roomId].level = Math.max(0, this.roomOxygen[roomId].level - dt * 5);
            }
            // Update damage timer
            fire.damageTimer += dt;
        }
    }
    /**
     * Attempt to spread fire to adjacent tiles
     */
    spreadFire(fire) {
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        for (const dir of directions) {
            const nx = fire.x + dir.dx;
            const ny = fire.y + dir.dy;
            // Check if tile is walkable and no fire exists
            const tile = this.state.ship.layout[ny]?.[nx];
            if ((tile === 2 || tile === 3 || tile === 7) &&
                !this.fires.some(f => f.x === nx && f.y === ny)) {
                // 20% chance to spread (slow)
                if (Math.random() < 0.20) {
                    this.createFire(nx, ny);
                }
            }
        }
    }
    /**
     * Extinguish a fire at the specified location
     */
    extinguishFire(x, y) {
        const index = this.fires.findIndex(f => f.x === x && f.y === y);
        if (index !== -1) {
            this.fires.splice(index, 1);
            console.log(`[HazardManager] Fire at (${x}, ${y}) extinguished`);
            return true;
        }
        return false;
    }


    /**
     * Update hazards (called each frame)
     */
    update(deltaTime) {
        this.updateOxygen(deltaTime);
        this.updateFires(deltaTime);  // Update fire spread and oxygen consumption
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

    // ============================================
    // TILE-BASED FIRE SYSTEM
    // ============================================

    /**
     * Start fire at a specific tile
     */
    startFireAt(x, y) {
        const layout = this.state.ship.layout;

        // Check if tile is valid and walkable
        if (!layout[y] || !layout[y][x]) return false;
        const tile = layout[y][x];
        if (tile !== 2 && tile !== 3) return false; // Only floor and system tiles

        // Check if fire already exists at this location
        if (this.fires.some(f => f.x === x && f.y === y)) return false;

        // Get room ID
        const roomId = this.getRoomIdAt(x, y);

        // Create fire
        this.fires.push({
            x,
            y,
            intensity: 20,
            age: 0,
            roomId,
            spreadTimer: 5.0 // 5 seconds until next spread attempt
        });

        console.log(`[Fire] Started at (${x}, ${y}) in room ${roomId}`);
        return true;
    }

    /**
     * Update all fires - intensity growth, spreading, oxygen consumption
     */
    updateFires(dt) {
        if (this.fires.length === 0) return;

        // Update each fire
        for (let i = this.fires.length - 1; i >= 0; i--) {
            const fire = this.fires[i];

            // Age the fire
            fire.age += dt;

            // Increase intensity over time (caps at 100)
            fire.intensity = Math.min(100, fire.intensity + 3 * dt);

            // Update spread timer
            fire.spreadTimer -= dt;
            if (fire.spreadTimer <= 0) {
                this.spreadFire(fire);
                fire.spreadTimer = 5.0; // Reset to 5 seconds
            }

            // Consume oxygen from the room (slow rate)
            if (fire.roomId !== -1 && this.roomOxygen[fire.roomId]) {
                const consumption = 0.05 * (fire.intensity / 100) * dt; // Reduced from 0.5 to 0.05
                this.roomOxygen[fire.roomId].level = Math.max(0, this.roomOxygen[fire.roomId].level - consumption);

                // Extinguish if oxygen too low
                if (this.roomOxygen[fire.roomId].level < 5) {
                    console.log(`[Fire] Auto-extinguished at (${fire.x}, ${fire.y}) - low oxygen`);
                    this.fires.splice(i, 1);
                }
            }
        }
    }

    /**
     * Attempt to spread fire to adjacent tiles
     */
    spreadFire(fire) {
        const layout = this.state.ship.layout;

        // Check all 4 adjacent tiles
        const adjacent = [
            { x: fire.x + 1, y: fire.y },
            { x: fire.x - 1, y: fire.y },
            { x: fire.x, y: fire.y + 1 },
            { x: fire.x, y: fire.y - 1 }
        ];

        for (const pos of adjacent) {
            // Check bounds
            if (!layout[pos.y] || !layout[pos.y][pos.x]) continue;

            const tile = layout[pos.y][pos.x];

            // DOOR DETECTION: If tile is a door (4 or 5), spread to tile BEYOND it
            if (tile === 4 || tile === 5) {
                // Calculate direction from fire to door
                const dx = pos.x - fire.x;
                const dy = pos.y - fire.y;

                // The tile beyond the door
                const beyondX = pos.x + dx;
                const beyondY = pos.y + dy;

                // Check if beyond tile exists and is walkable
                if (layout[beyondY] && layout[beyondY][beyondX]) {
                    const beyondTile = layout[beyondY][beyondX];

                    // Can spread to floor or systems beyond the door  
                    if ((beyondTile === 2 || beyondTile === 3) &&
                        !this.fires.some(f => f.x === beyondX && f.y === beyondY)) {

                        const spreadChance = 0.05 + (fire.intensity / 100) * 0.25;
                        if (Math.random() < spreadChance) {
                            this.startFireAt(beyondX, beyondY);
                            console.log(`[Fire] 🚪 Crossed door from (${fire.x}, ${fire.y}) to (${beyondX}, ${beyondY})`);
                        }
                    }
                }
                continue; // Don't burn the door itself
            }

            // Normal spread: Can spread to floor (2) and systems (3)
            if (tile !== 2 && tile !== 3) continue;

            // Check if already on fire
            if (this.fires.some(f => f.x === pos.x && f.y === pos.y)) continue;

            // Spread chance based on intensity (5% at low, 30% at high)
            const spreadChance = 0.05 + (fire.intensity / 100) * 0.25;

            if (Math.random() < spreadChance) {
                this.startFireAt(pos.x, pos.y);
            }
        }
    }

    /**
     * Extinguish fire at specific tile
     */
    extinguishFireAt(x, y) {
        const index = this.fires.findIndex(f => f.x === x && f.y === y);
        if (index === -1) return false;

        this.fires.splice(index, 1);
        console.log(`[Fire] Extinguished at (${x}, ${y})`);
        return true;
    }

    /**
     * Extinguish all fires in a room
     */
    extinguishAllFiresInRoom(roomId) {
        let count = 0;
        for (let i = this.fires.length - 1; i >= 0; i--) {
            if (this.fires[i].roomId === roomId) {
                this.fires.splice(i, 1);
                count++;
            }
        }
        console.log(`[Fire] Extinguished ${count} fires in room ${roomId}`);
        return count > 0;
    }

    /**
     * Get fire at specific tile
     */
    getFireAt(x, y) {
        return this.fires.find(f => f.x === x && f.y === y);
    }
}
