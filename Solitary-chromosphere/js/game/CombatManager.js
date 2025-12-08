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

        // Combat modules
        this.damageCalculator = new DamageCalculator(gameState);
        this.combatAI = new CombatAI(gameState, enemyShip);
        this.combatRewards = new CombatRewards(gameState);

        // Combat state
        this.active = false;
        this.paused = false;
        this.started = false;

        // Targeting
        this.playerTarget = null; // Enemy system being targeted
        this.enemyTarget = null; // Player system being targeted

        // Combat results
        this.victor = null;
        this.rewards = null;

        // Escape cooldown
        this.lastEscapeAttempt = 0;
        this.escapeCooldownBase = 10.0; // 10 seconds base
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
        this.combatAI.update(dt);

        const decision = this.combatAI.makeDecision();

        if (decision.flee) {
            this.attemptEnemyFlee();
        } else if (decision.surrender) {
            this.enemySurrender();
        } else if (decision.target) {
            this.enemyTarget = decision.target;
        }
    }

    /**
     * AI decision making
     */

    /**
     * Enemy selects target
     */

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
                        // Apply damage to enemy using damage calculator
                        const weaponModule = this.state.ship.hardpoints.weapon?.find(m => m.weaponId === weapon.id);
                        this.damageCalculator.applyWeaponDamage(
                            weapon,
                            weaponModule,
                            this.enemy,
                            this.state.ship
                        );
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

                    // Fire at player using damage calculator
                    const weaponModule = null; // Enemy weapons don't have modules yet
                    this.damageCalculator.applyWeaponDamage(
                        weapon,
                        weaponModule,
                        this.state.ship,
                        this.enemy
                    );

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
        // Check cooldown
        const now = Date.now() / 1000; // Convert to seconds
        const bridgeModule = getModule(this.state.ship.hardpoints.bridge);
        const bridgeTier = bridgeModule?.tier || 1;

        // Cooldown: 10s base - (bridge tier - 1)
        // Tier 1: 10s, Tier 2: 9s, Tier 3: 8s, Tier 4: 7s
        const cooldown = Math.max(5, this.escapeCooldownBase - (bridgeTier - 1));
        const timeSinceLastAttempt = now - this.lastEscapeAttempt;

        if (timeSinceLastAttempt < cooldown) {
            const remaining = Math.ceil(cooldown - timeSinceLastAttempt);
            if (this.state.game && this.state.game.hud) {
                this.state.game.hud.showNotification(`Escape on cooldown! (${remaining}s remaining)`, 'error');
            }
            console.log(`[Combat] Escape on cooldown, ${remaining}s remaining`);
            return;
        }

        console.log('[Combat] Player attempting to escape...');
        this.lastEscapeAttempt = now;

        // Get engine module (bridgeModule already declared above for cooldown)
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
        if (this.combatAI.attemptFlee()) {
            this.victor = 'player';
            this.rewards = this.calculateRewards(false);
            this.endCombat();
        }
    }

    /**
     * Enemy surrender
     */
    enemySurrender() {
        this.combatAI.surrender();
        this.victor = 'player';
        this.rewards = this.calculateRewards(true);
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
        return this.combatRewards.calculateRewards(this.enemy, fullRewards);
    }

    /**
     * End combat
     */
    endCombat() {
        this.active = false;

        console.log(`Combat ended! Victor: ${this.victor}`);

        if (this.victor === 'player' || this.victor === 'player_escaped') {
            console.log('Rewards:', this.rewards);
            this.applyRewards();
            // Save game on victory or escape
            this.state.saveGame();
        } else {
            console.log('Defeat!');
            // DON'T save on defeat - this preserves pre_travel_save for retry
            // Game over or emergency FTL
        }
    }

    /**
     * Apply rewards to player
     */
    applyRewards() {
        this.combatRewards.applyRewards(this.rewards);
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
