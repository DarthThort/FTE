// ==========================================
// MAIN GAME - Game Loop & UI Management
// ==========================================

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Game entities
        this.world = new World(this.canvas.width, this.canvas.height);
        this.player = new Player();
        this.creatures = [];

        // Camera (simple follow player)
        this.camera = { x: 0, y: 0 };

        // UI elements
        this.setupUI();

        // Game state
        this.running = false;
        this.lastTime = 0;

        // Spawn initial wild creatures
        this.creatures = this.world.spawnCreatures(8);

        // Event listeners
        this.setupEventListeners();

        // Start game loop
        this.start();
    }

    resizeCanvas() {
        const wrapper = document.getElementById('canvas-wrapper');
        this.canvas.width = wrapper.clientWidth;
        this.canvas.height = wrapper.clientHeight;
    }

    setupUI() {
        // UI element references
        this.ui = {
            foodCount: document.querySelector('#food-count strong'),
            creatureCount: document.querySelector('#creature-count strong'),
            capturedCreatures: document.getElementById('captured-creatures'),
            creatureDetails: document.getElementById('creature-details'),
            breedingModal: document.getElementById('breeding-modal'),
            parent1Slot: document.getElementById('parent1-slot'),
            parent2Slot: document.getElementById('parent2-slot'),
            breedBtn: document.getElementById('breed-btn'),
            notifications: document.getElementById('notifications')
        };

        // Modal close button
        document.getElementById('close-breeding').addEventListener('click', () => {
            this.closeBreedingModal();
        });

        // Breed button
        this.ui.breedBtn.addEventListener('click', () => {
            this.performBreeding();
        });
    }

    setupEventListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.player.keys[e.key] = true;

            // Feed creature (F key)
            if (e.key === 'f' || e.key === 'F') {
                if (this.player.selectedCreature) {
                    if (this.player.feedCreature(this.player.selectedCreature)) {
                        this.showNotification('🍖 Criatura alimentada!', 'success');
                        this.updateUI();
                    } else {
                        this.showNotification('❌ No tienes comida', 'danger');
                    }
                }
            }

            // Open breeding modal (B key)
            if (e.key === 'b' || e.key === 'B') {
                this.openBreedingModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.player.keys[e.key] = false;
        });

        // Mouse click for capture
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Try to capture nearest creature
            const capturedCreature = this.player.tryCapture(this.creatures);
            if (capturedCreature) {
                this.showNotification(`✅ ¡Capturado ${capturedCreature.getName()}!`, 'success');
                this.updateUI();
            } else {
                // Check if clicked on existing creature
                this.handleCreatureClick(clickX, clickY);
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.world.width = this.canvas.width;
            this.world.height = this.canvas.height;
        });
    }

    // Handle clicking on creatures to select them
    handleCreatureClick(x, y) {
        for (const creature of this.player.capturedCreatures) {
            if (!creature.isDead) {
                const dx = creature.x - x;
                const dy = creature.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) {
                    this.player.selectCreature(creature);
                    this.updateUI();
                    return;
                }
            }
        }
    }

    // Game loop
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    loop() {
        if (!this.running) return;

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame(() => this.loop());
    }

    update(deltaTime) {
        // Update world
        this.world.update(deltaTime);

        // Update player
        this.player.update(deltaTime, this.world);

        // Update all creatures
        for (const creature of this.creatures) {
            creature.update(deltaTime);

            // Keep creatures above ground
            if (creature.y > this.world.groundY - 20) {
                creature.y = this.world.groundY - 20;
                creature.vy = 0;
            }

            // Keep creatures in bounds
            creature.x = Math.max(20, Math.min(this.world.width - 20, creature.x));
        }

        // Cleanup dead creatures periodically
        this.player.cleanupDeadCreatures();

        // Update UI periodically (not every frame)
        if (Math.random() < 0.02) {
            this.updateUI();
        }
    }

    render() {
        const ctx = this.ctx;

        // Clear
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render world
        this.world.render(ctx, this.camera);

        // Render all creatures
        for (const creature of this.creatures) {
            if (!creature.isDead) {
                const scale = creature.age === 'baby' ? 0.6 : 1.0;
                creatureRenderer.renderCreature(ctx, creature, creature.x, creature.y, scale);

                // Highlight selected creature
                if (creature.isSelected) {
                    ctx.strokeStyle = '#4ecca3';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(creature.x - 30, creature.y - 35, 60, 60);
                    ctx.setLineDash([]);
                }
            }
        }

        // Render player
        this.player.render(ctx);
    }

    // Update all UI elements
    updateUI() {
        // Update header stats
        this.ui.foodCount.textContent = this.player.foodCount;
        this.ui.creatureCount.textContent = this.player.capturedCreatures.filter(c => !c.isDead).length;

        // Update captured creatures list
        this.updateCreatureList();

        // Update selected creature details
        this.updateCreatureDetails();
    }

    updateCreatureList() {
        const container = this.ui.capturedCreatures;
        container.innerHTML = '';

        const aliveCreatures = this.player.capturedCreatures.filter(c => !c.isDead);

        if (aliveCreatures.length === 0) {
            container.innerHTML = '<p class="empty-message">Captura criaturas para verlas aquí</p>';
            return;
        }

        for (const creature of aliveCreatures) {
            const card = this.createCreatureCard(creature);
            container.appendChild(card);
        }
    }

    createCreatureCard(creature) {
        const card = document.createElement('div');
        card.className = 'creature-card';
        if (creature.isSelected) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div class="creature-card-header">
                <span class="creature-name">${creature.getName()}</span>
                <span class="creature-age">${creature.age === 'baby' ? '🐣 Bebé' : '🦎 Adulto'}</span>
            </div>
            <div class="creature-stats">
                <div class="stat-bar">
                    <div class="stat-label">❤️ ${Math.round(creature.health)}%</div>
                    <div class="stat-fill">
                        <div class="stat-fill-inner health" style="width: ${creature.health}%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-label">🍖 ${Math.round(creature.hunger)}%</div>
                    <div class="stat-fill">
                        <div class="stat-fill-inner hunger" style="width: ${creature.hunger}%"></div>
                    </div>
                </div>
            </div>
            <div class="creature-traits">
                <div class="trait-list">
                    ${creature.getTraitDescription().map(t => `<span class="trait-tag">${t}</span>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.player.selectCreature(creature);
            this.updateUI();
        });

        return card;
    }

    updateCreatureDetails() {
        const container = this.ui.creatureDetails;
        const creature = this.player.selectedCreature;

        if (!creature || creature.isDead) {
            container.innerHTML = '<p class="empty-message">Selecciona una criatura para ver sus detalles</p>';
            return;
        }

        const stats = creature.stats;
        container.innerHTML = `
            <h3 style="color: var(--accent-primary); font-size: 0.7rem; margin-bottom: 12px;">${creature.getName()}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.55rem;">
                <div>
                    <strong style="color: var(--text-secondary);">Estadísticas:</strong><br>
                    Resistencia: ${(stats.captureResistance * 100).toFixed(0)}%<br>
                    Velocidad: ${(stats.speed * 100).toFixed(0)}%<br>
                    Hambre: ${(stats.hungerRate * 100).toFixed(0)}%<br>
                    Camuflaje: ${(stats.camouflage * 100).toFixed(0)}%
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Estado:</strong><br>
                    Edad: ${creature.age === 'baby' ? 'Bebé' : 'Adulto'}<br>
                    Salud: ${Math.round(creature.health)}%<br>
                    Hambre: ${Math.round(creature.hunger)}%<br>
                    ${creature.isInDanger() ? '<span style="color: var(--accent-danger);">⚠️ En peligro!</span>' : '<span style="color: var(--accent-primary);">✓ Bien</span>'}
                </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.5rem; color: var(--text-secondary);">
                <strong>Controles:</strong> Presiona <kbd>F</kbd> para alimentar | <kbd>B</kbd> para criar
            </div>
        `;
    }

    // Breeding system
    openBreedingModal() {
        const adults = this.player.capturedCreatures.filter(c => !c.isDead && !c.isWild && c.age === 'adult');

        if (adults.length < 2) {
            this.showNotification('❌ Necesitas al menos 2 adultos capturados', 'warning');
            return;
        }

        this.ui.breedingModal.classList.remove('hidden');
        this.player.breedingParent1 = null;
        this.player.breedingParent2 = null;
        this.updateBreedingSlots();
    }

    closeBreedingModal() {
        this.ui.breedingModal.classList.add('hidden');
        this.player.breedingParent1 = null;
        this.player.breedingParent2 = null;
    }

    updateBreedingSlots() {
        const adults = this.player.capturedCreatures.filter(c => !c.isDead && !c.isWild && c.age === 'adult');

        // Parent 1 slot
        this.ui.parent1Slot.innerHTML = '';
        if (this.player.breedingParent1) {
            this.ui.parent1Slot.innerHTML = `<strong>${this.player.breedingParent1.getName()}</strong>`;
            this.ui.parent1Slot.classList.add('filled');
        } else {
            this.ui.parent1Slot.classList.remove('filled');
            adults.forEach(creature => {
                const btn = document.createElement('button');
                btn.textContent = creature.getName();
                btn.className = 'action-btn';
                btn.style.marginTop = '8px';
                btn.addEventListener('click', () => {
                    this.player.breedingParent1 = creature;
                    this.updateBreedingSlots();
                });
                this.ui.parent1Slot.appendChild(btn);
            });
        }

        // Parent 2 slot
        this.ui.parent2Slot.innerHTML = '';
        if (this.player.breedingParent2) {
            this.ui.parent2Slot.innerHTML = `<strong>${this.player.breedingParent2.getName()}</strong>`;
            this.ui.parent2Slot.classList.add('filled');
        } else {
            this.ui.parent2Slot.classList.remove('filled');
            adults.filter(c => c !== this.player.breedingParent1).forEach(creature => {
                const btn = document.createElement('button');
                btn.textContent = creature.getName();
                btn.className = 'action-btn';
                btn.style.marginTop = '8px';
                btn.addEventListener('click', () => {
                    this.player.breedingParent2 = creature;
                    this.updateBreedingSlots();
                });
                this.ui.parent2Slot.appendChild(btn);
            });
        }

        // Enable/disable breed button
        this.ui.breedBtn.disabled = !this.player.breedingParent1 || !this.player.breedingParent2;
    }

    performBreeding() {
        const baby = this.player.breedCreatures(this.player.breedingParent1, this.player.breedingParent2);

        if (baby) {
            // Position baby in world
            baby.x = this.player.x;
            baby.y = this.player.y;
            this.creatures.push(baby);

            this.showNotification(`🎉 ¡Nació ${baby.getName()}!`, 'success');
            this.closeBreedingModal();
            this.updateUI();
        } else {
            this.showNotification('❌ No se pudo criar', 'danger');
        }
    }

    // Notification system
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.ui.notifications.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    const game = new Game();

    // Make game accessible for debugging
    window.game = game;
});
