// =============================================================================
// RENDERER.JS - Visual Rendering System
// =============================================================================

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1.0;

        // Sprite generator
        this.spriteGenerator = new SpriteGenerator();

        // Debug
        this.showGrid = false;
        this.showVisionCones = false;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Transform world coordinates to screen coordinates
    worldToScreen(x, y) {
        return {
            x: (x - this.cameraX) * this.zoom,
            y: (y - this.cameraY) * this.zoom
        };
    }

    // Check if position is on screen
    isOnScreen(x, y, padding = 50) {
        return x + padding >= 0 && x - padding <= this.canvas.width &&
            y + padding >= 0 && y - padding <= this.canvas.height;
    }

    // Render the world map
    renderWorld(world) {
        const tileSize = world.tileSize * this.zoom;

        for (let row = 0; row < world.rows; row++) {
            for (let col = 0; col < world.cols; col++) {
                const tile = world.tiles[row][col];
                const screenPos = this.worldToScreen(col * world.tileSize, row * world.tileSize);

                // Skip if off-screen
                if (screenPos.x + tileSize < 0 || screenPos.x > this.canvas.width ||
                    screenPos.y + tileSize < 0 || screenPos.y > this.canvas.height) {
                    continue;
                }

                // Biome base color
                const biomeData = BIOMES[tile.biome];
                if (biomeData) {
                    this.ctx.fillStyle = biomeData.color;
                    this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);

                    // Biomass overlay (greenery)
                    if (tile.biomass > 0) {
                        const alpha = Utils.clamp(tile.biomass / 100, 0, 0.7);
                        this.ctx.fillStyle = `rgba(60, 150, 80, ${alpha})`;
                        this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
                    }
                }
            }
        }

        // Grid overlay
        if (this.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let row = 0; row <= world.rows; row++) {
                const y = row * world.tileSize * this.zoom - this.cameraY * this.zoom;
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            for (let col = 0; col <= world.cols; col++) {
                const x = col * world.tileSize * this.zoom - this.cameraX * this.zoom;
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
        }
    }

    // Render creatures with procedural sprites
    renderCreatures(creatures) {
        for (let creature of creatures) {
            if (creature.isDead) continue;

            const size = creature.getVisualSize() * this.zoom; // Escalar con zoom
            const screenPos = this.worldToScreen(creature.x, creature.y);

            if (!this.isOnScreen(screenPos.x, screenPos.y, size * 2)) continue;

            // Get or generate sprite for this creature
            const sprite = this.spriteGenerator.getCreatureSprite(creature);

            this.ctx.save();
            this.ctx.translate(screenPos.x, screenPos.y);
            this.ctx.rotate(creature.rotation);

            // Draw the procedural sprite
            this.ctx.drawImage(sprite, -size, -size, size * 2, size * 2);

            // Outline based on diet (drawn on top of sprite)
            const dietType = creature.dna.getDietType();
            if (dietType === 'CARNIVORE') {
                this.ctx.strokeStyle = '#ff4444';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 1, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (dietType === 'HERBIVORE') {
                this.ctx.strokeStyle = '#44ff44';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 1, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (dietType === 'SCAVENGER') {
                this.ctx.strokeStyle = '#888888';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 1, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }

            // Life stage indicator
            if (creature.lifeStage === 'INFANT') {
                this.ctx.strokeStyle = '#ffff44';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 2, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }

            this.ctx.restore();

            // Health bar
            if (creature.health < 100) {
                const barWidth = size * 2;
                const barHeight = 3;
                const barX = screenPos.x - barWidth / 2;
                const barY = screenPos.y - size - 8;

                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);

                this.ctx.fillStyle = creature.health > 50 ? '#4d4' : creature.health > 20 ? '#dd4' : '#d44';
                this.ctx.fillRect(barX, barY, barWidth * (creature.health / 100), barHeight);
            }

            // Vision cone debug
            if (this.showVisionCones) {
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, creature.phenotype.visionRange * this.zoom, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Bioluminescence glow
            if (creature.isGlowing && creature.dna.genes.bioluminescence > 0.5) {
                this.ctx.save();
                const gradient = this.ctx.createRadialGradient(
                    screenPos.x, screenPos.y, 0,
                    screenPos.x, screenPos.y, size * 3
                );
                const glowIntensity = creature.dna.genes.bioluminescence;
                gradient.addColorStop(0, `rgba(100, 255, 200, ${glowIntensity * 0.5})`);
                gradient.addColorStop(1, 'rgba(100, 255, 200, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }

    // Render night darkness overlay
    renderNightShader(darkness) {
        if (darkness > 0) {
            this.ctx.fillStyle = `rgba(10, 10, 30, ${darkness})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Render cadavers
    renderCadavers(cadavers) {
        for (let cadaver of cadavers) {
            const screenPos = this.worldToScreen(cadaver.x, cadaver.y);
            const size = 6 * this.zoom;

            this.ctx.fillStyle = '#8b4513';
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    // Render minimap
    renderMinimap(minimapCanvas, world, creatures) {
        const ctx = minimapCanvas.getContext('2d');
        const width = minimapCanvas.width;
        const height = minimapCanvas.height;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw world simplified
        const scaleX = width / world.cols;
        const scaleY = height / world.rows;

        for (let row = 0; row < world.rows; row++) {
            for (let col = 0; col < world.cols; col++) {
                const tile = world.tiles[row][col];
                const biomeData = BIOMES[tile.biome];
                if (biomeData) {
                    ctx.fillStyle = biomeData.color;
                    ctx.fillRect(col * scaleX, row * scaleY, scaleX, scaleY);
                }
            }
        }

        // Draw creatures as dots
        ctx.fillStyle = '#ff00ff';
        for (let creature of creatures) {
            if (!creature.isDead) {
                const x = (creature.x / world.tileSize) * scaleX;
                const y = (creature.y / world.tileSize) * scaleY;
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }
    }
}

