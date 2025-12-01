class ShieldManager {
    constructor(gameState) {
        this.state = gameState;
        this.fullChargeTime = 0; // Track time since shields reached full capacity
    }

    rechargeRate: shields.rechargeRate,
    systemPower: shieldSystem ? shieldSystem.currentPower: 0,
    systemMaxPower: shieldSystem ? shieldSystem.maxPower: 0,
    isRecharging: shields.currentLayers<shields.maxLayers && shieldSystem?.currentPower > 0,
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
