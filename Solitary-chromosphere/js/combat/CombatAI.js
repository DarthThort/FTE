/**
 * CombatAI.js
 * Enemy AI decision making and targeting
 * Extracted from CombatManager.js
 */

class CombatAI {
    constructor(gameState, enemy) {
        this.state = gameState;
        this.enemy = enemy;
        this.decisionCooldown = 0;
        this.decisionInterval = 2.0; // AI makes decisions every 2 seconds
    }

    /**
     * Update AI tick  
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.decisionCooldown -= dt;

        if (this.decisionCooldown <= 0) {
            this.decisionCooldown = this.decisionInterval;
            this.makeDecision();
        }
    }

    /**
     * AI makes combat decision
     * @returns {Object} AI action decision
     */
    makeDecision() {
        // Update AI state based on situation
        this.enemy.updateAIState(this.state.ship);

        const decision = {
            action: 'attack',
            target: null,
            flee: false,
            surrender: false
        };

        // Check for flee/surrender
        if (this.enemy.aiState === 'fleeing') {
            decision.action = 'flee';
            decision.flee = true;
            return decision;
        }

        if (this.enemy.aiState === 'surrendering') {
            decision.action = 'surrender';
            decision.surrender = true;
            return decision;
        }

        // Select target
        decision.target = this.selectTarget();

        // Charge idle weapons
        this.enemy.weapons.forEach(weapon => {
            if (weapon.state === 'idle') {
                this.enemy.chargeWeapon(weapon.id);
            }
        });

        return decision;
    }

    /**
     * Enemy selects target system on player ship
     * @returns {Object} Target system or null
     */
    selectTarget() {
        const validTargets = this.state.ship.systems.filter(s => !s.offline);

        if (validTargets.length === 0) {
            return null;
        }

        // AI priorities based on state
        let prioritizedTargets = [...validTargets];

        switch (this.enemy.aiState) {
            case 'aggressive':
                // Target weapons first
                prioritizedTargets.sort((a, b) => {
                    const aIsWeapon = a.type === 'weapon' ? 1 : 0;
                    const bIsWeapon = b.type === 'weapon' ? 1 : 0;
                    return bIsWeapon - aIsWeapon;
                });
                break;

            case 'defensive':
                // Target shields/engines
                prioritizedTargets.sort((a, b) => {
                    const aIsDef = (a.type === 'shield' || a.type === 'engine') ? 1 : 0;
                    const bIsDef = (b.type === 'shield' || b.type === 'engine') ? 1 : 0;
                    return bIsDef - aIsDef;
                });
                break;

            case 'balanced':
            default:
                // Random targeting
                break;
        }

        return prioritizedTargets[0];
    }

    /**
     * Attempt enemy flee
     * @returns {boolean} Success
     */
    attemptFlee() {
        const fleeChance = 0.6; // 60% base chance

        if (Math.random() < fleeChance) {
            console.log(`${this.enemy.name} has fled!`);
            return true;
        } else {
            console.log(`${this.enemy.name} failed to flee!`);
            this.enemy.aiState = 'defensive';
            return false;
        }
    }

    /**
     * Enemy surrender
     * @returns {boolean} Always true
     */
    surrender() {
        console.log(`${this.enemy.name} surrenders!`);
        return true;
    }
}
