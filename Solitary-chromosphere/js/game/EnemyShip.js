/**
 * EnemyShip - Enemy vessel class for combat encounters
 * 
 * Ship Types:
 * - pirate_scout: Fast, weak, aggressive
 * - pirate_raider: Balanced, aggressive 
 * - patrol_ship: Defensive, high shields
 * - merchant: Weak, may surrender
 */

class EnemyShip {
    constructor(type = 'pirate_scout', threatLevel = 1) {
        this.type = type;
        this.threatLevel = Math.max(1, Math.min(5, threatLevel)); // 1-5

        // Initialize ship based on type
        const template = this.getShipTemplate(type);

        // Core stats (scaled by threat level)
        this.name = this.generateName(type);
        this.hull = template.hull * (1 + (threatLevel - 1) * 0.3); // +30% per level
        this.maxHull = this.hull;
        this.shields = template.shields;
        this.maxShields = this.shields;
        this.evasion = template.evasion; // 0-0.3 (chance to dodge)

        // Systems
        this.systems = this.generateSystems(template.systems, threatLevel);

        // Weapons
        this.weapons = this.generateWeapons(template.weapons, threatLevel);

        // AI state
        this.aiState = template.defaultAI; // 'aggressive', 'defensive', 'fleeing', 'surrendering'
        this.targetSystem = null;
        this.lastAIDecision = 0;

        // Behavior thresholds
        this.fleeThreshold = 0.2; // Flee when hull < 20%
        this.surrenderChance = template.surrenderChance; // 0-1

        // Loot
        this.scrapValue = Math.floor(50 + threatLevel * 30);
        this.creditReward = Math.floor(100 + threatLevel * 50);
    }

    /**
     * Get ship template by type
     */
    getShipTemplate(type) {
        const templates = {
            pirate_scout: {
                hull: 60,
                shields: 1,
                evasion: 0.15,
                systems: ['weapons', 'engines', 'shields'],
                weapons: ['burst_laser_1'],
                defaultAI: 'aggressive',
                surrenderChance: 0.05
            },
            pirate_raider: {
                hull: 100,
                shields: 2,
                evasion: 0.1,
                systems: ['weapons', 'engines', 'shields', 'bridge'],
                weapons: ['burst_laser_1', 'missile_1'],
                defaultAI: 'aggressive',
                surrenderChance: 0.1
            },
            patrol_ship: {
                hull: 120,
                shields: 3,
                evasion: 0.05,
                systems: ['weapons', 'engines', 'shields', 'bridge', 'life_support'],
                weapons: ['beam_laser_1'],
                defaultAI: 'defensive',
                surrenderChance: 0.02
            },
            merchant: {
                hull: 80,
                shields: 1,
                evasion: 0.05,
                systems: ['engines', 'shields', 'cargo'],
                weapons: ['basic_laser_1'],
                defaultAI: 'defensive',
                surrenderChance: 0.4
            }
        };

        return templates[type] || templates.pirate_scout;
    }

    // ... (rest same as before)
    generateSystems(systemTypes, threatLevel) {
        return systemTypes.map((type, index) => ({
            id: `enemy_${type}_${index}`,
            name: this.getSystemName(type),
            type: type,
            health: 100,
            maxHealth: 100,
            offline: false,
            damaged: false,
            level: Math.min(3, 1 + Math.floor(threatLevel / 2))
        }));
    }

    generateWeapons(weaponTypes, threatLevel) {
        return weaponTypes.map((type, index) => ({
            id: `enemy_weapon_${index}`,
            type: type,
            name: this.getWeaponName(type),
            chargeTime: 4, // Base 4 seconds
            currentCharge: 0,
            damage: this.getWeaponDamage(type, threatLevel),
            shots: this.getWeaponShots(type),
            state: 'idle'
        }));
    }

    getWeaponDamage(type, threatLevel) {
        const baseDamage = {
            basic_laser_1: 15,
            burst_laser_1: 12,
            missile_1: 25,
            beam_laser_1: 8
        };

        return Math.floor((baseDamage[type] || 10) * (1 + threatLevel * 0.1));
    }

    getWeaponShots(type) {
        return { basic_laser_1: 1, burst_laser_1: 2, missile_1: 1, beam_laser_1: 3 }[type] || 1;
    }

    getSystemName(type) {
        const names = {
            weapons: 'Weapons Array',
            engines: 'Engine Control',
            shields: 'Shield Generator',
            bridge: 'Bridge Console',
            life_support: 'Life Support',
            cargo: 'Cargo Bay'
        };
        return names[type] || type;
    }

    getWeaponName(type) {
        const names = {
            basic_laser_1: 'Basic Laser',
            burst_laser_1: 'Burst Laser',
            missile_1: 'Missile Launcher',
            beam_laser_1: 'Beam Laser'
        };
        return names[type] || 'Unknown Weapon';
    }

    generateName(type) {
        const prefixes = {
            pirate_scout: ['Raider', 'Prowler', 'Shadow', 'Ghost'],
            pirate_raider: ['Marauder', 'Corsair', 'Plunderer', 'Scourge'],
            patrol_ship: ['Sentinel', 'Guardian', 'Watcher', 'Defender'],
            merchant: ['Trader', 'Voyager', 'Carrier', 'Hauler']
        };

        const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${prefix} ${suffix}`;
    }

    takeDamage(damage) {
        if (Math.random() < this.evasion) {
            return { evaded: true, absorbed: 0, hullDamage: 0 };
        }

        let remaining = damage;
        let absorbed = 0;

        if (this.shields > 0) {
            this.shields--;
            absorbed = damage;
            remaining = 0;
        }

        if (remaining > 0) {
            this.hull = Math.max(0, this.hull - remaining);
        }

        return { evaded: false, absorbed, hullDamage: remaining };
    }

    damageSystem(systemId, damage) {
        const system = this.systems.find(s => s.id === systemId);
        if (!system) return false;

        system.health = Math.max(0, system.health - damage);
        if (system.health === 0) system.offline = true;
        else if (system.health < 50) system.damaged = true;

        return true;
    }

    isDestroyed() { return this.hull <= 0; }
    shouldFlee() { return (this.hull / this.maxHull) < this.fleeThreshold && this.hasWorkingEngines(); }
    shouldSurrender() { return (this.hull / this.maxHull) <= 0.3 && Math.random() < this.surrenderChance; }
    hasWorkingEngines() { const e = this.systems.find(s => s.type === 'engines'); return e && !e.offline; }
    getActiveWeapons() { const w = this.systems.find(s => s.type === 'weapons'); return (!w || w.offline) ? [] : this.weapons; }

    updateAIState(playerShip) {
        if (this.shouldSurrender()) { this.aiState = 'surrendering'; return; }
        if (this.shouldFlee()) { this.aiState = 'fleeing'; return; }

        const hullPercent = this.hull / this.maxHull;
        this.aiState = (hullPercent < 0.4 && this.type !== 'pirate_raider') ? 'defensive' :
            (this.type.includes('pirate') ? 'aggressive' : 'defensive');
    }

    tickWeapons(dt) {
        this.weapons.forEach(weapon => {
            if (weapon.state === 'charging') {
                weapon.currentCharge += dt;
                if (weapon.currentCharge >= weapon.chargeTime) {
                    weapon.state = 'ready';
                    weapon.currentCharge = weapon.chargeTime;
                }
            }
        });
    }

    chargeWeapon(weaponId) {
        const weapon = this.weapons.find(w => w.id === weaponId);
        if (!weapon || weapon.state !== 'idle') return false;
        weapon.state = 'charging';
        weapon.currentCharge = 0;
        return true;
    }

    fireWeapon(weaponId) {
        const weapon = this.weapons.find(w => w.id === weaponId);
        if (!weapon || weapon.state !== 'ready') return null;

        weapon.state = 'idle';
        weapon.currentCharge = 0;
        return { damage: weapon.damage, shots: weapon.shots, type: weapon.type };
    }
}
