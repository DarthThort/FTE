// ===================================================================
// FIRE SYSTEM - MANUAL COPY-PASTE FOR HazardManager.js
// ===================================================================

// STEP 1: ADD THESE METHODS AFTER LINE 193 (after completeBreach method)
// Insert right before the "update(deltaTime)" method at line 198

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

// ===================================================================
// STEP 2: MODIFY THE update() METHOD (currently at line 198-201)
// REPLACE line 200 which says "// Fire spread will be added in Phase 2"
// WITH:

this.updateFires(deltaTime);  // Update fire spread and oxygen consumption

// Final result should look like:
//
//    update(deltaTime) {
//        this.updateOxygen(deltaTime);
//        this.updateFires(deltaTime);  // Update fire spread and oxygen consumption
//    }
//
// ===================================================================
