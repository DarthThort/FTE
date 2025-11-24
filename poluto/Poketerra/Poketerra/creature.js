// ==========================================
// CREATURE CLASS - AI, Stats, Behavior
// ==========================================

class Creature {
    constructor(genetics = null, isWild = true, age = 'adult') {
        this.id = this.generateId();
        this.genetics = genetics || geneticsSystem.generateRandomGenetics();
        this.expressedTraits = geneticsSystem.getExpressedTraits(this.genetics);
        this.stats = geneticsSystem.getTraitStats(this.expressedTraits);

        this.isWild = isWild;
        this.age = age; // 'baby', 'adult'

        // Position and movement
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.direction = 1; // 1 = right, -1 = left

        // Vital stats
        this.health = 100;
        this.hunger = 100;
        this.maxAge = 300; // seconds
        this.ageTimer = 0;

        // AI behavior
        this.wanderTimer = 0;
        this.wanderCooldown = 2; // seconds between direction changes
        this.targetX = 0;

        // Status
        this.isDead = false;
        this.isSelected = false;
    }

    generateId() {
        return 'creature_' + Math.random().toString(36).substr(2, 9);
    }

    // Update creature state
    update(deltaTime) {
        if (this.isDead) return;

        // Age progression
        if (this.age === 'baby') {
            this.ageTimer += deltaTime;
            if (this.ageTimer > 30) { // 30 seconds to grow up
                this.age = 'adult';
            }
        }

        // Hunger depletion
        this.hunger -= (this.stats.hungerRate * deltaTime * 2);
        if (this.hunger < 0) {
            this.hunger = 0;
            // Lose health when starving
            this.health -= deltaTime * 5;
        }

        // Death check
        if (this.health <= 0) {
            this.die();
            return;
        }

        // AI behavior for wild creatures
        if (this.isWild) {
            this.updateWildBehavior(deltaTime);
        }

        // Movement
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Simple friction
        this.vx *= 0.95;
        this.vy *= 0.95;
    }

    // Wild creature AI - wander around
    updateWildBehavior(deltaTime) {
        this.wanderTimer -= deltaTime;

        if (this.wanderTimer <= 0) {
            // Pick new direction
            this.wanderTimer = this.wanderCooldown + Math.random() * 2;

            const moveChoice = Math.random();
            if (moveChoice < 0.3) {
                // Walk left
                this.vx = -30 * this.stats.speed;
                this.direction = -1;
            } else if (moveChoice < 0.6) {
                // Walk right
                this.vx = 30 * this.stats.speed;
                this.direction = 1;
            } else {
                // Stand still
                this.vx = 0;
            }

            // Occasional jump
            if (Math.random() < 0.2) {
                this.vy = -50 * this.stats.speed;
            }
        }

        // Apply gravity
        this.vy += 150 * deltaTime;
    }

    // Feed the creature
    feed(amount = 50) {
        this.hunger = Math.min(100, this.hunger + amount);
        return true;
    }

    // Heal the creature
    heal(amount = 20) {
        this.health = Math.min(100, this.health + amount);
    }

    // Capture wild creature
    capture() {
        if (!this.isWild) return false;

        // Harder to capture based on stats
        const captureChance = 1 / this.stats.captureResistance;
        if (Math.random() < captureChance) {
            this.isWild = false;
            this.vx = 0;
            this.vy = 0;
            return true;
        }
        return false;
    }

    // Creature dies
    die() {
        this.isDead = true;
        this.health = 0;
    }

    // Get creature name based on traits
    getName() {
        const traits = this.expressedTraits;
        const adjectives = {
            claws: { sharp: 'Afilado', hooked: 'Ganchudo', blunt: 'Romo' },
            tail: { long: 'Largo', medium: 'Mediano', short: 'Corto' },
            bodySize: { large: 'Grande', medium: 'Mediano', small: 'Pequeño' }
        };

        const adj1 = adjectives.bodySize[traits.bodySize] || 'Raro';
        const adj2 = adjectives.tail[traits.tail] || 'Extraño';

        return `${adj1} ${adj2}`;
    }

    // Get trait description for UI
    getTraitDescription() {
        const traits = this.expressedTraits;
        return [
            `Garras: ${traits.claws}`,
            `Dientes: ${traits.teeth}`,
            `Cola: ${traits.tail}`,
            `Tamaño: ${traits.bodySize}`,
            `Color: ${traits.colorType}`
        ];
    }

    // Check if creature is in danger (low health/hunger)
    isInDanger() {
        return this.health < 30 || this.hunger < 20;
    }
}
