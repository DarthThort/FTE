/**
 * Debug Commands - Dev tools for testing
 * Access via browser console with: window.debug.startCombat(), etc.
 */

window.debug = {
    /**
     * Start instant combat with a pirate scout
     */
    startCombat() {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        console.log('[Debug] Starting combat...');
        const enemy = new EnemyShip('pirate_scout', 1);
        window.game.state.combatManager = new CombatManager(window.game.state, enemy);
        window.game.state.combatManager.active = true;
        window.game.state.combatManager.start();
        console.log('[Debug] Combat started with pirate scout!');
    },

    /**
     * Start combat with specific enemy type
     * @param {string} type - 'pirate_scout' or 'pirate_raider'
     * @param {number} threatLevel - 0-5
     */
    startCombatWith(type = 'pirate_scout', threatLevel = 1) {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        console.log(`[Debug] Starting combat with ${type} (threat ${threatLevel})...`);
        const enemy = new EnemyShip(type, threatLevel);
        window.game.state.combatManager = new CombatManager(window.game.state, enemy);
        window.game.state.combatManager.active = true;
        window.game.state.combatManager.start();
        console.log(`[Debug] Combat started!`);
    },

    /**
     * Add credits
     * @param {number} amount - Amount to add
     */
    addCredits(amount = 1000) {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        window.game.state.credits += amount;
        window.game.state.notify();
        console.log(`[Debug] Added ${amount} credits. Total: ${window.game.state.credits}`);
    },

    /**
     * Add scrap
     * @param {number} amount - Amount to add
     */
    addScrap(amount = 50) {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        window.game.state.scrap += amount;
        window.game.state.notify();
        console.log(`[Debug] Added ${amount} scrap. Total: ${window.game.state.scrap}`);
    },

    /**
     * Install module in hardpoint
     * @param {string} hardpoint - 'weapon1', 'weapon2', 'shield', etc.
     * @param {string} moduleId - Module ID from ModuleDefinitions
     */
    installModule(hardpoint, moduleId) {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        // Add to owned modules first if not owned
        if (!window.game.state.ownedModules.includes(moduleId)) {
            window.game.state.ownedModules.push(moduleId);
        }

        const result = window.game.state.installModule(hardpoint, moduleId);
        console.log(`[Debug] Install result:`, result);
    },

    /**
     * Upgrade installed module
     * @param {string} hardpoint - 'weapon1', 'weapon2', 'shield', etc.
     */
    upgradeModule(hardpoint) {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        const result = window.game.state.upgradeModule(hardpoint);
        console.log(`[Debug] Upgrade result:`, result);
    },

    /**
     * List all available modules
     */
    listModules() {
        console.log('Available modules:');
        console.log('WEAPONS:', Object.keys(MODULES).filter(id => MODULES[id].category === 'weapon'));
        console.log('SHIELDS:', Object.keys(MODULES).filter(id => MODULES[id].category === 'shield'));
        console.log('ENGINES:', Object.keys(MODULES).filter(id => MODULES[id].category === 'engine'));
        console.log('JUMP DRIVES:', Object.keys(MODULES).filter(id => MODULES[id].category === 'jump_drive'));
        console.log('REACTORS:', Object.keys(MODULES).filter(id => MODULES[id].category === 'reactor'));
        console.log('BRIDGES:', Object.keys(MODULES).filter(id => MODULES[id].category === 'bridge'));
    },

    /**
     * Heal ship to full
     */
    heal() {
        if (!window.game) {
            console.error('[Debug] Game not loaded');
            return;
        }

        window.game.state.ship.health = window.game.state.ship.maxHealth;
        window.game.state.ship.shields.currentLayers = window.game.state.ship.shields.maxLayers;
        window.game.state.ship.shields.currentLayerHP = window.game.state.ship.shields.layerHP;
        window.game.state.notify();
        console.log('[Debug] Ship healed to full health and shields');
    },

    /**
     * Show help
     */
    help() {
        console.log(`
===== DEBUG COMMANDS =====

Combat:
  debug.startCombat()                    - Start combat with pirate scout (threat 1)
  debug.startCombatWith(type, threat)    - Start combat with specific enemy
                                           Types: 'pirate_scout', 'pirate_raider'
                                           Threat: 0-5

Resources:
  debug.addCredits(1000)                 - Add credits (default 1000)
  debug.addScrap(50)                     - Add scrap (default 50)

Modules:
  debug.listModules()                    - List all available modules
  debug.installModule(slot, moduleId)    - Install module
                                           Slots: 'weapon1', 'weapon2', 'shield', 'engine', etc.
  debug.upgradeModule(slot)              - Upgrade module to next tier

Other:
  debug.heal()                           - Heal ship to full health & shields
  debug.help()                           - Show this help

Examples:
  debug.startCombat()
  debug.addCredits(5000)
  debug.installModule('weapon1', 'railgun')
  debug.upgradeModule('shield')
        `);
    }
};

// Auto-show help on load
console.log('%c🚀 DEBUG COMMANDS LOADED', 'color: #00ff55; font-size: 14px; font-weight: bold;');
console.log('%cType debug.help() for available commands', 'color: #ffaa00;');
