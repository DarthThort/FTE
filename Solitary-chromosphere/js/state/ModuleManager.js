/**
 * ModuleManager.js
 * Handles module purchasing, installation, upgrades, and ship stat recalculation
 * Extracted from GameState.js
 */

class ModuleManager {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Buy a module from shop and add to ownedModules
     */
    buyModule(moduleId) {
        const module = getModule(moduleId);

        if (!module) {
            return { success: false, message: 'Module not found' };
        }

        if (this.state.credits < module.price) {
            return { success: false, message: `Insufficient credits (need ${module.price} CR)` };
        }

        // Deduct credits and add to owned modules
        this.state.credits -= module.price;
        this.state.ownedModules.push(moduleId);

        this.state.saveGame();
        this.state.notify();

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

        // Check if module is owned
        const ownedIndex = this.state.ownedModules.indexOf(moduleId);
        if (ownedIndex === -1) {
            return { success: false, message: 'You do not own this module' };
        }

        // Unequip existing module if any
        const existingModuleId = this.state.ship.hardpoints[hardpoint];
        if (existingModuleId) {
            this.state.ownedModules.push(existingModuleId);
        }

        // Remove from owned and equip
        this.state.ownedModules.splice(ownedIndex, 1);
        this.state.ship.hardpoints[hardpoint] = moduleId;

        // Recalculate stats
        this.recalculateShipStats();

        this.state.saveGame();
        this.state.notify();

        console.log(`[Modules] Installed ${module.name} in ${hardpoint}`);
        return { success: true, message: `${module.name} installed` };
    }

    /**
     * Unequip a module from hardpoint (return to inventory)
     */
    unequipModule(hardpoint) {
        const moduleId = this.state.ship.hardpoints[hardpoint];

        if (!moduleId) {
            return { success: false, message: 'No module equipped' };
        }

        const module = getModule(moduleId);

        // Return to inventory
        this.state.ownedModules.push(moduleId);
        this.state.ship.hardpoints[hardpoint] = null;

        // Recalculate stats
        this.recalculateShipStats();

        this.state.saveGame();
        this.state.notify();

        console.log(`[Modules] Unequipped ${module.name} from ${hardpoint}`);
        return { success: true, message: `${module.name} unequipped` };
    }

    /**
     * Recalculate ship stats from equipped modules
     */
    recalculateShipStats() {
        const reactor = getModule(this.state.ship.hardpoints.reactor);
        const jumpDrive = getModule(this.state.ship.hardpoints.jumpDrive);
        const engine = getModule(this.state.ship.hardpoints.engine);
        const bridge = getModule(this.state.ship.hardpoints.bridge);
        const shield = getModule(this.state.ship.hardpoints.shield);

        // Update reactor power
        if (reactor) {
            this.state.ship.totalPower = reactor.stats.maxPower;
            this.state.ship.reactor.maxPower = reactor.stats.maxPower;

            // BETTER REACTOR = Higher max power per system
            // Tier 1: 2 max, Tier 2: 3 max, Tier 3: 4 max, Tier 4: 5 max
            const systemMaxPower = Math.min(reactor.tier + 1, 5);

            // Update maxPower for all systems
            this.state.ship.systems.forEach(sys => {
                sys.maxPower = systemMaxPower;
                // Cap current power if it exceeds new max
                if (sys.currentPower > systemMaxPower) {
                    sys.currentPower = systemMaxPower;
                }
            });
        } else {
            // No reactor installed = no power
            this.state.ship.totalPower = 0;
            this.state.ship.reactor.maxPower = 0;
            // Reset all system power to 0
            this.state.ship.systems.forEach(sys => {
                sys.currentPower = 0;
                sys.maxPower = 0;
            });
        }

        // Update jump range
        if (jumpDrive) {
            this.state.ship.jumpRange = jumpDrive.stats.jumpRange;
        }

        // Update flee chance (base 30% + engine bonus)
        if (engine) {
            this.state.ship.fleeChance = 0.3 + engine.stats.fleeBonus;
        }

        // Update O2 regen and dialogue bonus
        if (bridge) {
            this.state.ship.o2Regen = bridge.stats.o2Regen;
            this.state.ship.dialogueBonus = bridge.stats.dialogueBonus;
        }

        // Update shield layers
        if (shield) {
            this.state.ship.shields.maxLayers = shield.stats.layers;
            this.state.ship.shields.rechargeRate = shield.stats.rechargeRate;

            // If current layers exceed new max, cap them
            if (this.state.ship.shields.currentLayers > shield.stats.layers) {
                this.state.ship.shields.currentLayers = shield.stats.layers;
            }
        }

        // PHASE 8: Regenerate weapons from equipped modules
        this.state.ship.weapons = this.getEquippedWeapons();
        console.log(`[Modules] Generated ${this.state.ship.weapons.length} weapons from hardpoints`);
        console.log(`[ModuleManager] Recalculated ship stats. New power: ${this.state.ship.totalPower}, shields: ${this.state.ship.shields.maxLayers}, weapons: ${this.state.ship.weapons.length}`);

        // Refresh all UI panels
        if (this.state.shieldManager) {
            this.state.shieldManager.refreshUI();
        }
        // Refresh weapon UI if available
        if (window.game && window.game.ui && window.game.ui.weaponUI) {
            window.game.ui.weaponUI.refreshWeaponsPanel();
        }

        // Refresh power UI if reactor changed
        if (window.game && window.game.ui && window.game.ui.powerUI) {
            window.game.ui.powerUI.refreshPowerPanel();
        }

        console.log('[Modules] Ship stats recalculated');
        this.state.notify();
    }

    /**
     * Upgrade an installed module to next tier using scrap
     */
    upgradeModule(hardpoint) {
        const moduleId = this.state.ship.hardpoints[hardpoint];

        if (!moduleId) {
            return { success: false, message: 'No module installed in this hardpoint' };
        }

        const currentModule = getModule(moduleId);
        if (!currentModule) {
            return { success: false, message: 'Module not found' };
        }

        // Check if module has upgrade path
        if (!currentModule.upgradeTo) {
            return { success: false, message: `${currentModule.name} is already max tier` };
        }

        const nextModule = getModule(currentModule.upgradeTo);
        if (!nextModule) {
            return { success: false, message: 'Upgrade module not found' };
        }

        // Check scrap cost
        const scrapCost = currentModule.scrapCost;
        if (this.state.scrap < scrapCost) {
            return { success: false, message: `Need ${scrapCost} scrap (have ${this.state.scrap})` };
        }

        // Deduct scrap
        this.state.scrap -= scrapCost;

        // Swap module
        this.state.ship.hardpoints[hardpoint] = nextModule.id;

        // Recalculate stats
        this.recalculateShipStats();

        this.state.saveGame();
        this.state.notify();

        console.log(`[Upgrade] ${currentModule.name} → ${nextModule.name} (cost ${scrapCost} scrap)`);
        return {
            success: true,
            message: `Upgraded to ${nextModule.name}!`,
            from: currentModule.name,
            to: nextModule.name
        };
    }

    /**
     * Get equipped weapons as module objects with combat-ready stats
     */
    getEquippedWeapons() {
        const weapons = [];

        // Weapon 1
        if (this.state.ship.hardpoints.weapon1) {
            const module = getModule(this.state.ship.hardpoints.weapon1);
            if (module) {
                weapons.push({
                    id: 'weapon_1',
                    moduleId: module.id,
                    name: module.name,
                    type: module.stats.type || 'laser',
                    chargeTime: module.stats.chargeTime || 8,
                    cooldownTime: module.stats.cooldown || 2,
                    shots: module.stats.shots || 1,
                    damagePerShot: module.stats.hullDamage || 10,  // For UI display
                    powerRequired: module.stats.energyCost || 1,
                    currentCharge: 0,
                    state: 'idle',
                    target: null,
                    // Reference to module for combat manager
                    module: module
                });
            }
        }

        // Weapon 2
        if (this.state.ship.hardpoints.weapon2) {
            const module = getModule(this.state.ship.hardpoints.weapon2);
            if (module) {
                weapons.push({
                    id: 'weapon_2',
                    moduleId: module.id,
                    name: module.name,
                    type: module.stats.type || 'laser',
                    chargeTime: module.stats.chargeTime || 8,
                    cooldownTime: module.stats.cooldown || 2,
                    shots: module.stats.shots || 1,
                    damagePerShot: module.stats.hullDamage || 10,
                    powerRequired: module.stats.energyCost || 1,
                    currentCharge: 0,
                    state: 'idle',
                    target: null,
                    module: module
                });
            }
        }

        return weapons;
    }
}
