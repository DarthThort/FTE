class WeaponManager {
    constructor(gameState) {
        this.state = gameState;
    }

    // Update weapon charge timers
    update(deltaTime) {
        if (!this.state.ship.weapons) return;

        this.state.ship.weapons.forEach(weapon => {
            this.updateWeapon(weapon, deltaTime);
        });
    }

    updateWeapon(weapon, deltaTime) {
        // Check if weapons system has power
        const weaponsSystem = this.state.ship.systems.find(s => s.type === 'weapon');
        if (!weaponsSystem || weaponsSystem.currentPower === 0) {
            // No power - reset weapon to idle
            if (weapon.state !== 'idle') {
                weapon.state = 'idle';
                weapon.currentCharge = 0;
            }
            return;
        }

        // Get effectiveness multiplier (affects charge speed)
        const effectiveness = weaponsSystem.effectiveness || 1.0;

        switch (weapon.state) {
            case 'charging':
                // Increase charge based on effectiveness
                weapon.currentCharge += deltaTime * effectiveness;

                if (weapon.currentCharge >= weapon.chargeTime) {
                    weapon.currentCharge = weapon.chargeTime;
                    weapon.state = 'ready';

                    // Refresh UI when state changes
                    this.refreshUI();

                    // Auto-fire if crew is manning weapons system
                    if (this.hasCrewAtWeapons()) {
                        this.fireWeapon(weapon.id);
                    }
                }
                break;

            case 'cooldown':
                weapon.currentCharge -= deltaTime;

                if (weapon.currentCharge <= 0) {
                    weapon.currentCharge = 0;
                    weapon.state = 'idle';

                    // Refresh UI when state changes
                    this.refreshUI();
                }
                break;

            case 'ready':
                // Stay ready until manually fired or power lost
                break;

            case 'idle':
                // Waiting to be charged
                break;
        }
    }

    refreshUI() {
        // Refresh the weapon UI if available
        if (window.game && window.game.ui && window.game.ui.weaponUI) {
            window.game.ui.weaponUI.refreshWeaponsPanel();
        }
    }

    // Check if any crew member is at weapons system
    hasCrewAtWeapons() {
        const weaponsSystem = this.state.ship.systems.find(s => s.type === 'weapon');
        if (!weaponsSystem) return false;

        // Check if the weapons system has assigned crew
        return weaponsSystem.assignedCrew !== null && weaponsSystem.assignedCrew !== undefined;
    }

    // Start charging a weapon
    chargeWeapon(weaponId) {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return false;

        // Can only charge from idle state
        if (weapon.state !== 'idle') return false;

        // Check if weapons system has power
        const weaponsSystem = this.state.ship.systems.find(s => s.type === 'weapon');
        if (!weaponsSystem || weaponsSystem.currentPower < weapon.powerRequired) {
            return false;
        }

        weapon.state = 'charging';
        weapon.currentCharge = 0;
        return true;
    }

    // Cancel weapon charge
    cancelCharge(weaponId) {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return false;

        if (weapon.state === 'charging') {
            weapon.state = 'idle';
            weapon.currentCharge = 0;
            return true;
        }
        return false;
    }

    // Fire weapon
    fireWeapon(weaponId, target = null) {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return false;

        // Can only fire when ready
        if (weapon.state !== 'ready') return false;

        // Store target for later use in combat
        weapon.lastTarget = target;

        // Enter cooldown
        weapon.state = 'cooldown';
        weapon.currentCharge = weapon.cooldownTime;

        // In Phase 6, this will actually apply damage
        // For now, just log the fire event
        console.log(`${weapon.name} fired at ${target || 'Hull'}!`);

        return true;
    }

    // Get weapon status for UI
    getWeaponStatus(weaponId) {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return null;

        const weaponsSystem = this.state.ship.systems.find(s => s.type === 'weapon');
        const hasPower = weaponsSystem && weaponsSystem.currentPower >= weapon.powerRequired;
        const hasCrewManning = this.hasCrewAtWeapons();

        return {
            id: weapon.id,
            name: weapon.name,
            type: weapon.type,
            state: weapon.state,
            chargeProgress: this.getChargeProgress(weapon),
            cooldownProgress: this.getCooldownProgress(weapon),
            powerRequired: weapon.powerRequired,
            hasPower: hasPower,
            shots: weapon.shots,
            damage: weapon.damagePerShot,
            canCharge: weapon.state === 'idle' && hasPower,
            canFire: weapon.state === 'ready',
            autofire: hasCrewManning,
            target: weapon.target || 'Hull'
        };
    }

    getChargeProgress(weapon) {
        if (weapon.state === 'charging' || weapon.state === 'ready') {
            return Math.min(1.0, weapon.currentCharge / weapon.chargeTime);
        }
        return 0;
    }

    getCooldownProgress(weapon) {
        if (weapon.state === 'cooldown') {
            return weapon.currentCharge / weapon.cooldownTime;
        }
        return 0;
    }

    // Set weapon target
    setTarget(weaponId, target) {
        const weapon = this.getWeapon(weaponId);
        if (weapon) {
            weapon.target = target;
            return true;
        }
        return false;
    }

    // Helpers
    getWeapon(weaponId) {
        return this.state.ship.weapons?.find(w => w.id === weaponId);
    }

    getAllWeaponsStatus() {
        if (!this.state.ship.weapons) return [];
        return this.state.ship.weapons.map(w => this.getWeaponStatus(w.id));
    }
}
