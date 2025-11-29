/**
 * ShipCoordinates - Utility class for managing tile-based coordinate system
 * 
 * The ship uses a tile-based grid (25x25) as the source of truth.
 * This class handles conversion between tile coordinates and pixel coordinates.
 */
class ShipCoordinates {
    constructor(tileSize = 32) {
        this.tileSize = tileSize;
    }

    /**
     * Convert tile coordinates to pixel coordinates (center of tile)
     * @param {number} tileX - X position in tiles (0-24)
     * @param {number} tileY - Y position in tiles (0-24)
     * @returns {{x: number, y: number}} Pixel coordinates
     */
    tileToPixel(tileX, tileY) {
        return {
            x: tileX * this.tileSize + this.tileSize / 2,
            y: tileY * this.tileSize + this.tileSize / 2
        };
    }

    /**
     * Convert pixel coordinates to tile coordinates
     * @param {number} pixelX - X position in pixels
     * @param {number} pixelY - Y position in pixels
     * @returns {{x: number, y: number}} Tile coordinates
     */
    pixelToTile(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.tileSize),
            y: Math.floor(pixelY / this.tileSize)
        };
    }

    /**
     * Get a random walkable tile from the ship layout
     * @param {Array<Array<number>>} layout - Ship layout grid
     * @returns {{x: number, y: number}} Random walkable tile coordinates
     */
    getRandomWalkableTile(layout) {
        const walkable = [];
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                if (this.isWalkable(layout, x, y)) {
                    walkable.push({ x, y });
                }
            }
        }

        if (walkable.length === 0) {
            console.warn('No walkable tiles found! Defaulting to center');
            return { x: 12, y: 12 };
        }

        return walkable[Math.floor(Math.random() * walkable.length)];
    }

    /**
     * Check if a tile is walkable
     * @param {Array<Array<number>>} layout - Ship layout grid
     * @param {number} tileX - X position in tiles
     * @param {number} tileY - Y position in tiles
     * @returns {boolean} True if tile is walkable
     */
    isWalkable(layout, tileX, tileY) {
        const tile = layout[tileY]?.[tileX];
        // Walkable tiles: 2=floor, 3=system, 5=open door
        return tile === 2 || tile === 3 || tile === 5;
    }

    /**
     * Get a specific walkable tile (for spawning in specific areas)
     * @param {Array<Array<number>>} layout - Ship layout grid
     * @param {string} area - Area hint ('center', 'bridge', 'random')
     * @returns {{x: number, y: number}} Walkable tile coordinates
     */
    getWalkableTileInArea(layout, area = 'center') {
        switch (area) {
            case 'center':
                // Try center area first
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const x = 12 + dx;
                        const y = 12 + dy;
                        if (this.isWalkable(layout, x, y)) {
                            return { x, y };
                        }
                    }
                }
                break;
            case 'bridge':
                // Try bridge area (top center)
                for (let dy = 0; dy < 5; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const x = 12 + dx;
                        const y = 5 + dy;
                        if (this.isWalkable(layout, x, y)) {
                            return { x, y };
                        }
                    }
                }
                break;
        }

        // Fallback to random walkable tile
        return this.getRandomWalkableTile(layout);
    }
}
