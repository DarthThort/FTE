/**
 * Encounter Types - Templates for different encounter scenarios
 * Used by EncounterManager to generate varied encounters based on system threat level
 */

const ENCOUNTER_TYPES = {
    // === HOSTILE ENCOUNTERS ===

    PIRATE_AGGRESSIVE: {
        id: 'pirate_aggressive',
        type: 'combat',
        category: 'hostile',
        enemyType: 'pirate_raider',
        canNegotiate: false,
        skipDialogue: true,
        message: "⚔️ Pirate vessel locks weapons! No time to talk!",
        threatWeight: 0.8  // More common in high threat
    },

    PIRATE_EXTORTION: {
        id: 'pirate_extortion',
        type: 'dialogue',
        category: 'hostile',
        enemyType: 'pirate_scout',
        canNegotiate: true,
        demandCredits: 50,
        message: "💰 Pirates hail you: 'Pay up or prepare to fight!'",
        threatWeight: 0.5
    },

    PIRATE_AMBUSH: {
        id: 'pirate_ambush',
        type: 'combat',
        category: 'hostile',
        enemyType: 'pirate_raider',
        canNegotiate: false,
        skipDialogue: true,
        firstStrike: true,  // Pirates attack first
        message: "🚨 Ambush! Pirates were lying in wait!",
        threatWeight: 0.3
    },

    // === NEUTRAL ENCOUNTERS ===

    DISTRESS_SIGNAL: {
        id: 'distress_signal',
        type: 'help',
        category: 'neutral',
        rewardChance: 0.7,
        rewards: {
            credits: { min: 50, max: 150 },
            scrap: { min: 10, max: 30 }
        },
        cost: {
            scrap: 10,
            fuel: 5
        },
        message: "🆘 Distress signal detected: 'Engine failure! Need assistance!'",
        threatWeight: 0.4
    },

    MERCHANT_TRADER: {
        id: 'merchant_trader',
        type: 'trade',
        category: 'neutral',
        hasSpecialGoods: true,
        discount: 0.1,  // 10% off market prices
        message: "🛒 Independent trader hails: 'Looking to buy or sell?'",
        threatWeight: 0.6
    },

    REFUGEE_SHIP: {
        id: 'refugee_ship',
        type: 'refugee',
        category: 'neutral',
        passengerCount: { min: 1, max: 3 },
        rewardPerPassenger: 30,
        message: "👨‍👩‍👧 Refugee ship requests passage to nearest station.",
        threatWeight: 0.3
    },

    EXPLORATION_ANOMALY: {
        id: 'anomaly',
        type: 'anomaly',
        category: 'neutral',
        isRandom: true,
        outcomes: [
            { type: 'loot', chance: 0.3, reward: { scrap: 50 } },
            { type: 'damage', chance: 0.2, damage: 10 },
            { type: 'fuel', chance: 0.2, fuel: 15 },
            { type: 'nothing', chance: 0.3 }
        ],
        message: "❓ Strange readings detected. Investigate?",
        threatWeight: 0.2
    },

    // === FRIENDLY ENCOUNTERS ===

    PATROL_FRIENDLY: {
        id: 'patrol_friendly',
        type: 'dialogue',
        category: 'friendly',
        canTrade: false,
        infoReward: true,  // Gives intel about nearby systems
        message: "🛡️ System patrol hails: 'Everything alright, captain?'",
        threatWeight: 0.5  // Only in low threat areas
    },

    SCIENTIST_SHIP: {
        id: 'scientist_ship',
        type: 'quest',
        category: 'friendly',
        questType: 'delivery',
        reward: { credits: 100, scrap: 20 },
        message: "🔬 Research vessel requests delivery of samples to station.",
        threatWeight: 0.2
    },

    DAMAGED_FREIGHTER: {
        id: 'damaged_freighter',
        type: 'help',
        category: 'neutral',
        rewardChance: 0.5,
        rewards: {
            credits: { min: 100, max: 200 },
            cargo: true  // Random cargo item
        },
        cost: {
            scrap: 15
        },
        message: "📦 Damaged freighter: 'Hull breach! Can you spare parts?'",
        threatWeight: 0.3
    }
};

// Helper to get encounters by threat level
function getEncountersByThreatLevel(threatLevel) {
    const encounters = [];

    // High threat (4-5): Mostly pirates
    if (threatLevel >= 4) {
        encounters.push(
            { type: ENCOUNTER_TYPES.PIRATE_AGGRESSIVE, weight: 5 },
            { type: ENCOUNTER_TYPES.PIRATE_AMBUSH, weight: 2 },
            { type: ENCOUNTER_TYPES.PIRATE_EXTORTION, weight: 2 },
            { type: ENCOUNTER_TYPES.EXPLORATION_ANOMALY, weight: 1 }
        );
    }
    // Medium threat (2-3): Mixed
    else if (threatLevel >= 2) {
        encounters.push(
            { type: ENCOUNTER_TYPES.PIRATE_EXTORTION, weight: 3 },
            { type: ENCOUNTER_TYPES.PIRATE_AGGRESSIVE, weight: 2 },
            { type: ENCOUNTER_TYPES.DISTRESS_SIGNAL, weight: 2 },
            { type: ENCOUNTER_TYPES.MERCHANT_TRADER, weight: 2 },
            { type: ENCOUNTER_TYPES.DAMAGED_FREIGHTER, weight: 1 }
        );
    }
    // Low threat (0-1): Mostly peaceful
    else {
        encounters.push(
            { type: ENCOUNTER_TYPES.MERCHANT_TRADER, weight: 4 },
            { type: ENCOUNTER_TYPES.DISTRESS_SIGNAL, weight: 3 },
            { type: ENCOUNTER_TYPES.REFUGEE_SHIP, weight: 2 },
            { type: ENCOUNTER_TYPES.PATROL_FRIENDLY, weight: 2 },
            { type: ENCOUNTER_TYPES.SCIENTIST_SHIP, weight: 1 },
            { type: ENCOUNTER_TYPES.EXPLORATION_ANOMALY, weight: 1 },
            { type: ENCOUNTER_TYPES.PIRATE_EXTORTION, weight: 1 }
        );
    }

    return encounters;
}

// Weighted random selection
function selectRandomEncounter(threatLevel) {
    const encounters = getEncountersByThreatLevel(threatLevel);
    const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);

    let random = Math.random() * totalWeight;

    for (const encounter of encounters) {
        random -= encounter.weight;
        if (random <= 0) {
            return encounter.type;
        }
    }

    return encounters[0].type; // Fallback
}
