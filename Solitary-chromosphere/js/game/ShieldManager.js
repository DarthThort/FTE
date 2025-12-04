class ShieldManager {
    constructor(gameState) {
        this.state = gameState;
        this.fullChargeTime = 0; // Track time since shields reached full capacity
        this.impactFlashTime = 0; // Time since last impact (for flash effect)
        this.impactWaveProgress = 0; // 0-1 progress of impact wave animation
    }

    update(deltaTime) {
        const shields = this.state.ship.shields;
        const shieldSystem = this.state.ship.systems.find(s => s.type === 'shield');

        if (!shieldSystem) return;

        // Don't recharge shields if combat is paused
        if (this.state.combatManager && this.state.combatManager.paused) {
            return;
        }

        // Calculate max layers: system level + crew bonus (max 4)
        const baseLayers = shieldSystem.level || 1;  // 1-3 layers from system level
        const crewBonus = shieldSystem.assignedCrew ? 1 : 0;
        shields.maxLayers = Math.min(baseLayers + crewBonus, 4);

        // Cap current layers to max
        if (shields.currentLayers > shields.maxLayers) {
            shields.currentLayers = shields.maxLayers;
            shields.currentLayerHP = shields.layerHP;
        }

        // Only recharge if shields have power
        if (shieldSystem.currentPower > 0) {
            // Recharge speed scales with power: base + (0.5 * power)
            const rechargeSpeed = 1.0 + (0.5 * shieldSystem.currentPower);

            // Recharge if not at full
            if (shields.currentLayers < shields.maxLayers || shields.currentLayerHP < shields.layerHP) {
                shields.rechargeTimer += deltaTime * rechargeSpeed;

                // Recharge topmost layer HP first
                if (shields.currentLayerHP < shields.layerHP) {
                    // Recharge HP over time (e.g., 1 HP per 0.5 seconds)
                    const hpRechargeRate = 2.0; // HP per second
                    shields.currentLayerHP = Math.min(shields.layerHP, shields.currentLayerHP + (deltaTime * hpRechargeRate * rechargeSpeed));
                }

                // Then add new layer when timer full and current layer is full
                if (shields.currentLayerHP >= shields.layerHP && shields.rechargeTimer >= shields.rechargeRate) {
                    if (shields.currentLayers < shields.maxLayers) {
                        shields.currentLayers++;
                        shields.currentLayerHP = shields.layerHP;
                        shields.rechargeTimer = 0;
                        console.log(`[Shields] Layer recharged! Now at ${shields.currentLayers}/${shields.maxLayers}`);
                        this.refreshUI();
                    }
                }

                // Reset full charge timer while recharging
                this.fullChargeTime = 0;
            } else {
                // At full capacity
                shields.rechargeTimer = 0;
                this.fullChargeTime += deltaTime;
            }
        } else {
            // No power - shields down
            if (shields.currentLayers > 0) {
                console.log('[Shields] No power - shields down!');
                shields.currentLayers = 0;
                shields.currentLayerHP = 0;
            }
        }

        // Update impact effect timers
        if (this.impactFlashTime > 0) {
            this.impactFlashTime = Math.max(0, this.impactFlashTime - deltaTime);
        }
        if (this.impactWaveProgress > 0) {
            this.impactWaveProgress = Math.min(1.0, this.impactWaveProgress + (deltaTime * 4)); // Wave completes in 0.25s
            if (this.impactWaveProgress >= 1.0) {
                this.impactWaveProgress = 0; // Reset after complete
            }
        }
    }

    takeDamage(amount) {
        const shields = this.state.ship.shields;

        // Trigger impact visual effects FIRST (even if shields get destroyed)
        if (shields.currentLayers > 0) {
            this.impactFlashTime = 0.15; // Flash for 150ms
            this.impactWaveProgress = 0.01; // Start wave animation
            console.log('[ShieldManager] Impact effects triggered!', { flash: this.impactFlashTime, wave: this.impactWaveProgress });
        }

        if (shields.currentLayers === 0) {
            return amount; // No shields, all damage passes through
        }

        let remainingDamage = amount;

        // Damage current layer HP first
        if (shields.currentLayerHP > 0) {
            const layerDamage = Math.min(remainingDamage, shields.currentLayerHP);
            shields.currentLayerHP -= layerDamage;
            remainingDamage -= layerDamage;

            console.log(`[Shields] Layer took ${layerDamage} damage. Layer HP: ${shields.currentLayerHP}/${shields.layerHP}`);

            // If layer depleted, remove it
            if (shields.currentLayerHP <= 0 && shields.currentLayers > 0) {
                shields.currentLayers--;
                shields.currentLayerHP = shields.layerHP; // Reset for next layer
                console.log(`[Shields] Layer destroyed! ${shields.currentLayers} layers remaining`);
            }
        }

        // Continue through layers if damage remains
        while (remainingDamage > 0 && shields.currentLayers > 0) {
            const layerDamage = Math.min(remainingDamage, shields.layerHP);
            remainingDamage -= layerDamage;
            shields.currentLayers--;

            if (shields.currentLayers > 0) {
                shields.currentLayerHP = shields.layerHP - remainingDamage;
                if (shields.currentLayerHP < 0) {
                    remainingDamage = Math.abs(shields.currentLayerHP);
                    shields.currentLayerHP = 0;
                } else {
                    remainingDamage = 0;
                }
            } else {
                shields.currentLayerHP = 0;
            }

            console.log(`[Shields] Penetrated layer! ${shields.currentLayers} layers remaining`);
        }

        // Reset recharge timer on damage
        shields.rechargeTimer = 0;
        this.fullChargeTime = 0;
        this.refreshUI();

        // Return overflow damage to hull
        const overflow = Math.max(0, remainingDamage);
        console.log(`[Shields] Absorbed ${amount - overflow} damage. ${overflow} damage to hull.`);
        return overflow;
    }

    getShieldStatus() {
        const shields = this.state.ship.shields;
        const shieldSystem = this.state.ship.systems.find(s => s.type === 'shield');

        return {
            currentLayers: shields.currentLayers,
            maxLayers: shields.maxLayers,
            layerHP: shields.layerHP,
            currentLayerHP: shields.currentLayerHP,
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
