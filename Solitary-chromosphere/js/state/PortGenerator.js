/**
 * PortGenerator.js
 * Generates port data: crew, modules, contracts
 * Extracted from GameState.js
 */

class PortGenerator {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Generate port with crew, modules, and contracts
     * @param {Object} planet - Current planet
     * @returns {Object} Port data
     */
    generatePort(planet) {
        return {
            crew: this.generateCrew(),
            modules: this.generateModules(),
            contracts: this.generateContracts(planet)
        };

        availableCrew.push({
            id: 'crew_' + Date.now() + '_' + i,
            name: `${firstName} ${lastName}`,
            role: role,
            cost: 500 + Math.floor(Math.random() * 1000),
            skills: this.generateCrewSkills(role)
        });
    }

        return availableCrew;
    }

/**
 * Generate crew skills based on role
 */
generateCrewSkills(role) {
    const baseSkills = {
        piloting: 1,
        weapons: 1,
        engineering: 1,
        combat: 1,
        medical: 1
    };

    switch (role) {
        case 'Pilot':
            baseSkills.piloting = 3 + Math.floor(Math.random() * 2);
            baseSkills.combat = 2;
            break;
        case 'Engineer':
            baseSkills.engineering = 3 + Math.floor(Math.random() * 2);
            break;
        case 'Weapon Specialist':
            baseSkills.weapons = 3 + Math.floor(Math.random() * 2);
            baseSkills.combat = 2;
            break;
        case 'Medic':
            baseSkills.medical = 3 + Math.floor(Math.random() * 2);
            break;
        default:
            // General staff - balanced
            const skills = ['piloting', 'weapons', 'engineering', 'medical'];
            const boostedSkill = skills[Math.floor(Math.random() * skills.length)];
            baseSkills[boostedSkill] = 2;
            break;
    }

    return baseSkills;
}

/**
 * Generate available modules for sale
 */
generateModules() {
    // For now, return empty - module system defined in modules.js
    return [];
}

/**
 * Generate available contracts
 */
generateContracts(planet) {
    const contracts = [];
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 contracts

    for (let i = 0; i < count; i++) {
        contracts.push(this.generateContract(planet));
    }

    return contracts;
}

/**
 * Generate a single contract
 */
generateContract(planet) {
    const types = ['delivery', 'passenger', 'escort', 'pirate_hunt'];
    const type = types[Math.floor(Math.random() * types.length)];

    const baseReward = 1000 + Math.floor(Math.random() * 2000);
    const distance = 1 + Math.floor(Math.random() * 5); // 1-5 systems away

    return {
        id: 'contract_' + Date.now() + '_' + Math.random(),
        type: type,
        destination: `System-${Math.floor(Math.random() * 100)}`,
        reward: baseReward + (distance * 500),
        distance: distance,
        difficulty: 1 + Math.floor(Math.random() * 3),
        description: this.getContractDescription(type),
        status: 'available'
    };
}

/**
 * Get contract description
 */
getContractDescription(type) {
    switch (type) {
        case 'delivery':
            return 'Deliver cargo to destination';
        case 'passenger':
            return 'Transport passenger safely';
        case 'escort':
            return 'Escort convoy through dangerous space';
        case 'pirate_hunt':
            return 'Eliminate pirate threat';
        default:
            return 'Complete mission objectives';
    }
}

/**
 * Refresh port (generate new crew/contracts)
 */
refreshPort() {
    const newPort = this.generatePort(this.state.currentPlanet);
    this.state.port.crew = newPort.crew;
    this.state.port.contracts = newPort.contracts;

    console.log('[PortGenerator] Port refreshed');
    this.state.saveGame();
    this.state.notify();
}
}
