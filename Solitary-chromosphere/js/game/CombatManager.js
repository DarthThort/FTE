/**
 * CombatManager - Core combat orchestration system
 * 
 * Manages real-time pausable combat between player and enemy ships
 * Handles weapon systems, targeting, AI, and combat resolution
 */

class CombatManager {
    constructor(gameState, enemyShip) {
        this.state = gameState;
        this.enemy = enemyShip;

        // Combat state
        this.active = false;
        this.paused = false;
        this.started = false;

        // Targeting
        this.playerTarget = null; // Enemy system being targeted
        this.enemyTarget = null; // Player system being targeted

        // AI
        this.aiDecisionCooldown = 0;
        this.aiDecisionInterval = 2.0; // AI makes decisions every 2 seconds

        // Combat results
        this.victor = null;
        this.rewards = null;
    }

    /**
     * Start combat
     */
    start() {
        this.active = true;
        this.started = true;
        this.paused = false;

        console.log(`Combat started: ${this.state.ship.name} vs ${this.enemy.name}`);

        // Auto-charge all player weapons (if available)
        if (this.state.ship.weapons && this.state.ship.weapons.length > 0) {
            this.state.ship.weapons.forEach(weapon => {
                if (weapon.state === 'idle') {
                    this.state.weaponManager.chargeWeapon(weapon.id);
                }
            });
            console.log(`[Combat] Charging ${this.state.ship.weapons.length} player weapons`);
        } else {
            console.warn('[Combat] No player weapons available');
        }

        // Auto-charge all enemy weapons
        if (this.enemy.weapons && this.enemy.weapons.length > 0) {
            this.enemy.weapons.forEach(weapon => {
                if (weapon.state === 'idle') {
                    this.enemy.chargeWeapon(weapon.id);
                }
            });
        } else {
            console.warn('[Combat] No enemy weapons available');
        }
    }

    /**
     * Pause/resume combat
     */
    togglePause() {
        this.paused = !this.paused;
        return this.paused;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    /**
     * Main combat tick
     */
    tick(dt) {
        if (!this.active || this.paused) return;

        // Update weapons
        this.state.weaponManager.update(dt);
        this.enemy.tickWeapons(dt);

        // Update enemy AI
        this.tickEnemyAI(dt);

        // Auto-fire ready weapons
        this.autoFireWeapons();

        // Check for combat end
        if (this.checkCombatEnd()) {
            this.endCombat();
        }
    }

    /**
     * Enemy AI tick
     */
    tickEnemyAI(dt) {
        this.aiDecisionCooldown -= dt;

        if (this.aiDecisionCooldown <= 0) {
            this.aiDecisionCooldown = this.aiDecisionInterval;
            this.makeAIDecision();
        }
    }

    /**
     * AI decision making
     */
    makeAIDecision() {
        // Update AI state based on situation
        this.enemy.updateAIState(this.state.ship);

        // Check for flee/surrender
        if (this.enemy.aiState === 'fleeing') {
            this.attemptEnemyFlee();
            return;
        }

        if (this.enemy.aiState === 'surrendering') {
            this.enemySurrender();
            return;
        }

        // Select target
        this.selectEnemyTarget();

        // Charge idle weapons
        this.enemy.weapons.forEach(weapon => {
            if (weapon.state === 'idle') {
                this.enemy.chargeWeapon(weapon.id);
            }
        });
    }

    /**
     * Enemy selects target
     */
    selectEnemyTarget() {
        const playerSystems = this.state.ship.systems.filter(s => !s.offline);

        if (playerSystems.length === 0) {
            this.enemyTarget = null;
            return;
        }

        // AI targeting strategy based on state
        if (this.enemy.aiState === 'aggressive') {
            // Target weapons or shields
            const priorityTargets = playerSystems.filter(s =>
                s.type === 'weapon' || s.type === 'shield'
            );

            if (priorityTargets.length > 0) {
                this.enemyTarget = priorityTargets[Math.floor(Math.random() * priorityTargets.length)];
            } else {
                this.enemyTarget = playerSystems[Math.floor(Math.random() * playerSystems.length)];
            }
        } else if (this.enemy.aiState === 'defensive') {
            // Target engines to prevent chase
            const engines = playerSystems.find(s => s.type === 'engine');
            if (engines) {
                this.enemyTarget = engines;
            } else {
                this.enemyTarget = playerSystems[Math.floor(Math.random() * playerSystems.length)];
            }
        } else {
            // Random targeting
            this.enemyTarget = playerSystems[Math.floor(Math.random() * playerSystems.length)];
        }
    }

    /**
     * Auto-fire ready weapons
     */
    /**
     * Auto-fire all ready weapons
     */
    autoFireWeapons() {
        // Player weapons - only auto-fire if crew assigned
        if (this.state.ship.weapons && this.state.ship.weapons.length > 0) {
            this.state.ship.weapons.forEach(weapon => {
                if (weapon.state === 'ready' && weapon.autofire) {
                    // Only fire if autofire is enabled (crew assigned)
                    const fired = this.state.weaponManager.fireWeapon(weapon.id, this.enemy);
                    if (fired) {
                        // Apply damage to enemy
                        this.applyWeaponDamage(weapon, this.enemy);
                        console.log(`[Auto-Fire] ${weapon.name} fired automatically (crew assigned)`);
                    }
                }
                // If no crew (autofire = false), require manual click
            });
        }

        // Enemy weapons - always auto-fire
        if (this.enemy.weapons && this.enemy.weapons.length > 0) {
            this.enemy.weapons.forEach(weapon => {
                if (weapon.state === 'ready') {
                    // Add visual effects for enemy firing
                    if (this.state.game && this.state.game.combatEffects) {
                        const enemyX = 405;  // Enemy overlay position
                        const enemyY = 80;
                        const playerX = this.state.game.canvas.width / 2;
                        const playerY = this.state.game.canvas.height / 2;

                        // Red projectile from enemy to player
                        this.state.game.combatEffects.addProjectile(enemyX, enemyY, playerX, playerY, '#ff0055');
                        this.state.game.combatEffects.playLaserSound();
                    }

                    // Fire at player
                    this.applyWeaponDamage(weapon, this.state.ship);

                    // Enemy weapons return to idle immediately (no cooldown)
                    weapon.state = 'idle';
                    weapon.currentCharge = 0;
                    // Auto-recharge
                    this.enemy.chargeWeapon(weapon.id);
                }
            });
        }
    }

    /**
     * Apply weapon damage to target
     */
    applyWeaponDamage(weapon, target) {
        // Get weapon module stats if available
        let weaponModule = null;
        if (weapon.moduleId) {
            weaponModule = getModule(weapon.moduleId);
        }

        for (let i = 0; i < weapon.shots; i++) {
            // Use module stats if available, otherwise fallback to weapon.damage
            const shieldDamage = weaponModule?.stats?.shieldDamage || weapon.damagePerShot || weapon.damage || 10;
            const hullDamage = weaponModule?.stats?.hullDamage || weapon.damagePerShot || weapon.damage || 10;

            // Special effects from module
            const penetration = weaponModule?.stats?.penetration || 0;
            const ionChance = weaponModule?.stats?.ionChance || 0;
            const burnDamage = weaponModule?.stats?.burnDamage || 0;
            const burnDuration = weaponModule?.stats?.burnDuration || 0;

            // Check if shields block (for player ship)
            if (target === this.state.ship && this.state.shieldManager) {
                // PHASE 10: Check evasion BEFORE applying any damage
                const engineModule = getModule(this.state.ship.hardpoints.engine);
                const evasionBonus = engineModule?.stats?.evasionBonus || 0;

                // Roll for evasion (only once per shot, not per weapon fire)
                if (evasionBonus > 0 && i === 0 && Math.random() < evasionBonus) {
                    console.log('[Combat] EVADED! Attack missed!');

                    // Show evade message
                    if (this.state.game && this.state.game.damageNumbers) {
                        const shipX = this.state.game.canvas.width / 2;
                        const shipY = this.state.game.canvas.height / 2;
                        this.state.game.damageNumbers.add(shipX, shipY - 30, 'EVADED!', '#00ff00');
                    }
                    return; // Skip all damage from this weapon
                }

                // Calculate damage to shields (may be reduced by penetration)
                const effectiveShieldDamage = shieldDamage * (1 - penetration);
                const overflowDamage = this.state.shieldManager.takeDamage(effectiveShieldDamage);

                // Show shield damage number (Blue/Cyan)
                if (this.state.game && this.state.game.damageNumbers) {
                    const shipX = this.state.game.canvas.width / 2;
                    const shipY = this.state.game.canvas.height / 2;
                    const absorbed = effectiveShieldDamage - overflowDamage;
                    if (absorbed > 0) {
                        this.state.game.damageNumbers.add(shipX, shipY - 50, Math.round(absorbed), '#00f0ff');
                    }
                }

                // If shields absorbed all damage
                if (overflowDamage === 0 && penetration === 0) {
                    console.log(`[Combat] Shields absorbed all ${effectiveShieldDamage.toFixed(1)} shield damage`);
                    continue;
                }

                // Calculate hull damage (overflow from shields + penetration bonus + base hull damage)
                const totalHullDamage = overflowDamage + (hullDamage * penetration);

                if (totalHullDamage > 0) {
                    console.log(`[Combat] ${totalHullDamage.toFixed(1)} damage to hull (${overflowDamage.toFixed(1)} overflow + ${(hullDamage * penetration).toFixed(1)} penetration)`);
                    target.health = Math.max(0, target.health - totalHullDamage);

                    // Notify state change to update HUD
                    if (this.state.notify) this.state.notify();
                    console.log(`[Combat] Player Hull: ${target.health}/${target.maxHealth}`);

                    // Show hull damage number (Red)
                    if (this.state.game && this.state.game.damageNumbers) {
                        const shipX = this.state.game.canvas.width / 2;
                        const shipY = this.state.game.canvas.height / 2;
                        this.state.game.damageNumbers.add(shipX, shipY, Math.round(totalHullDamage), '#ff0055');
                    }

                    // Apply burn effect if weapon has it
                    if (burnDamage > 0 && burnDuration > 0) {
                        // TODO: Implement burn effect tracking
                        console.log(`[Combat] Burn effect applied: ${burnDamage} damage over ${burnDuration}s`);
                    }
                }
                continue;
            }

            // Apply damage to enemy (enemy has shields too)
            if (target === this.enemy) {
                // Call new takeDamage method with shield and hull damage
                const result = this.enemy.takeDamage(shieldDamage, hullDamage, penetration);

                if (result.evaded) {
                    console.log('[Combat] Enemy EVADED!');
                    if (this.state.game && this.state.game.damageNumbers) {
                        this.state.game.damageNumbers.add(405, 80, 'EVADED!', '#00ff00');
                    }
                    continue;
                }

                // Show shield damage number (Cyan)
                if (result.shieldDamage > 0 && this.state.game && this.state.game.damageNumbers) {
                    this.state.game.damageNumbers.add(405, 60, Math.round(result.shieldDamage), '#00f0ff');
                    console.log(`[Combat] Enemy shields: ${result.shieldDamage.toFixed(1)} absorbed, ${result.shieldsRemaining}/${this.enemy.maxShields} remaining`);
                }

                // Show hull damage number (Red)
                if (result.hullDamage > 0) {
                    console.log(`[Combat] ${result.hullDamage.toFixed(1)} damage to ${target.name}! Hull: ${target.hull}/${target.maxHull}`);

                    if (this.state.game && this.state.game.damageNumbers) {
                        this.state.game.damageNumbers.add(405, 80, Math.round(result.hullDamage), '#ff0055');
                    }
                }

                // Ion effect - chance to disable enemy system
                if (ionChance > 0 && Math.random() < ionChance) {
                    console.log(`[Combat] ION HIT! Enemy system ionized!`);
                    // TODO: Implement ion effect on enemy systems
                    if (this.state.game && this.state.game.damageNumbers) {
                        this.state.game.damageNumbers.add(405, 60, 'ION!', '#00ffff');
                    }
                }

                // Burn effect
                if (burnDamage > 0 && burnDuration > 0) {
                    console.log(`[Combat] BURN! ${burnDamage} damage over ${burnDuration}s`);
                    // TODO: Implement burn DOT tracking
                }

                // Add visual effects
                if (this.state.game && this.state.game.combatEffects) {
                    // Hit marker at enemy position
                    this.state.game.combatEffects.addHitMarker(405, 80, '#fff');

                    // Impact particles (cyan for shield, red for hull)
                    const particleColor = result.shieldDamage > 0 ? '#00f0ff' : '#ff0055';
                    this.state.game.combatEffects.addImpactParticles(405, 80, 8, particleColor);

                    // Impact sound
                    this.state.game.combatEffects.playImpactSound();
                }

                // Flash enemy overlay on hit
                const overlay = document.getElementById('enemy-ship-overlay');
                if (overlay) {
                    overlay.classList.add('enemy-hit');
                    setTimeout(() => {
                        overlay.classList.remove('enemy-hit');
                    }, 150);
                }
            } else {
                // Fallback for player ship without shield manager
                target.health = Math.max(0, target.health - hullDamage);

                // Notify state change to update HUD
                if (this.state.notify) this.state.notify();
                console.log(`[Combat] ${hullDamage} damage to ${target.name}! Hull: ${target.health}/${target.maxHealth}`);

                // Show hull damage number on player (Red)
                if (this.state.game && this.state.game.damageNumbers) {
                    const shipX = this.state.game.canvas.width / 2;
                    const shipY = this.state.game.canvas.height / 2;
                    this.state.game.damageNumbers.add(shipX, shipY, Math.round(hullDamage), '#ff0055');
                }
            }
        }
    }

    /**
     * Fire player weapon
     */
    firePlayerWeapon(weaponId) {
        const weaponFire = this.state.weaponManager.fire(weaponId);
        if (!weaponFire) return;

        console.log(`Player fires ${weaponFire.name}!`);

        // Determine hit or miss
        for (let i = 0; i < weaponFire.shots; i++) {
            const result = this.enemy.takeDamage(weaponFire.damage);

            if (result.evaded) {
                console.log('Enemy evaded!');
            } else if (result.absorbed > 0) {
                console.log(`Hit! Shield absorbed ${result.absorbed} damage`);
            } else if (result.hullDamage > 0) {
                console.log(`Hit! ${result.hullDamage} hull damage to enemy`);

                // Damage targeted system
                if (this.playerTarget) {
                    this.enemy.damageSystem(this.playerTarget.id, weaponFire.damage);
                    console.log(`${this.playerTarget.name} damaged!`);
                }
            }
        }

        // Auto-recharge
        this.state.weaponManager.startCharging(weaponId);
    }

    /**
     * Fire enemy weapon
     */
    fireEnemyWeapon(weaponId) {
        const weaponFire = this.enemy.fireWeapon(weaponId);
        if (!weaponFire) return;

        console.log(`Enemy fires weapon!`);

        // Check if player shields block
        for (let i = 0; i < weaponFire.shots; i++) {
            const shieldBlocked = this.state.shieldManager.takeDamage(weaponFire.damage);

            if (shieldBlocked) {
                console.log('Shields absorbed hit!');
            } else {
                // Damage player ship/system
                console.log(`Player hit! ${weaponFire.damage} damage`);

                if (this.enemyTarget) {
                    this.state.powerManager.damageSystem(this.enemyTarget.id, weaponFire.damage);
                    console.log(`${this.enemyTarget.name} damaged!`);
                } else {
                    // Random system damage
                    const randomSystem = this.state.ship.systems[
                        Math.floor(Math.random() * this.state.ship.systems.length)
                    ];
                    this.state.powerManager.damageSystem(randomSystem.id, weaponFire.damage);
                }

                // Hull damage
                this.state.ship.health = Math.max(0, this.state.ship.health - weaponFire.damage);
            }
        }

        // Auto-recharge enemy weapon
        this.enemy.chargeWeapon(weaponId);
    }

    /**
     * Player sets target
     */
    setPlayerTarget(systemId) {
        const system = this.enemy.systems.find(s => s.id === systemId);
        this.playerTarget = system || null;
        console.log(`Target set: ${this.playerTarget ? this.playerTarget.name : 'none'}`);
    }

    /**
     * Attempt player escape from combat
     * Success chance based on bridge and engine modules + power allocation
     */
    attemptPlayerEscape() {
        console.log('[Combat] Player attempting to escape...');

        // Get bridge and engine modules
        const bridgeModule = getModule(this.state.ship.hardpoints.bridge);
        const engineModule = getModule(this.state.ship.hardpoints.engine);

        // Get bridge and engine systems for power allocation
        const bridgeSystem = this.state.ship.systems.find(s => s.type === 'bridge');
        const engineSystem = this.state.ship.systems.find(s => s.type === 'engine');

        // Base escape chance
        let escapeChance = 0.3; // 30% base

        // Bridge module bonus (up to +20%)
        if (bridgeModule) {
            const bridgeTier = bridgeModule.tier || 1;
            escapeChance += (bridgeTier - 1) * 0.05; // +5% per tier above 1
        }

        // Engine module bonus (up to +30%)
        if (engineModule) {
            const engineTier = engineModule.tier || 1;
            escapeChance += (engineTier - 1) * 0.075; // +7.5% per tier above 1
        }

        // Power allocation bonus (up to +20%)
        if (bridgeSystem && bridgeSystem.currentPower > 0) {
            escapeChance += bridgeSystem.currentPower * 0.05; // +5% per power bar
        }
        if (engineSystem && engineSystem.currentPower > 0) {
            escapeChance += engineSystem.currentPower * 0.05; // +5% per power bar
        }

        // Cap at 90%
        escapeChance = Math.min(0.9, escapeChance);

        console.log(`[Combat] Escape chance: ${(escapeChance * 100).toFixed(1)}%`);
        console.log(`[Combat] - Bridge: Tier ${bridgeModule?.tier || 0}, Power ${bridgeSystem?.currentPower || 0}`);
        console.log(`[Combat] - Engine: Tier ${engineModule?.tier || 0}, Power ${engineSystem?.currentPower || 0}`);

        // Roll for escape
        const roll = Math.random();
        const success = roll < escapeChance;

        if (success) {
            console.log(`[Combat] ESCAPE SUCCESSFUL! (rolled ${(roll * 100).toFixed(1)}% vs ${(escapeChance * 100).toFixed(1)}%)`);

            // Show success message
            if (this.state.game && this.state.game.hud) {
                this.state.game.hud.showNotification('Escape successful!', 'success');
            }

            // Show escape message with damage numbers
            if (this.state.game && this.state.game.damageNumbers) {
                const shipX = this.state.game.canvas.width / 2;
                const shipY = this.state.game.canvas.height / 2;
                this.state.game.damageNumbers.add(shipX, shipY - 50, 'ESCAPED!', '#00ff55');
            }

            // Successful escape - end combat
            this.victor = 'player_escaped';
            this.rewards = { credits: 0, scrap: 0, systems: [] }; // No rewards for escaping
            this.endCombat();
        } else {
            console.log(`[Combat] ESCAPE FAILED! (rolled ${(roll * 100).toFixed(1)}% vs ${(escapeChance * 100).toFixed(1)}%)`);

            // Show failure message
            if (this.state.game && this.state.game.hud) {
                this.state.game.hud.showNotification(`Escape failed! (${(escapeChance * 100).toFixed(0)}% chance)`, 'error');
            }

            // Show failed message with damage numbers
            if (this.state.game && this.state.game.damageNumbers) {
                const shipX = this.state.game.canvas.width / 2;
                const shipY = this.state.game.canvas.height / 2;
                this.state.game.damageNumbers.add(shipX, shipY - 50, 'FAILED!', '#ff0055');
            }

            // Failed escape - combat continues
            console.log('[Combat] Escape failed, combat continues');
        }
    }

    /**
     * Attempt enemy flee
     */
    attemptEnemyFlee() {
        const fleeChance = 0.6; // 60% base chance

        if (Math.random() < fleeChance) {
            console.log(`${this.enemy.name} has fled!`);
            this.victor = 'player';
            this.rewards = this.calculateRewards(false); // Partial rewards for flee
            this.endCombat();
        } else {
            console.log(`${this.enemy.name} failed to flee!`);
            this.enemy.aiState = 'defensive';
        }
    }

    /**
     * Enemy surrender
     */
    enemySurrender() {
        console.log(`${this.enemy.name} surrenders!`);
        this.victor = 'player';
        this.rewards = this.calculateRewards(true); // Full rewards + bonus
        this.endCombat();
    }

    /**
     * Check if combat should end
     */
    checkCombatEnd() {
        // Player destroyed
        if (this.state.ship.health <= 0) {
            this.victor = 'enemy';
            return true;
        }

        // Enemy destroyed
        if (this.enemy.isDestroyed()) {
            this.victor = 'player';
            this.rewards = this.calculateRewards(true);
            return true;
        }

        return false;
    }

    /**
     * Calculate rewards
     */
    calculateRewards(fullRewards) {
        const base = {
            credits: this.enemy.creditReward,
            scrap: this.enemy.scrapValue,
            systems: []
        };

        if (!fullRewards) {
            // Partial rewards for flee
            base.credits = Math.floor(base.credits * 0.3);
            base.scrap = Math.floor(base.scrap * 0.3);
        } else {
            // Chance for system salvage (10%)
            if (Math.random() < 0.1) {
                const salvageableSystem = this.enemy.systems.find(s => !s.offline);
                if (salvageableSystem) {
                    base.systems.push({
                        type: salvageableSystem.type,
                        name: `Salvaged ${salvageableSystem.name}`,
                        level: salvageableSystem.level
                    });
                }
            }
        }

        return base;
    }

    /**
     * End combat
     */
    endCombat() {
        this.active = false;

        console.log(`Combat ended! Victor: ${this.victor}`);

        if (this.victor === 'player') {
            console.log('Rewards:', this.rewards);
            this.applyRewards();
        } else {
            console.log('Defeat!');
            // Game over or emergency FTL
        }

        this.state.saveGame();
    }

    /**
     * Apply rewards to player
     */
    applyRewards() {
        if (!this.rewards) return;

        // Credits
        this.state.credits += this.rewards.credits;

        // Scrap
        const scrapItem = this.state.inventory.find(i => i.id === 'scrap');
        if (scrapItem) {
            scrapItem.quantity += this.rewards.scrap;
        } else {
            this.state.inventory.push({
                id: 'scrap',
                name: 'Scrap Metal',
                quantity: this.rewards.scrap,
                value: 25
            });
        }

        // Systems
        this.rewards.systems.forEach(system => {
            this.state.inventory.push({
                id: `system_${Date.now()}`,
                ...system,
                type: 'module',
                systemType: system.type
            });
        });

        // Update UI and save game
        this.state.notify();
        this.state.saveGame();
        console.log('[Combat] Rewards applied and game saved');
    }

    /**
     * Get combat status for UI
     */
    getStatus() {
        return {
            active: this.active,
            paused: this.paused,
            playerTarget: this.playerTarget,
            enemyTarget: this.enemyTarget,
            playerHull: this.state.ship.health,
            playerMaxHull: this.state.ship.maxHealth,
            playerShields: this.state.ship.shields.currentLayers,
            enemyHull: this.enemy.hull,
            enemyMaxHull: this.enemy.maxHull,
            enemyShields: this.enemy.shields,
            victor: this.victor,
            rewards: this.rewards
        };
    }
}
