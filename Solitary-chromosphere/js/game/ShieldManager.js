class ShieldManager {
    constructor(gameState) {
        this.state = gameState;
        this.fullChargeTime = 0; // Track time since shields reached full capacity
    }

    update(deltaTime) {
        const shields = this.state.ship.shields;
        const shieldSystem = this.state.ship.systems.find(s => s.type === 'shield');

        if (!shieldSystem) return;

        const powerBasedLayers = Math.min(shieldSystem.level * 2, shieldSystem.currentPower);
        shields.maxLayers = powerBasedLayers;

        if (shields.currentLayers > shields.maxLayers) {
            shields.currentLayers = shields.maxLayers;
        }

        // Recharge shields if below max and has power
        if (shields.currentLayers < shields.maxLayers && shieldSystem.currentPower > 0) {
            shields.rechargeTimer += deltaTime;

            if (shields.rechargeTimer >= shields.rechargeRate) {
                shields.currentLayers++;
                shields.rechargeTimer = 0;

                console.log(`Shield layer regenerated! Now at ${shields.currentLayers}/${shields.maxLayers}`);
                this.refreshUI();
            }

            // Reset full charge timer while recharging
            this.fullChargeTime = 0;
        } else {
            if (shields.currentLayers >= shields.maxLayers) {
                shields.rechargeTimer = 0;
                // Track time at full charge for fade out
                this.fullChargeTime += deltaTime;
            }
        }
    }

    takeDamage(amount) {
        const shields = this.state.ship.shields;
        const layersLost = Math.min(amount, shields.currentLayers);

        shields.currentLayers -= layersLost;
        shields.rechargeTimer = 0;
        this.fullChargeTime = 0; // Reset fade timer on damage

        const overflowDamage = amount - layersLost;

        console.log(`Shields absorbed ${layersLost} damage. ${overflowDamage} to hull. Shields: ${shields.currentLayers}/${shields.maxLayers}`);
        this.refreshUI();

        return overflowDamage;
    }

    getShieldStatus() {
        const shields = this.state.ship.shields;
        const shieldSystem = this.state.ship.systems.find(s => s.type === 'shield');

        return {
            currentLayers: shields.currentLayers,
            maxLayers: shields.maxLayers,
            rechargeProgress: shields.rechargeTimer / shields.rechargeRate,
            rechargeRate: shields.rechargeRate,
            systemPower: shieldSystem ? shieldSystem.currentPower : 0,
            systemMaxPower: shieldSystem ? shieldSystem.maxPower : 0,
            isRecharging: shields.currentLayers < shields.maxLayers && shieldSystem?.currentPower > 0,
            fullChargeTime: this.fullChargeTime
        };
    }

    hasActiveShields() {
        return this.state.ship.shields.currentLayers > 0;
    }

    refreshUI() {
        if (window.game && window.game.ui && window.game.ui.shieldUI) {
            window.game.ui.shieldUI.refreshShieldPanel();
        }
    }
}
