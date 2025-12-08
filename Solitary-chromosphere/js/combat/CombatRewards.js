/**
 * CombatRewards.js
 * Handles combat rewards calculation and application
 * Extracted from CombatManager.js
 */

class CombatRewards {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Calculate rewards from enemy
     * @param {Object} enemy - Enemy ship defeated
     * @param {boolean} fullRewards - Full rewards (destroyed) or partial (fled/surrendered)
     * @returns {Object} Rewards object
     */
    calculateRewards(enemy, fullRewards) {
        const base = {
            credits: enemy.creditReward,
            scrap: enemy.scrapValue,
            systems: []
        };

        if (!fullRewards) {
            // Partial rewards for flee/escape
            base.credits = Math.floor(base.credits * 0.3);
            base.scrap = Math.floor(base.scrap * 0.3);
        } else {
            // Chance for system salvage (10%)
            if (Math.random() < 0.1) {
                const salvageableSystem = enemy.systems.find(s => !s.offline);
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
     * Apply rewards to player state
     * @param {Object} rewards - Rewards to apply
     */
    applyRewards(rewards) {
        if (!rewards) return;

        // Credits
        this.state.credits += rewards.credits;

        // Scrap
        const scrapItem = this.state.inventory.find(i => i.id === 'scrap');
        if (scrapItem) {
            scrapItem.quantity += rewards.scrap;
        } else {
            this.state.inventory.push({
                id: 'scrap',
                name: 'Scrap Metal',
                quantity: rewards.scrap,
                value: 25
            });
        }

        // Systems
        rewards.systems.forEach(system => {
            this.state.inventory.push({
                id: `system_${Date.now()}`,
                ...system,
                type: 'module',
                systemType: system.type
            });
        });

        // Update UI and save
        this.state.notify();
        this.state.saveGame();
        console.log('[CombatRewards] Rewards applied and game saved');
    }
}
