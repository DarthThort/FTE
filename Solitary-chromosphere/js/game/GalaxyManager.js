class GalaxyManager {
    constructor(gameState) {
        this.state = gameState;
    }

    initializeGalaxy() {
        // Real Star Systems Data (Sol + 9 closest)
        const REAL_STARS = [
            { id: 'sol', name: 'Sol', x: 0, y: 0, type: 'Yellow Star', color: '#ffdd44', realDist: 0 },
            { id: 'alpha_centauri', name: 'Alpha Centauri', x: 4, y: 2, type: 'Binary System', color: '#ff88ff', realDist: 4.37 },
            { id: 'barnards_star', name: "Barnard's Star", x: -2, y: 5, type: 'Red Dwarf', color: '#ff4444', realDist: 5.96 },
            { id: 'wolf_359', name: 'Wolf 359', x: 6, y: -4, type: 'Red Dwarf', color: '#ff4444', realDist: 7.78 },
            { id: 'lalande_21185', name: 'Lalande 21185', x: -5, y: -6, type: 'Red Dwarf', color: '#ff4444', realDist: 8.29 },
            { id: 'sirius', name: 'Sirius', x: -3, y: 8, type: 'Blue Giant', color: '#4444ff', realDist: 8.6 },
            { id: 'luyten_726_8', name: 'Luyten 726-8', x: 8, y: 3, type: 'Binary System', color: '#ff88ff', realDist: 8.73 },
            { id: 'ross_154', name: 'Ross 154', x: 2, y: -9, type: 'Red Dwarf', color: '#ff4444', realDist: 9.68 },
            { id: 'ross_248', name: 'Ross 248', x: -9, y: 1, type: 'Red Dwarf', color: '#ff4444', realDist: 10.32 },
            { id: 'epsilon_eridani', name: 'Epsilon Eridani', x: 7, y: 7, type: 'Yellow Star', color: '#ffdd44', realDist: 10.52 }
        ];

        const systems = REAL_STARS.map(star => ({
            ...star,
            visited: star.id === 'sol',
            planets: [], // Will be populated below
            resources: Math.random() > 0.5 ? ['Iron', 'Ice'] : ['Gold', 'Titanium']
        }));

        // Populate Sol System
        const solSystem = systems.find(s => s.id === 'sol');
        solSystem.planets = [
            { id: 'mercury', name: 'Mercury', type: 'Barren', color: '#aaaaaa', distance: 30, hasStation: false },
            { id: 'venus', name: 'Venus', type: 'Toxic', color: '#eebb00', distance: 50, hasStation: false },
            { id: 'earth', name: 'Earth', type: 'Terran', color: '#00aaff', distance: 80, hasStation: true },
            { id: 'mars', name: 'Mars', type: 'Desert', color: '#ff4400', distance: 110, hasStation: true },
            { id: 'jupiter', name: 'Jupiter', type: 'Gas Giant', color: '#ddaa88', distance: 180, hasStation: false },
            { id: 'saturn', name: 'Saturn', type: 'Gas Giant', color: '#eecc88', distance: 240, hasStation: false },
            { id: 'uranus', name: 'Uranus', type: 'Ice Giant', color: '#88ffff', distance: 300, hasStation: false },
            { id: 'neptune', name: 'Neptune', type: 'Ice Giant', color: '#4444ff', distance: 360, hasStation: false }
        ];

        // Populate other systems procedurally
        systems.forEach(system => {
            if (system.id !== 'sol') {
                const numPlanets = Math.floor(Math.random() * 3) + 3; // 3-5 planets
                const planets = [];

                for (let i = 0; i < numPlanets; i++) {
                    planets.push({
                        id: `${system.id}_p${i}`,
                        name: `${system.name} ${['I', 'II', 'III', 'IV', 'V'][i]}`,
                        type: ['Barren', 'Desert', 'Ice', 'Terran', 'Gas Giant'][Math.floor(Math.random() * 5)],
                        color: ['#aaaaaa', '#ff4400', '#88ffff', '#00aaff', '#ddaa88'][Math.floor(Math.random() * 5)],
                        distance: 40 + (i * 50),
                        hasStation: false // Will be set below
                    });
                }

                // Ensure at least 2-3 stations per system
                const numStations = Math.floor(Math.random() * 2) + 2; // 2-3 stations
                const stationIndices = [];
                while (stationIndices.length < Math.min(numStations, planets.length)) {
                    const idx = Math.floor(Math.random() * planets.length);
                    if (!stationIndices.includes(idx)) {
                        stationIndices.push(idx);
                        planets[idx].hasStation = true;
                        // Generate unique market for this station
                        planets[idx].market = Economy.generateStationMarket(planets[idx].id, system.id);
                    }
                }
                system.planets = planets;
            }
        });

        // Generate markets for Sol system stations
        solSystem.planets.forEach(planet => {
            if (planet.hasStation) {
                planet.market = Economy.generateStationMarket(planet.id, solSystem.id);
            }
        });

        // Set state
        this.state.galaxy = systems;
        this.state.currentSystem = solSystem;
        this.state.currentPlanet = solSystem.planets.find(p => p.id === 'earth'); // Start at Earth

        return systems;
    }

    getSystemColor(type) {
        switch (type) {
            case 'bridge': return '#00f0ff';
            case 'engine': return '#ff5500';
            case 'weapon': return '#ff0055';
            case 'shield': return '#00ff55';
            default: return '#ffffff';
        }
    }
}
