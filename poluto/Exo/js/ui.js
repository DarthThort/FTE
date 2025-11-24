// =============================================================================
// UI.JS - User Interface Management
// =============================================================================

class UIManager {
    constructor() {
        // HUD elements
        this.epochEl = document.getElementById('epoch');
        this.yearEl = document.getElementById('year');
        this.populationEl = document.getElementById('population');
        this.speciesCountEl = document.getElementById('species-count');

        // Inspector
        this.inspectorPanel = document.getElementById('inspector');
        this.creatureIdEl = document.getElementById('creature-id');
        this.creatureAgeEl = document.getElementById('creature-age');
        this.creatureEnergyEl = document.getElementById('creature-energy');
        this.creatureHungerEl = document.getElementById('creature-hunger');
        this.creatureDietEl = document.getElementById('creature-diet');
        this.genomeCanvas = document.getElementById('genome-canvas');

        // Event log
        this.logContent = document.getElementById('log-content');

        // Minimap
        this.minimap = document.getElementById('minimap');

        // Game state
        this.gameTime = 0;
        this.selectedCreature = null;
    }

    update(gameState) {
        this.gameTime = gameState.time || 0;

        // Update stats
        const year = Math.floor(this.gameTime / 60);
        this.yearEl.textContent = year;
        this.populationEl.textContent = gameState.creatures.length;

        // Calculate species count (simplified)
        this.speciesCountEl.textContent = Math.max(1, Math.floor(gameState.creatures.length / 10));

        // Update epoch name based on year
        if (year < 5) {
            this.epochEl.textContent = 'Génesis';
        } else if (year < 20) {
            this.epochEl.textContent = 'Paleozoico';
        } else if (year < 50) {
            this.epochEl.textContent = 'Mesozoico';
        } else {
            this.epochEl.textContent = 'Cenozoico';
        }

        // Update inspector if creature selected
        if (this.selectedCreature && !this.selectedCreature.isDead) {
            this.updateInspector(this.selectedCreature);
        }
    }

    selectCreature(creature) {
        this.selectedCreature = creature;
        if (creature) {
            this.inspectorPanel.style.display = 'block';
            this.updateInspector(creature);
        } else {
            this.inspectorPanel.style.display = 'none';
        }
    }

    updateInspector(creature) {
        this.creatureIdEl.textContent = creature.id.substring(0, 8);
        this.creatureAgeEl.textContent = `${creature.age.toFixed(1)}s / ${creature.phenotype.maxLifespan.toFixed(0)}s (${creature.lifeStage})`;
        this.creatureEnergyEl.textContent = `${creature.energy.toFixed(0)}%`;
        this.creatureHungerEl.textContent = `${creature.hunger.toFixed(0)}%`;
        this.creatureDietEl.textContent = creature.dna.getDietType();

        // Draw genome visualization
        this.drawGenome(creature.dna);
    }

    drawGenome(dna) {
        const ctx = this.genomeCanvas.getContext('2d');
        const width = this.genomeCanvas.width;
        const height = this.genomeCanvas.height;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        const genes = Object.entries(dna.genes);
        const barWidth = width / genes.length;

        genes.forEach(([name, value], index) => {
            const barHeight = height * value;
            const x = index * barWidth;
            const y = height - barHeight;

            // Color based on gene type
            let color = '#888';
            if (name.includes('color')) color = '#a855f7';
            else if (name.includes('diet') || name.includes('metabolism')) color = '#14b8a6';
            else if (name.includes('social') || name.includes('aggression')) color = '#f97316';
            else if (name.includes('vision') || name.includes('smell')) color = '#eab308';

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }

    logEvent(message, eventType = 'event-birth') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${eventType}`;
        entry.textContent = `[${Math.floor(this.gameTime)}s] ${message}`;

        this.logContent.insertBefore(entry, this.logContent.firstChild);

        // Limit log size
        while (this.logContent.children.length > 50) {
            this.logContent.removeChild(this.logContent.lastChild);
        }
    }
}
