class LifeSupportManager {
    constructor(gameState) {
        this.state = gameState;
        this.lastUpdate = Date.now();
    }

    // Main Update Loop
    tick() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;

        this.updateOxygen(deltaTime);
        this.updateFire(deltaTime);

        // Update ionization in power manager
        if (this.state.powerManager) {
            this.state.powerManager.updateIonization(deltaTime);
        }
    }

    // Oxygen Management
    updateOxygen(dt) {
        if (!this.state.ship.rooms) return;

        const o2System = this.state.ship.systems.find(s => s.type === 'life_support' || s.id === 'bridge');

        this.state.ship.rooms.forEach(room => {
            if (room.breached) {
                // Breach vents O2 quickly
                room.oxygen = Math.max(0, room.oxygen - 15 * dt);
            } else if (room.onFire) {
                // Fire consumes O2
                const consumption = 3 * (room.fireIntensity / 100) * dt;
                room.oxygen = Math.max(0, room.oxygen - consumption);
            } else if (o2System && o2System.currentPower > 0) {
                // O2 system replenishes
                const regenRate = 5 * o2System.effectiveness;
                room.oxygen = Math.min(100, room.oxygen + regenRate * dt);
            }

            // Equalize O2 through open doors
            this.equalizeOxygen(room, dt);
        });
    }

    equalizeOxygen(room, dt) {
        if (!room.doors) return;

        Object.entries(room.doors).forEach(([neighborId, door]) => {
            if (!door.open) return;

            const neighbor = this.getRoom(neighborId);
            if (!neighbor) return;

            const diff = room.oxygen - neighbor.oxygen;
            const transfer = diff * 0.2 * dt; // 20% equalization per second

            room.oxygen -= transfer;
            neighbor.oxygen += transfer;
        });
    }

    // Fire Management
    updateFire(dt) {
        if (!this.state.ship.rooms) return;

        this.state.ship.rooms.forEach(room => {
            if (!room.onFire) return;

            // Fire intensity increases without crew intervention
            room.fireIntensity = Math.min(100, room.fireIntensity + 5 * dt);

            // Fire spreads to adjacent rooms through open doors
            if (Math.random() < 0.03 * dt) { // 3% chance per second
                this.attemptFireSpread(room);
            }

            // Fire damages systems in room
            this.damageSystemsInRoom(room, dt);

            // Check if fire should be extinguished
            if (room.oxygen < 5) {
                this.extinguishFire(room.id);
            }
        });
    }

    startFire(roomId) {
        const room = this.getRoom(roomId);
        if (!room || room.onFire) return false;

        room.onFire = true;
        room.fireIntensity = 20;

        this.state.notify();
        return true;
    }

    extinguishFire(roomId) {
        const room = this.getRoom(roomId);
        if (!room || !room.onFire) return false;

        room.onFire = false;
        room.fireIntensity = 0;

        this.state.notify();
        return true;
    }

    attemptFireSpread(room) {
        if (!room.doors) return;

        Object.entries(room.doors).forEach(([neighborId, door]) => {
            if (!door.open) return;

            const neighbor = this.getRoom(neighborId);
            if (!neighbor || neighbor.onFire) return;

            // Higher fire intensity = higher spread chance
            const spreadChance = (room.fireIntensity / 100) * 0.4;

            if (Math.random() < spreadChance) {
                this.startFire(neighborId);
            }
        });
    }

    damageSystemsInRoom(room, dt) {
        if (!room.tiles) return;

        // Find systems in this room
        const systemsInRoom = this.state.ship.systems.filter(sys =>
            room.tiles.some(tile => tile[0] === sys.x && tile[1] === sys.y)
        );

        systemsInRoom.forEach(sys => {
            // Damage scales with fire intensity
            const damage = (room.fireIntensity / 100) * 8 * dt; // Max 8 damage/sec at full intensity

            if (this.state.powerManager) {
                this.state.powerManager.damageSystem(sys.id, damage);
            }
        });
    }

    // Hull Breach Management
    createBreach(roomId) {
        const room = this.getRoom(roomId);
        if (!room || room.breached) return false;

        room.breached = true;
        this.state.notify();
        return true;
    }

    repairBreach(roomId) {
        const room = this.getRoom(roomId);
        if (!room || !room.breached) return false;

        room.breached = false;
        room.oxygen = Math.min(100, room.oxygen + 50); // Partially restore O2
        this.state.notify();
        return true;
    }

    // Door Control
    toggleDoor(doorId) {
        const door = this.getDoor(doorId);
        if (!door || door.locked) return false;

        door.open = !door.open;
        this.state.saveGame();
        this.state.notify();
        return true;
    }

    openDoor(doorId) {
        const door = this.getDoor(doorId);
        if (!door || door.locked) return false;

        door.open = true;
        this.state.saveGame();
        this.state.notify();
        return true;
    }

    closeDoor(doorId) {
        const door = this.getDoor(doorId);
        if (!door || door.locked) return false;

        door.open = false;
        this.state.saveGame();
        this.state.notify();
        return true;
    }

    openAllDoors() {
        if (!this.state.ship.doors) return;

        this.state.ship.doors.forEach(door => {
            if (!door.locked) {
                door.open = true;
            }
        });

        this.state.saveGame();
        this.state.notify();
    }

    closeAllDoors() {
        if (!this.state.ship.doors) return;

        this.state.ship.doors.forEach(door => {
            if (!door.locked) {
                door.open = false;
            }
        });

        this.state.saveGame();
        this.state.notify();
    }

    // Crew Actions
    assignCrewToFightFire(crewId, roomId) {
        // Placeholder for crew fighting fire
        // Will be implemented when crew actions are added
        const room = this.getRoom(roomId);
        if (!room || !room.onFire) return false;

        // Reduce fire intensity
        room.fireIntensity = Math.max(0, room.fireIntensity - 30);

        if (room.fireIntensity === 0) {
            this.extinguishFire(roomId);
        }

        return true;
    }

    assignCrewToRepair(crewId, roomId) {
        // Placeholder for crew repairing breach
        const room = this.getRoom(roomId);
        if (!room || !room.breached) return false;

        return this.repairBreach(roomId);
    }

    // Helpers
    getRoom(roomId) {
        if (!this.state.ship.rooms) return null;
        return this.state.ship.rooms.find(r => r.id === roomId);
    }

    getDoor(doorId) {
        if (!this.state.ship.doors) return null;
        return this.state.ship.doors.find(d => d.id === doorId);
    }

    getRoomByPosition(x, y) {
        if (!this.state.ship.rooms) return null;
        return this.state.ship.rooms.find(room =>
            room.tiles && room.tiles.some(tile => tile[0] === x && tile[1] === y)
        );
    }

    // Status Information
    getRoomStatus(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return null;

        return {
            id: room.id,
            oxygen: room.oxygen,
            onFire: room.onFire,
            fireIntensity: room.fireIntensity,
            breached: room.breached,
            critical: room.oxygen < 20 || room.fireIntensity > 70,
            emergencyVent: room.breached || room.oxygen < 5
        };
    }

    getShipLifeSupportStatus() {
        if (!this.state.ship.rooms) return null;

        const rooms = this.state.ship.rooms.map(r => this.getRoomStatus(r.id));
        const avgOxygen = rooms.reduce((sum, r) => sum + r.oxygen, 0) / rooms.length;
        const onFire = rooms.filter(r => r.onFire).length;
        const breached = rooms.filter(r => r.breached).length;

        return {
            averageOxygen: avgOxygen,
            roomsOnFire: onFire,
            roomsBreached: breached,
            critical: avgOxygen < 30 || onFire > 0 || breached > 0
        };
    }
}
