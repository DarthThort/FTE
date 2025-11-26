class PortGenerator {
    constructor(gameState) {
        this.state = gameState;
    }

    generatePortContent() {
        this.state.port.ships = [
            { id: 1, name: "Kestrel Class", type: "Frigate", cost: 1500, hull: 100, slots: 4, desc: "Versatile starter ship." },
            { id: 2, name: "Mantis Class", type: "Interceptor", cost: 800, hull: 60, slots: 2, desc: "Fast and deadly." },
            { id: 3, name: "Behemoth Class", type: "Hauler", cost: 2500, hull: 200, slots: 6, desc: "Heavy cargo transport." }
        ];

        this.state.port.crew = [
            {
                id: 1,
                name: "Bolt",
                species: "Human",
                gender: "Male",
                age: 32,
                role: "Engineer",
                health: 100,
                maxHealth: 100,
                morale: 85,
                cost: 150,
                skills: {
                    engineering: { level: 5, xp: 0, xpToNext: 100 },
                    piloting: { level: 2, xp: 0, xpToNext: 100 },
                    combat: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Former military engineer turned freelancer."
            },
            {
                id: 2,
                name: "Nova",
                species: "Human",
                gender: "Female",
                age: 28,
                role: "Pilot",
                health: 100,
                maxHealth: 100,
                morale: 90,
                cost: 200,
                skills: {
                    piloting: { level: 7, xp: 0, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    combat: { level: 3, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Ace pilot with racing history."
            },
            {
                id: 3,
                name: "Xar'thos",
                species: "Alien",
                gender: "Male",
                age: 45,
                role: "Gunner",
                health: 120,
                maxHealth: 120,
                morale: 75,
                cost: 180,
                skills: {
                    combat: { level: 6, xp: 0, xpToNext: 100 },
                    piloting: { level: 2, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Veteran soldier seeking new horizons."
            },
            {
                id: 4,
                name: "Dr. Chen",
                species: "Human",
                gender: "Female",
                age: 41,
                role: "Medic",
                health: 90,
                maxHealth: 90,
                morale: 95,
                cost: 220,
                skills: {
                    medical: { level: 8, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    piloting: { level: 1, xp: 0, xpToNext: 100 },
                    combat: { level: 2, xp: 0, xpToNext: 100 }
                },
                background: "Experienced field medic from the outer colonies."
            },
            {
                id: 5,
                name: "Rax",
                species: "Robot",
                gender: "N/A",
                age: 12,
                role: "Engineer",
                health: 150,
                maxHealth: 150,
                morale: 100,
                cost: 300,
                skills: {
                    engineering: { level: 9, xp: 50, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    combat: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 0, xp: 0, xpToNext: 100 }
                },
                background: "Advanced maintenance droid with adaptive learning."
            },
            {
                id: 6,
                name: "Luna Swift",
                species: "Human",
                gender: "Female",
                age: 24,
                role: "Pilot",
                health: 95,
                maxHealth: 95,
                morale: 88,
                cost: 160,
                skills: {
                    piloting: { level: 6, xp: 30, xpToNext: 100 },
                    combat: { level: 4, xp: 0, xpToNext: 100 },
                    engineering: { level: 1, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Young hotshot pilot looking for adventure."
            },
            {
                id: 7,
                name: "Grimm",
                species: "Alien",
                gender: "Male",
                age: 52,
                role: "Gunner",
                health: 140,
                maxHealth: 140,
                morale: 70,
                cost: 190,
                skills: {
                    combat: { level: 8, xp: 80, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Grizzled mercenary with countless battles under his belt."
            },
            {
                id: 8,
                name: "Kai",
                species: "Human",
                gender: "Male",
                age: 29,
                role: "Engineer",
                health: 100,
                maxHealth: 100,
                morale: 82,
                cost: 140,
                skills: {
                    engineering: { level: 4, xp: 60, xpToNext: 100 },
                    piloting: { level: 3, xp: 0, xpToNext: 100 },
                    combat: { level: 2, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Self-taught mechanic from a backwater station."
            },
            {
                id: 9,
                name: "Zara",
                species: "Alien",
                gender: "Female",
                age: 35,
                role: "Medic",
                health: 85,
                maxHealth: 85,
                morale: 92,
                cost: 175,
                skills: {
                    medical: { level: 6, xp: 40, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    piloting: { level: 1, xp: 0, xpToNext: 100 },
                    combat: { level: 3, xp: 0, xpToNext: 100 }
                },
                background: "Compassionate healer with knowledge of alien biology."
            },
            {
                id: 10,
                name: "Ghost",
                species: "Human",
                gender: "Male",
                age: 38,
                role: "Pilot",
                health: 80,
                maxHealth: 80,
                morale: 65,
                cost: 250,
                skills: {
                    piloting: { level: 9, xp: 90, xpToNext: 100 },
                    combat: { level: 5, xp: 50, xpToNext: 100 },
                    engineering: { level: 2, xp: 0, xpToNext: 100 },
                    medical: { level: 1, xp: 0, xpToNext: 100 }
                },
                background: "Mysterious pilot who rarely speaks of their past."
            }
        ];

        this.state.port.contracts = [
            { id: 1, title: "Cargo Haul", description: "Deliver supplies to Sector 7.", reward: 500, difficulty: 1 },
            { id: 2, title: "Bounty Hunt", description: "Destroy the pirate vessel 'Red Skull'.", reward: 1200, difficulty: 3 },
            { id: 3, title: "Escort Duty", description: "Protect the mining convoy.", reward: 800, difficulty: 2 }
        ];
    }

    // Procedural crew generation
    generateProceduralCrew(count, systemId, planetId) {
        const crew = [];
        const seed = `${systemId}-${planetId}`;

        // Name pools
        const firstNames = ['Alex', 'Sam', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Avery',
            'Jin', 'Kai', 'Yuki', 'Nova', 'Zara', 'Rax', 'Luna', 'Orion', 'Atlas',
            'Echo', 'Vega', 'Lyra', 'Phoenix', 'Drake', 'Bolt', 'Cipher', 'Ghost'];
        const lastNames = ['Chen', 'Smith', 'Patel', 'García', 'Kim', 'Silva', 'Müller', 'O\'Brien',
            'Tanaka', 'Swift', 'Stone', 'Rivers', 'Steele', 'Void', 'Star', 'Storm',
            'Hawk', 'Wolf', 'Frost', 'Blaze', 'Grimm', 'Vale', 'Knight'];

        const species = [
            { name: 'Human', healthMod: 0, moraleMod: 0 },
            { name: 'Alien', healthMod: 20, moraleMod: -10 },
            { name: 'Robot', healthMod: 50, moraleMod: 20 },
            { name: 'Cyborg', healthMod: 10, moraleMod: -5 }
        ];

        const genders = ['Male', 'Female', 'N/A'];
        const roles = ['Engineer', 'Pilot', 'Gunner', 'Medic'];

        for (let i = 0; i < count; i++) {
            const randomSeed = this.hashCode(seed + i);
            const speciesData = species[Math.abs(randomSeed) % species.length];
            const role = roles[Math.abs(randomSeed >> 4) % roles.length];
            const gender = speciesData.name === 'Robot' ? 'N/A' : genders[Math.abs(randomSeed >> 8) % 2];

            const firstNameSeed = this.hashCode(`${seed}-fn-${i}`);
            const lastNameSeed = this.hashCode(`${seed}-ln-${i}`);
            const firstName = firstNames[Math.abs(firstNameSeed) % firstNames.length];
            const lastName = lastNames[Math.abs(lastNameSeed) % lastNames.length];
            const name = `${firstName} ${lastName}`;

            const age = 20 + (Math.abs(randomSeed >> 20) % 40);
            const baseCost = 100 + (Math.abs(randomSeed >> 24) % 200);

            const skills = this.generateSkills(role, randomSeed);
            const primarySkill = this.getRolePrimarySkill(role);
            const skillBonus = (skills[primarySkill].level - 3) * 30;
            const cost = baseCost + skillBonus;

            const baseHealth = 100;
            const health = baseHealth + speciesData.healthMod;
            const baseMorale = 70 + (Math.abs(randomSeed >> 28) % 30);
            const morale = Math.max(50, Math.min(100, baseMorale + speciesData.moraleMod));

            crew.push({
                id: Date.now() + randomSeed + i,
                name: name,
                species: speciesData.name,
                gender: gender,
                age: age,
                role: role,
                health: health,
                maxHealth: health,
                morale: morale,
                cost: cost,
                skills: skills,
                background: this.generateBackground(role, randomSeed)
            });
        }

        return crew;
    }

    generateSkills(role, seed) {
        const primary = this.getRolePrimarySkill(role);
        const primaryLevel = 3 + (Math.abs(seed) % 7); // 3-9
        const secondaryLevel = 1 + (Math.abs(seed >> 5) % 3); // 1-3
        const tertiaryLevel = 1 + (Math.abs(seed >> 10) % 2); // 1-2

        const skills = {
            engineering: { level: secondaryLevel, xp: 0, xpToNext: 100 },
            piloting: { level: secondaryLevel, xp: 0, xpToNext: 100 },
            combat: { level: tertiaryLevel, xp: 0, xpToNext: 100 },
            medical: { level: tertiaryLevel, xp: 0, xpToNext: 100 }
        };

        // Set primary skill
        skills[primary].level = primaryLevel;

        return skills;
    }

    getRolePrimarySkill(role) {
        const skillMap = {
            'Engineer': 'engineering',
            'Pilot': 'piloting',
            'Gunner': 'combat',
            'Medic': 'medical'
        };
        return skillMap[role] || 'engineering';
    }

    generateBackground(role, seed) {
        const templates = [
            "Former military {role} seeking new adventures.",
            "Self-taught {role} from a backwater colony.",
            "Experienced {role} with a mysterious past.",
            "Young hotshot {role} looking to make a name.",
            "Veteran {role} from the outer rim.",
            "Freelance {role} with a checkered history.",
            "Skilled {role} escaping a dark past.",
            "Ambitious {role} chasing fortune and glory.",
            "Grizzled {role} with countless missions completed.",
            "Reformed pirate turned {role}.",
            "Academy-trained {role} seeking real-world experience.",
            "Corporate deserter working as a {role}.",
            "Wandering {role} in search of purpose.",
            "Elite {role} fallen on hard times.",
            "Compassionate {role} helping those in need."
        ];

        const template = templates[Math.abs(seed) % templates.length];
        return template.replace('{role}', role.toLowerCase());
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}
