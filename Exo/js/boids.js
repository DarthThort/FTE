// =============================================================================
// BOIDS.JS - Swarm Intelligence / Flocking Behavior
// =============================================================================

class BoidsBehavior {
    /**
     * Apply Boids flocking algorithm to a creature
     * Based on Craig Reynolds' algorithm with 3 rules:
     * 1. Separation - Avoid crowding neighbors
     * 2. Alignment - Steer towards average heading of neighbors
     * 3. Cohesion - Steer towards average position of neighbors
     */
    static apply(creature, allCreatures, deltaTime) {
        // Only apply to social creatures
        if (creature.dna.genes.social_drive < 0.6) return;

        // Find nearby creatures of same species
        const neighbors = this.findNeighbors(creature, allCreatures);

        if (neighbors.length === 0) return;

        // Calculate the three forces
        const separation = this.calculateSeparation(creature, neighbors);
        const alignment = this.calculateAlignment(creature, neighbors);
        const cohesion = this.calculateCohesion(creature, neighbors);

        // Apply forces with different weights
        const separationWeight = 0.4;
        const alignmentWeight = 0.3;
        const cohesionWeight = 0.3;

        creature.vx += separation.x * separationWeight * deltaTime * 50;
        creature.vy += separation.y * separationWeight * deltaTime * 50;

        creature.vx += alignment.x * alignmentWeight * deltaTime * 20;
        creature.vy += alignment.y * alignmentWeight * deltaTime * 20;

        creature.vx += cohesion.x * cohesionWeight * deltaTime * 30;
        creature.vy += cohesion.y * cohesionWeight * deltaTime * 30;

        // Limit velocity
        const maxSpeed = creature.phenotype.speed * 25;
        const currentSpeed = Math.sqrt(creature.vx * creature.vx + creature.vy * creature.vy);

        if (currentSpeed > maxSpeed) {
            creature.vx = (creature.vx / currentSpeed) * maxSpeed;
            creature.vy = (creature.vy / currentSpeed) * maxSpeed;
        }
    }

    /**
     * Find nearby creatures of the same species
     */
    static findNeighbors(creature, allCreatures) {
        const neighbors = [];
        const perceptionRadius = 80; // Can see neighbors within this radius

        for (let other of allCreatures) {
            if (other === creature || other.isDead) continue;

            // Must be same species
            if (!isSameSpecies(creature.dna, other.dna)) continue;

            const dist = Utils.distance(creature.x, creature.y, other.x, other.y);

            if (dist < perceptionRadius && dist > 0) {
                neighbors.push({
                    creature: other,
                    distance: dist
                });
            }
        }

        return neighbors;
    }

    /**
     * Rule 1: Separation - Avoid crowding
     */
    static calculateSeparation(creature, neighbors) {
        const separationRadius = 25;
        let steerX = 0;
        let steerY = 0;
        let count = 0;

        for (let neighbor of neighbors) {
            if (neighbor.distance < separationRadius) {
                // Calculate vector away from neighbor
                const diffX = creature.x - neighbor.creature.x;
                const diffY = creature.y - neighbor.creature.y;

                // Weight by distance (closer = stronger repulsion)
                const weight = 1 - (neighbor.distance / separationRadius);

                steerX += diffX * weight;
                steerY += diffY * weight;
                count++;
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;

            // Normalize
            const mag = Math.sqrt(steerX * steerX + steerY * steerY);
            if (mag > 0) {
                steerX /= mag;
                steerY /= mag;
            }
        }

        return { x: steerX, y: steerY };
    }

    /**
     * Rule 2: Alignment - Steer towards average heading
     */
    static calculateAlignment(creature, neighbors) {
        let avgVX = 0;
        let avgVY = 0;

        for (let neighbor of neighbors) {
            avgVX += neighbor.creature.vx;
            avgVY += neighbor.creature.vy;
        }

        if (neighbors.length > 0) {
            avgVX /= neighbors.length;
            avgVY /= neighbors.length;

            // Calculate steering force
            let steerX = avgVX - creature.vx;
            let steerY = avgVY - creature.vy;

            // Normalize
            const mag = Math.sqrt(steerX * steerX + steerY * steerY);
            if (mag > 0) {
                steerX /= mag;
                steerY /= mag;
            }

            return { x: steerX, y: steerY };
        }

        return { x: 0, y: 0 };
    }

    /**
     * Rule 3: Cohesion - Steer towards center of mass
     */
    static calculateCohesion(creature, neighbors) {
        let centerX = 0;
        let centerY = 0;

        for (let neighbor of neighbors) {
            centerX += neighbor.creature.x;
            centerY += neighbor.creature.y;
        }

        if (neighbors.length > 0) {
            centerX /= neighbors.length;
            centerY /= neighbors.length;

            // Calculate vector towards center
            let steerX = centerX - creature.x;
            let steerY = centerY - creature.y;

            // Normalize
            const mag = Math.sqrt(steerX * steerX + steerY * steerY);
            if (mag > 0) {
                steerX /= mag;
                steerY /= mag;
            }

            return { x: steerX, y: steerY };
        }

        return { x: 0, y: 0 };
    }
}
