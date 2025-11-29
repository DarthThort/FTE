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
        if (this.state.weaponManager && this.state.weaponManager.weapons) {
            this.state.weaponManager.weapons.forEach(weapon => {
                if (weapon.state === 'idle') {
                    this.state.weaponManager.startCharging(weapon.id);
                }
            });
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
        // TODO: Fix weaponManager integration
        // this.state.weaponManager.tick(dt);
        this.enemy.tickWeapons(dt);

        // Update enemy AI
        this.tickEnemyAI(dt);

        // Auto-fire ready weapons (disabled until weaponManager works)
        // this.autoFireWeapons();

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
    autoFireWeapons() {
        // Player weapons (disabled - weaponManager integration needed)
        /* 
        this.state.weaponManager.weapons.forEach(weapon => {
            if (weapon.state === 'ready') {
                this.firePlayerWeapon(weapon.id);
            }
        });
        */

        // Enemy weapons
        if (this.enemy.weapons && this.enemy.weapons.length > 0) {
            this.enemy.weapons.forEach(weapon => {
                if (weapon.state === 'ready') {
                    this.fireEnemyWeapon(weapon.id);
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
