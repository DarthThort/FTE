/**
 * ShipLayoutManager.js
 * Manages ship layout, doors, and room generation
 * Extracted from GameState.js
 */

class ShipLayoutManager {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * Toggle door between open (5) and closed (4) states
     */
    toggleDoor(x, y) {
        const tile = this.state.ship.layout[y][x];
        if (tile === 4) {
            this.state.ship.layout[y][x] = 5;
        } else if (tile === 5) {
            this.state.ship.layout[y][x] = 4;
        }
        this.state.saveGame();
        this.state.notify();
    }

    /**
     * Generate room definitions for the ship
     * Returns array of room objects with tiles, oxygen, and connections
     */
    generateRooms() {
        // For MVP, define rooms manually based on ship layout
        // In future, could analyze layout grid automatically
        return [
            {
                id: 'cockpit',
                tiles: [[7, 1], [8, 1], [9, 1], [7, 2], [8, 2], [9, 2], [7, 3], [8, 3], [9, 3]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_cockpit_main' } }
            },
            {
                id: 'main_hall',
                tiles: [[3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4],
                [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5], [14, 5]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['cockpit', 'left_wing', 'right_wing', 'engine_room'],
                doors: {
                    'cockpit': { open: true, id: 'door_cockpit_main' },
                    'left_wing': { open: true, id: 'door_main_left' },
                    'right_wing': { open: true, id: 'door_main_right' },
                    'engine_room': { open: true, id: 'door_main_engine' }
                }
            },
            {
                id: 'left_wing',
                tiles: [[5, 7], [5, 8]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_left' } }
            },
            {
                id: 'right_wing',
                tiles: [[12, 7], [12, 8]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_right' } }
            },
            {
                id: 'engine_room',
                tiles: [[7, 16], [8, 16], [9, 16], [7, 17], [8, 17], [9, 17]],
                oxygen: 100,
                onFire: false,
                fireIntensity: 0,
                breached: false,
                connectedRooms: ['main_hall'],
                doors: { 'main_hall': { open: true, id: 'door_main_engine' } }
            }
        ];
    }

    /**
     * Generate door definitions
     * Returns array of door objects with positions and states
     */
    generateDoors() {
        return [
            { id: 'door_cockpit_main', room1: 'cockpit', room2: 'main_hall', open: true, locked: false, position: { x: 8, y: 3 } },
            { id: 'door_main_left', room1: 'main_hall', room2: 'left_wing', open: true, locked: false, position: { x: 5, y: 6 } },
            { id: 'door_main_right', room1: 'main_hall', room2: 'right_wing', open: true, locked: false, position: { x: 12, y: 6 } },
            { id: 'door_main_engine', room1: 'main_hall', room2: 'engine_room', open: true, locked: false, position: { x: 8, y: 15 } }
        ];
    }
}
