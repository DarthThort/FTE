/**
 * DamageCalculator.js
 * Handles all damage calculations, shield penetration, evasion, and effects
 * Extracted from CombatManager.js
 */

class DamageCalculator {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Apply weapon damage to target with all combat mechanics
     * @param {Object} weapon - Weapon firing
     * @param {Object} weaponModule - Module providing weapon stats
     * @param {Object} target - Ship being damaged
     * @param {Object} shooter - Ship firing weapon
     * @returns {Object} Damage result details
     */
    applyWeaponDamage(weapon, weaponModule, target, shooter) {
        const game = this.state?.game || window.game;
        const shieldDamage = weaponModule?.stats?.shieldDamage || weapon.damage || 10;
        const hullDamage = weaponModule?.stats?.hullDamage || weapon.damagePerShot || weapon.damage || 10;
        const penetration = weaponModule?.stats?.penetration || 0;
        const ionChance = weaponModule?.stats?.ionChance || 0;
        const burnDamage = weaponModule?.stats?.burnDamage || 0;
        const burnDuration = weaponModule?.stats?.burnDuration || 0;

        const result = {
            shieldDamageDealt: 0,
            hullDamageDealt: 0,
            evaded: false,
            breachCreated: false
        };

        // Check evasion (player ship)
        if (target === this.state.ship) {
            const engineModule = getModule(this.state.ship.hardpoints.engine);
            const evasionBonus = engineModule?.stats?.evasionBonus || 0;

            if (evasionBonus > 0 && Math.random() < evasionBonus) {
                console.log('[Combat] EVADED! Attack missed!');
                result.evaded = true;

                // Show evade message
                if (game?.damageNumbers && game?.canvas) {
                    const shipX = game.canvas.width / 2;
                    const shipY = game.canvas.height / 2;
                    game.damageNumbers.add(shipX, shipY - 30, 'EVADED!', '#00ff00');
                }
                return result;
            }

            // Shields
            if (this.state.shieldManager) {
                const effectiveShieldDamage = shieldDamage * (1 - penetration);
                const overflowDamage = this.state.shieldManager.takeDamage(effectiveShieldDamage);
                const absorbed = effectiveShieldDamage - overflowDamage;

                result.shieldDamageDealt = absorbed;

                // Show shield damage
                if (absorbed > 0 && game?.damageNumbers && game?.canvas) {
                    const shipX = game.canvas.width / 2;
                    const shipY = game.canvas.height / 2;
                    game.damageNumbers.add(shipX, shipY - 50, Math.round(absorbed), '#00f0ff');
                }

                // If shields absorbed all
                if (overflowDamage === 0 && penetration === 0) {
                    console.log(`[Combat] Shields absorbed all ${effectiveShieldDamage.toFixed(1)} damage`);
                    return result;
                }

                // Calculate total hull damage
                const totalHullDamage = overflowDamage + (hullDamage * penetration);
                if (totalHullDamage > 0) {
                    result.hullDamageDealt = totalHullDamage;
                    target.health = Math.max(0, target.health - totalHullDamage);

                    if (this.state.notify) this.state.notify();
                    console.log(`[Combat] Player Hull: ${target.health}/${target.maxHealth}`);

                    // Show hull damage
                    if (game?.damageNumbers && game?.canvas) {
                        const shipX = game.canvas.width / 2;
                        const shipY = game.canvas.height / 2;
                        game.damageNumbers.add(shipX, shipY, Math.round(totalHullDamage), '#ff0055');
                    }

                    // Breach creation (10% chance)
                    if (this.state.hazardManager && Math.random() < 0.10) {
                        this.createRandomBreach();
                        result.breachCreated = true;
                    }

                    // Fire creation (20% chance) - NEW from fire system
                    if (this.state.hazardManager && Math.random() < 0.20) {
                        this.createRandomFire();
                    }

                    // Burn effect
                    if (burnDamage > 0 && burnDuration > 0) {
                        console.log(`[Combat] Burn effect: ${burnDamage} damage over ${burnDuration}s`);
                    }
                }
            }
        }
        // Enemy damage
        else if (target.takeDamage) {
            const damageResult = target.takeDamage(shieldDamage, hullDamage, penetration);
            result.shieldDamageDealt = damageResult.shieldDamage || 0;
            result.hullDamageDealt = damageResult.hullDamage || 0;
            result.evaded = damageResult.evaded || false;

            // Show damage numbers for enemy
            if (damageResult.evaded) {
                console.log('[Combat] Enemy EVADED!');
                if (game?.damageNumbers) {
                    game.damageNumbers.add(405, 80, 'EVADED!', '#00ff00');
                }
            } else {
                if (damageResult.shieldDamage > 0 && game?.damageNumbers) {
                    game.damageNumbers.add(405, 50, Math.round(damageResult.shieldDamage), '#00f0ff');
                }
                if (damageResult.hullDamage > 0 && game?.damageNumbers) {
                    game.damageNumbers.add(405, 80, Math.round(damageResult.hullDamage), '#ff0055');
                }
            }
        }

        return result;
    }

    /**
     * Create random breach on ship
     */
    createRandomBreach() {
        const layout = this.state.ship.layout;
        const walkableTiles = [];

        for (let y = 1; y < layout.length - 1; y++) {
            for (let x = 1; x < layout[y].length - 1; x++) {
                if (layout[y][x] === 2 || layout[y][x] === 3 || layout[y][x] === 7) {
                    walkableTiles.push({ x, y });
                }
            }
        }

        if (walkableTiles.length > 0) {
            const tile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
            this.state.hazardManager.createBreach(tile.x, tile.y, 1);
        }
    }

    /**
     * Create random fire on ship
     */
    createRandomFire() {
        const layout = this.state.ship.layout;
        const walkableTiles = [];

        for (let y = 1; y < layout.length - 1; y++) {
            for (let x = 1; x < layout[y].length - 1; x++) {
                if (layout[y][x] === 2 || layout[y][x] === 3 || layout[y][x] === 7) {
                    walkableTiles.push({ x, y });
                }
            }
        }

        if (walkableTiles.length > 0) {
            const tile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
            this.state.hazardManager.createFire(tile.x, tile.y);
        }
    }
}
