/**
 * ModuleDefinitions.js
 * 
 * Defines all purchasable ship modules with stats, prices, and tier information.
 * Modules can be bought from stations and installed in ship hardpoints.
 */

const MODULE_CATEGORIES = {
    WEAPON: 'weapon',
    SHIELD: 'shield',
    ENGINE: 'engine',
    JUMP_DRIVE: 'jump_drive',
    REACTOR: 'reactor',
    BRIDGE: 'bridge'
};

/**
 * All available modules in the game
 */
const MODULES = {
    // ========== WEAPONS ==========

    'laser_mk1': {
        id: 'laser_mk1',
        name: 'Laser Cannon Mk1',
        category: MODULE_CATEGORIES.WEAPON,
        tier: 1,
        stats: {
            shieldDamage: 8,
            hullDamage: 4,
            chargeTime: 8,
            cooldown: 2,
            shots: 1,
            fireRate: 1.0,
            projectileSpeed: 500,
            projectileColor: '#ff4444',
            energyCost: 1
        },
        price: 500,
        scrapCost: 0,
        description: 'Standard energy weapon with balanced damage output'
    },

    'ion_cannon': {
        id: 'ion_cannon',
        name: 'Ion Cannon',
        category: MODULE_CATEGORIES.WEAPON,
        tier: 2,
        stats: {
            shieldDamage: 15,
            hullDamage: 2,
            chargeTime: 10,
            cooldown: 3,
            shots: 1,
            fireRate: 0.8,
            projectileSpeed: 400,
            projectileColor: '#00ffff',
            ionChance: 0.3, // 30% chance to ionize enemy system
            energyCost: 2
        },
        price: 1200,
        scrapCost: 0,
        description: 'Devastating against shields. Can ionize enemy systems.'
    },

    'railgun': {
        id: 'railgun',
        name: 'Railgun',
        category: MODULE_CATEGORIES.WEAPON,
        tier: 2,
        stats: {
            shieldDamage: 3,
            hullDamage: 12,
            fireRate: 0.6,
            projectileSpeed: 800,
            projectileColor: '#ffff00',
            piercing: true, // Ignores 50% of shields
            energyCost: 2
        },
        price: 1500,
        scrapCost: 0,
        description: 'Kinetic weapon that pierces shields and demolishes hull'
    },

    'plasma_cannon': {
        id: 'plasma_cannon',
        name: 'Plasma Cannon',
        category: MODULE_CATEGORIES.WEAPON,
        tier: 3,
        stats: {
            shieldDamage: 10,
            hullDamage: 10,
            fireRate: 0.9,
            projectileSpeed: 450,
            projectileColor: '#ff00ff',
            burnDamage: 2, // 2 damage over 3 seconds
            burnDuration: 3,
            energyCost: 3
        },
        price: 2500,
        scrapCost: 0,
        description: 'High-tier balanced weapon with burn effect over time'
    },

    'pulse_laser': {
        id: 'pulse_laser',
        name: 'Pulse Laser',
        category: MODULE_CATEGORIES.WEAPON,
        tier: 2,
        stats: {
            shieldDamage: 6,
            hullDamage: 6,
            fireRate: 1.5, // Fast fire rate
            projectileSpeed: 600,
            projectileColor: '#ff8800',
            burstCount: 3, // Fires 3 shots per trigger
            energyCost: 1
        },
        price: 1000,
        scrapCost: 0,
        description: 'Rapid-fire laser with burst mode. Great sustained damage.'
    },

    // ========== SHIELDS ==========

    'shield_basic': {
        id: 'shield_basic',
        name: 'Basic Shield Generator',
        category: MODULE_CATEGORIES.SHIELD,
        tier: 1,
        stats: {
            layers: 2,
            rechargeRate: 5,
            rechargeDelay: 3,
            powerCost: 2
        },
        price: 0, // Default equipment
        scrapCost: 20,
        upgradeTo: 'shield_advanced',
        description: 'Standard 2-layer shield protection with basic recharge'
    },

    'shield_advanced': {
        id: 'shield_advanced',
        name: 'Advanced Shield Array',
        category: MODULE_CATEGORIES.SHIELD,
        tier: 2,
        stats: {
            layers: 3,
            rechargeRate: 7,
            rechargeDelay: 2.5,
            powerCost: 3
        },
        price: 2000,
        scrapCost: 40,
        upgradeTo: 'shield_military',
        description: '3 shield layers with faster recharge rate'
    },

    'shield_military': {
        id: 'shield_military',
        name: 'Military Shield Grid',
        category: MODULE_CATEGORIES.SHIELD,
        tier: 3,
        stats: {
            layers: 4,
            rechargeRate: 10,
            rechargeDelay: 2,
            powerCost: 4
        },
        price: 4000,
        scrapCost: 60,
        upgradeTo: 'shield_experimental',
        description: 'Military-grade 4-layer protection with rapid recharge'
    },

    'shield_experimental': {
        id: 'shield_experimental',
        name: 'Experimental Shields',
        category: MODULE_CATEGORIES.SHIELD,
        tier: 4,
        stats: {
            layers: 5,
            rechargeRate: 12,
            rechargeDelay: 1.5,
            powerCost: 5
        },
        price: 7000,
        scrapCost: 0,
        description: 'Cutting-edge 5-layer shield with minimal recharge delay'
    },

    // ========== ENGINES ==========

    'engine_basic': {
        id: 'engine_basic',
        name: 'Standard Drive',
        category: MODULE_CATEGORIES.ENGINE,
        tier: 1,
        stats: {
            fleeBonus: 0,
            evasionBonus: 0,
            powerCost: 1
        },
        price: 0, // Default equipment
        scrapCost: 15,
        upgradeTo: 'engine_improved',
        description: 'Basic propulsion system'
    },

    'engine_improved': {
        id: 'engine_improved',
        name: 'Improved Thrusters',
        category: MODULE_CATEGORIES.ENGINE,
        tier: 2,
        stats: {
            fleeBonus: 0.10,
            evasionBonus: 0.05,
            powerCost: 2
        },
        price: 1000,
        scrapCost: 30,
        upgradeTo: 'engine_advanced',
        description: 'Enhanced engines. +10% flee chance, +5% evasion'
    },

    'engine_advanced': {
        id: 'engine_advanced',
        name: 'Advanced Drive System',
        category: MODULE_CATEGORIES.ENGINE,
        tier: 3,
        stats: {
            fleeBonus: 0.20,
            evasionBonus: 0.10,
            powerCost: 2
        },
        price: 2500,
        scrapCost: 50,
        upgradeTo: 'engine_experimental',
        description: 'High-performance drives. +20% flee, +10% evasion'
    },

    'engine_experimental': {
        id: 'engine_experimental',
        name: 'Experimental Boosters',
        category: MODULE_CATEGORIES.ENGINE,
        tier: 4,
        stats: {
            fleeBonus: 0.30,
            evasionBonus: 0.15,
            powerCost: 3
        },
        price: 5000,
        scrapCost: 0,
        description: 'Bleeding-edge propulsion. +30% flee, +15% evasion'
    },

    // ========== JUMP DRIVES ==========

    'jumpdrive_basic': {
        id: 'jumpdrive_basic',
        name: 'Basic Jump Drive',
        category: MODULE_CATEGORIES.JUMP_DRIVE,
        tier: 1,
        stats: {
            jumpRange: 6,
            fuelCost: 10
        },
        price: 0, // Default equipment
        scrapCost: 15,
        upgradeTo: 'jumpdrive_improved',
        description: 'Standard FTL drive with 6 LY range'
    },

    'jumpdrive_improved': {
        id: 'jumpdrive_improved',
        name: 'Enhanced Jump Drive',
        category: MODULE_CATEGORIES.JUMP_DRIVE,
        tier: 2,
        stats: {
            jumpRange: 10,
            fuelCost: 12
        },
        price: 1500,
        scrapCost: 30,
        upgradeTo: 'jumpdrive_advanced',
        description: 'Improved FTL capabilities. 10 LY jump range'
    },

    'jumpdrive_advanced': {
        id: 'jumpdrive_advanced',
        name: 'Advanced Warp Core',
        category: MODULE_CATEGORIES.JUMP_DRIVE,
        tier: 3,
        stats: {
            jumpRange: 15,
            fuelCost: 15
        },
        price: 3500,
        scrapCost: 50,
        upgradeTo: 'jumpdrive_military',
        description: 'Long-range warp drive. 15 LY jump range'
    },

    'jumpdrive_military': {
        id: 'jumpdrive_military',
        name: 'Military Jump Core',
        category: MODULE_CATEGORIES.JUMP_DRIVE,
        tier: 4,
        stats: {
            jumpRange: 20,
            fuelCost: 18
        },
        price: 6000,
        scrapCost: 0,
        description: 'Military-grade deep space drive. 20 LY range'
    },

    // ========== REACTORS ==========

    'reactor_basic': {
        id: 'reactor_basic',
        name: 'Basic Reactor',
        category: MODULE_CATEGORIES.REACTOR,
        tier: 1,
        stats: {
            maxPower: 8
        },
        price: 0, // Default equipment
        scrapCost: 25,
        upgradeTo: 'reactor_improved',
        description: 'Standard power core. 8 power units'
    },

    'reactor_improved': {
        id: 'reactor_improved',
        name: 'Improved Reactor',
        category: MODULE_CATEGORIES.REACTOR,
        tier: 2,
        stats: {
            maxPower: 12
        },
        price: 2000,
        scrapCost: 45,
        upgradeTo: 'reactor_advanced',
        description: 'Enhanced power generation. 12 power units'
    },

    'reactor_advanced': {
        id: 'reactor_advanced',
        name: 'Advanced Reactor Core',
        category: MODULE_CATEGORIES.REACTOR,
        tier: 3,
        stats: {
            maxPower: 16
        },
        price: 4500,
        scrapCost: 65,
        upgradeTo: 'reactor_experimental',
        description: 'High-output power core. 16 power units'
    },

    'reactor_experimental': {
        id: 'reactor_experimental',
        name: 'Fusion Reactor',
        category: MODULE_CATEGORIES.REACTOR,
        tier: 4,
        stats: {
            maxPower: 20
        },
        price: 8000,
        scrapCost: 0,
        description: 'Experimental fusion power. 20 power units'
    },

    // ========== BRIDGE ==========

    'bridge_basic': {
        id: 'bridge_basic',
        name: 'Standard Bridge',
        category: MODULE_CATEGORIES.BRIDGE,
        tier: 1,
        stats: {
            o2Regen: 1.0,
            dialogueBonus: 0,
            scanRange: 1.0
        },
        price: 0, // Default equipment
        scrapCost: 20,
        upgradeTo: 'bridge_improved',
        description: 'Basic command center with standard life support'
    },

    'bridge_improved': {
        id: 'bridge_improved',
        name: 'Command Bridge',
        category: MODULE_CATEGORIES.BRIDGE,
        tier: 2,
        stats: {
            o2Regen: 1.5,
            dialogueBonus: 0.05,
            scanRange: 1.5
        },
        price: 1800,
        scrapCost: 35,
        upgradeTo: 'bridge_advanced',
        description: '+50% O2 regen, +5% dialogue success, better sensors'
    },

    'bridge_advanced': {
        id: 'bridge_advanced',
        name: 'Advanced CIC',
        category: MODULE_CATEGORIES.BRIDGE,
        tier: 3,
        stats: {
            o2Regen: 2.0,
            dialogueBonus: 0.10,
            scanRange: 2.0
        },
        price: 4000,
        scrapCost: 55,
        upgradeTo: 'bridge_command',
        description: '+100% O2 regen, +10% dialogue, advanced sensors'
    },

    'bridge_command': {
        id: 'bridge_command',
        name: 'Flag Bridge',
        category: MODULE_CATEGORIES.BRIDGE,
        tier: 4,
        stats: {
            o2Regen: 2.5,
            dialogueBonus: 0.15,
            scanRange: 3.0
        },
        price: 7000,
        scrapCost: 0,
        description: 'Command-level bridge. +150% O2, +15% dialogue, long-range sensors'
    }
};

/**
 * Get module by ID
 */
function getModule(moduleId) {
    return MODULES[moduleId] || null;
}

/**
 * Get all modules of a specific category
 */
function getModulesByCategory(category) {
    return Object.values(MODULES).filter(m => m.category === category);
}

/**
 * Get modules by tier
 */
function getModulesByTier(tier) {
    return Object.values(MODULES).filter(m => m.tier === tier);
}

/**
 * Get all weapon modules
 */
function getWeaponModules() {
    return getModulesByCategory(MODULE_CATEGORIES.WEAPON);
}

/**
 * Get all shield modules
 */
function getShieldModules() {
    return getModulesByCategory(MODULE_CATEGORIES.SHIELD);
}

/**
 * Get all engine modules
 */
function getEngineModules() {
    return getModulesByCategory(MODULE_CATEGORIES.ENGINE);
}

/**
 * Generate random module selection for shop
 * @param {number} count - Number of modules per category
 * @returns {Array} Array of module IDs available in shop
 */
function generateShopStock(count = 3) {
    const stock = [];

    // For each category, pick random modules
    Object.values(MODULE_CATEGORIES).forEach(category => {
        const categoryModules = getModulesByCategory(category);

        // Exclude tier 1 (default equipment) from shop unless it's weapons
        const shopModules = category === MODULE_CATEGORIES.WEAPON
            ? categoryModules
            : categoryModules.filter(m => m.tier > 1);

        // Randomly select up to 'count' modules
        const selected = [];
        while (selected.length < Math.min(count, shopModules.length)) {
            const random = shopModules[Math.floor(Math.random() * shopModules.length)];
            if (!selected.includes(random.id)) {
                selected.push(random.id);
            }
        }

        stock.push(...selected);
    });

    return stock;
}
