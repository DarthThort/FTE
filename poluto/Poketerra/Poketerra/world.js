// ==========================================
// WORLD CLASS - Environment & Terrain
// ==========================================

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundY = height - 100;

        // Time system
        this.time = 0;
        this.dayLength = 120; // seconds for full day/night cycle

        // Background layers for parallax
        this.bgLayers = this.generateBackgroundLayers();
    }

    update(deltaTime) {
        this.time += deltaTime;
    }

    // Generate parallax background layers
    generateBackgroundLayers() {
        const layers = [];

        // Far mountains
        layers.push({
            color: '#1a3a52',
            heights: this.generateTerrain(10, 0.3),
            parallax: 0.2,
            yOffset: -100
        });

        // Mid hills
        layers.push({
            color: '#2a4a62',
            heights: this.generateTerrain(15, 0.5),
            parallax: 0.4,
            yOffset: -50
        });

        // Near trees/rocks
        layers.push({
            color: '#3a5a72',
            heights: this.generateTerrain(20, 0.7),
            parallax: 0.7,
            yOffset: 0
        });

        return layers;
    }

    // Generate random terrain heights
    generateTerrain(segments, variation) {
        const heights = [];
        let currentHeight = 0.5;

        for (let i = 0; i < segments; i++) {
            currentHeight += (Math.random() - 0.5) * variation;
            currentHeight = Math.max(0.2, Math.min(0.8, currentHeight));
            heights.push(currentHeight);
        }

        return heights;
    }

    // Render the world
    render(ctx, camera) {
        const { width, height } = this;

        // Sky gradient (changes with time of day)
        const timeRatio = (this.time % this.dayLength) / this.dayLength;
        const skyColor = this.getSkyColor(timeRatio);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, skyColor.top);
        gradient.addColorStop(1, skyColor.bottom);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Stars at night
        if (timeRatio > 0.7 || timeRatio < 0.3) {
            this.renderStars(ctx, timeRatio);
        }

        // Parallax background layers
        for (const layer of this.bgLayers) {
            this.renderTerrainLayer(ctx, layer, camera);
        }

        // Main ground
        ctx.fillStyle = '#2d4a2e';
        ctx.fillRect(0, this.groundY, width, height - this.groundY);

        // Ground texture
        ctx.fillStyle = '#1a2f1b';
        for (let x = 0; x < width; x += 20) {
            const grassHeight = Math.random() * 10 + 5;
            ctx.fillRect(x, this.groundY - grassHeight, 2, grassHeight);
        }

        // Ground border
        ctx.strokeStyle = '#1a2a1b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(width, this.groundY);
        ctx.stroke();
    }

    // Get sky color based on time
    getSkyColor(timeRatio) {
        if (timeRatio < 0.25) {
            // Night
            return { top: '#0a0e1a', bottom: '#1a1f2e' };
        } else if (timeRatio < 0.3) {
            // Dawn
            return { top: '#2a3a5a', bottom: '#ff6b4a' };
        } else if (timeRatio < 0.7) {
            // Day
            return { top: '#4a7ba7', bottom: '#87ceeb' };
        } else if (timeRatio < 0.75) {
            // Dusk
            return { top: '#2a3a5a', bottom: '#ff8c4a' };
        } else {
            // Night
            return { top: '#0a0e1a', bottom: '#1a1f2e' };
        }
    }

    // Render stars
    renderStars(ctx, timeRatio) {
        const starOpacity = timeRatio > 0.7
            ? (timeRatio - 0.7) / 0.3  // Fading in
            : (0.3 - timeRatio) / 0.3; // Fading out

        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * 0.8})`;

        // Fixed star positions
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.width; // Golden angle for distribution
            const y = (i * 89.3) % (this.height * 0.5);
            const size = (i % 3) + 1;

            ctx.fillRect(x, y, size, size);
        }
    }

    // Render a terrain layer with parallax
    renderTerrainLayer(ctx, layer, camera) {
        const { heights, color, parallax, yOffset } = layer;
        const segmentWidth = this.width / heights.length;
        const offset = camera.x * parallax;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-offset, this.groundY + yOffset);

        for (let i = 0; i < heights.length; i++) {
            const x = i * segmentWidth - offset;
            const y = this.groundY + yOffset - heights[i] * 100;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(this.width - offset, this.groundY + yOffset);
        ctx.lineTo(this.width - offset, this.height);
        ctx.lineTo(-offset, this.height);
        ctx.closePath();
        ctx.fill();
    }

    // Spawn wild creatures in the world
    spawnCreatures(count) {
        const creatures = [];

        for (let i = 0; i < count; i++) {
            const creature = new Creature();
            creature.x = Math.random() * this.width;
            creature.y = this.groundY - 50;
            creatures.push(creature);
        }

        return creatures;
    }
}
