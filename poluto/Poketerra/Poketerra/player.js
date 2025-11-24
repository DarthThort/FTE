// ==========================================
// PLAYER CLASS - Movement & Interaction
// ==========================================

class Player {
    constructor() {
        this.x = 400;
        this.y = 300;
        this.width = 24;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.speed = 150;
        this.jumpPower = 200;
        this.onGround = false;

        // Inventory
        this.capturedCreatures = [];
        this.foodCount = 10;
        this.selectedCreature = null;

        // Breeding
        this.breedingParent1 = null;
        this.breedingParent2 = null;

        // Input state
        this.keys = {};
    }

    update(deltaTime, world) {
        // Horizontal movement
        this.vx = 0;
        if (this.keys['a'] || this.keys['A']) {
            this.vx = -this.speed;
        }
        if (this.keys['d'] || this.keys['D']) {
            this.vx = this.speed;
        }

        // Jumping
        if ((this.keys['w'] || this.keys['W']) && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }

        // Apply gravity
        this.vy += 400 * deltaTime;

        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Ground collision
        const groundY = world.groundY - this.height / 2;
        if (this.y > groundY) {
            this.y = groundY;
            this.vy = 0;
            this.onGround = true;
        }

        // Bounds
        this.x = Math.max(this.width / 2, Math.min(world.width - this.width / 2, this.x));
    }

    // Render player (simple square for now)
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Body
        ctx.fillStyle = '#4ecca3';
        ctx.strokeStyle = '#2a7050';
        ctx.lineWidth = 2;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Head
        ctx.fillStyle = '#5effc3';
        ctx.fillRect(-this.width / 3, -this.height / 2 - 10, this.width * 0.66, 10);

        // Eyes
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(-8, -this.height / 2 - 6, 4, 4);
        ctx.fillRect(4, -this.height / 2 - 6, 4, 4);

        ctx.restore();
    }

    // Try to capture nearby wild creature
    tryCapture(creatures) {
        for (const creature of creatures) {
            if (creature.isWild && !creature.isDead) {
                const dx = creature.x - this.x;
                const dy = creature.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 60) {
                    if (creature.capture()) {
                        this.capturedCreatures.push(creature);
                        return creature;
                    } else {
                        return null; // Capture failed
                    }
                }
            }
        }
        return null;
    }

    // Feed selected creature
    feedCreature(creature) {
        if (this.foodCount > 0 && creature && !creature.isWild) {
            creature.feed(50);
            this.foodCount--;
            return true;
        }
        return false;
    }

    // Select a creature for interaction
    selectCreature(creature) {
        if (this.selectedCreature) {
            this.selectedCreature.isSelected = false;
        }
        this.selectedCreature = creature;
        if (creature) {
            creature.isSelected = true;
        }
    }

    // Breed two creatures
    breedCreatures(parent1, parent2) {
        if (!parent1 || !parent2 || parent1 === parent2) {
            return null;
        }

        if (parent1.isWild || parent2.isWild || parent1.age !== 'adult' || parent2.age !== 'adult') {
            return null;
        }

        // Create offspring with inherited genetics
        const offspringGenetics = geneticsSystem.breedGenetics(parent1.genetics, parent2.genetics);
        const baby = new Creature(offspringGenetics, false, 'baby');

        // Position near parents
        baby.x = (parent1.x + parent2.x) / 2;
        baby.y = (parent1.y + parent2.y) / 2;

        this.capturedCreatures.push(baby);
        return baby;
    }

    // Remove dead creatures from inventory
    cleanupDeadCreatures() {
        this.capturedCreatures = this.capturedCreatures.filter(c => !c.isDead);
    }
}
