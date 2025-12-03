/**
 * ========== MODULE SYSTEM METHODS ==========
 */

/**
 * Buy a module from shop and add to ownedModules
 */
buyModule(moduleId) {
    const module = getModule(moduleId);

    if (!module) {
        return { success: false, message: 'Module not found' };
    }

    if (this.credits < module.price) {
        return { success: false, message: `Insufficient credits (need ${module.price} CR)` };
    }

    // Deduct credits and add to owned modules
    this.credits -= module.price;
    this.ownedModules.push(moduleId);

    this.saveGame();
    this.notify();

    console.log(`[Modules] Purchased ${module.name} for ${module.price} CR`);
    return { success: true, message: `Purchased ${module.name}` };
}

/**
 * Install a module in a hardpoint
 */
installModule(hardpoint, moduleId) {
    const module = getModule(moduleId);

    if (!module) {
        return { success: false, message: 'Module not found' };
    }

    // Check if player owns the module
    if (!this.ownedModules.includes(moduleId)) {
        return { success: false, message: 'Module not in inventory' };
    }

    // Validate hardpoint
    if (!this.ship.hardpoints.hasOwnProperty(hardpoint)) {
        return { success: false, message: 'Invalid hardpoint' };
    }

    // Unequip current module (return to inventory)
    const currentModule = this.ship.hardpoints[hardpoint];
    if (currentModule) {
        this.ownedModules.push(currentModule);
    }

    // Equip new module
    this.ship.hardpoints[hardpoint] = moduleId;

    // Remove from owned modules
    const index = this.ownedModules.indexOf(moduleId);
    this.ownedModules.splice(index, 1);

    // Recalculate ship stats
    this.recalculateShipStats();

    this.saveGame();
    this.notify();

    console.log(`[Modules] Installed ${module.name} in ${hardpoint}`);
    return { success: true, message: `${module.name} installed` };
}

/**
 * Unequip a module from hardpoint (return to inventory)
 */
unequipModule(hardpoint) {
    const moduleId = this.ship.hardpoints[hardpoint];

    if (!moduleId) {
        return { success: false, message: 'No module equipped' };
    }

    const module = getModule(moduleId);

    // Return to inventory
    this.ownedModules.push(moduleId);
    this.ship.hardpoints[hardpoint] = null;

    // Recalculate stats
    this.recalculateShipStats();

    this.saveGame();
    this.notify();

    console.log(`[Modules] Unequipped ${module.name} from ${hardpoint}`);
    return { success: true, message: `${module.name} unequipped` };
}

/**
 * Recalculate ship stats from equipped modules
 */
recalculateShipStats() {
    const reactor = getModule(this.ship.hardpoints.reactor);
    const jumpDrive = getModule(this.ship.hardpoints.jumpDrive);
    const engine = getModule(this.ship.hardpoints.engine);
    const bridge = getModule(this.ship.hardpoints.bridge);
    const shield = getModule(this.ship.hardpoints.shield);

    // Update reactor power
    if (reactor) {
        this.ship.totalPower = reactor.stats.maxPower;
        this.ship.reactor.maxPower = reactor.stats.maxPower;
    }

    // Update jump range
    if (jumpDrive) {
        this.ship.jumpRange = jumpDrive.stats.jumpRange;
    }

    // Update flee chance (base 30% + engine bonus)
    if (engine) {
        this.ship.fleeChance = 0.3 + engine.stats.fleeBonus;
    }

    // Update O2 regen and dialogue bonus
    if (bridge) {
        this.ship.o2Regen = bridge.stats.o2Regen;
        this.ship.dialogueBonus = bridge.stats.dialogueBonus;
    }

    // Update shield layers
    if (shield) {
        this.ship.shields.maxLayers = shield.stats.layers;
        this.ship.shields.rechargeRate = shield.stats.rechargeRate;

        // If current layers exceed new max, cap them
        if (this.ship.shields.currentLayers > shield.stats.layers) {
            this.ship.shields.currentLayers = shield.stats.layers;
        }
    }

    console.log('[Modules] Ship stats recalculated');
    this.notify();
}

/**
 * Get equipped weapons as module objects
 */
getEquippedWeapons() {
    const weapons = [];

    if (this.ship.hardpoints.weapon1) {
        weapons.push(getModule(this.ship.hardpoints.weapon1));
    }
    if (this.ship.hardpoints.weapon2) {
        weapons.push(getModule(this.ship.hardpoints.weapon2));
    }

    return weapons;
}
}

// Add at end of GameState.js before closing brace
