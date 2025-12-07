/**
 * HazardUI.js (Refactored)
 * Core coordinator for hazard UI - delegates to specialized components
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;

        // Core state
        this.nearestBreach = null;
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;

        // Delegate components
        this.crewMenu = new CrewAssignmentMenu(gameState);
        this.renderer = new HazardUIRenderer(gameState);
    }

    /**
     * Update - check proximity and handle player repair
     */
    update(deltaTime, player) {
        if (!player) return;

        this.checkPlayerProximity(player);

        // Update player repair progress
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];

            if (!breach) {
                // Breach was repaired or removed
                this.stopPlayerRepair();
                return;
            }

            // Check if player moved too far
            const dist = Math.sqrt(
                Math.pow(player.x / 32 - breach.x, 2) +
                Math.pow(player.y / 32 - breach.y, 2)
            );

            if (dist > 1.5) {
                // Player moved away, cancel repair
                this.stopPlayerRepair();
                return;
            }

            // Continue repair
            const playerSkill = player.engineeringSkill || 0;
            this.repairProgress += deltaTime;

            const repairTime = Math.max(2, 10 - playerSkill);

            if (this.repairProgress >= repairTime) {
                // Repair complete!
                this.state.hazardManager.removeBreach(this.currentRepairBreach);
                this.stopPlayerRepair();
                console.log('[HazardUI] Player completed breach repair');
            }
        }
    }

    /**
     * Check if player is near any breach
     */
    checkPlayerProximity(player) {
        if (!player) return;

        const breaches = this.state.hazardManager.breaches;

        let nearest = null;
        let minDist = 1.5; // Max interaction distance

        for (let i = 0; i < breaches.length; i++) {
            const breach = breaches[i];
            const dist = Math.sqrt(
                Math.pow(player.x / 32 - breach.x, 2) +
                Math.pow(player.y / 32 - breach.y, 2)
            );

            if (dist < minDist) {
                minDist = dist;
                nearest = { breach, index: i, distance: dist };
            }
        }

        this.nearestBreach = nearest;
    }

    /**
     * Start player repair
     */
    startPlayerRepair() {
        if (!this.nearestBreach || this.playerRepairing) return false;

        this.playerRepairing = true;
        this.currentRepairBreach = this.nearestBreach.index;
        this.repairProgress = 0;
        console.log('[HazardUI] Player started repairing breach');
        return true;
    }

    /**
     * Stop player repair
     */
    stopPlayerRepair() {
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    /**
     * Toggle crew assignment menu (delegates to CrewAssignmentMenu)
     */
    toggleCrewMenu() {
        this.crewMenu.toggle();
    }

    /**
     * Handle mouse click on crew menu (delegates to CrewAssignmentMenu)
     */
    handleMenuClick(mouseX, mouseY) {
        return this.crewMenu.handleClick(mouseX, mouseY);
    }

    /**
     * Render all UI elements
     */
    render(ctx, shipRenderer, player) {
        // Render repair prompt if near breach (not showing crew menu)
        if (this.nearestBreach && !this.playerRepairing && !this.crewMenu.showing) {
            this.renderer.renderRepairPrompt(ctx, this.nearestBreach.breach, shipRenderer);
        }

        // Render repair progress if player is repairing
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
            if (breach && player) {
                const playerSkill = player.engineeringSkill || 0;
                const repairTime = Math.max(2, 10 - playerSkill);
                const progress = Math.min(1, this.repairProgress / repairTime);

                this.renderer.renderPlayerRepairProgress(ctx, breach, progress, shipRenderer);
            }
        }

        // Render crew assignment menu
        this.crewMenu.render(ctx);

        // Render oxygen level in HUD
        this.renderer.renderOxygenHUD(ctx, player);
    }

    /**
     * Get nearest breach (for external use)
     */
    getNearestBreach() {
        return this.nearestBreach;
    }

    /**
     * Check if player is currently repairing
     */
    isPlayerRepairing() {
        return this.playerRepairing;
    }
}
