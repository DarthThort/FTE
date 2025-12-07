/**
 * HazardUI.js
 * UI for hazard interactions: repair prompts, progress bars, crew assignment, oxygen display
 */

class HazardUI {
    constructor(gameState) {
        this.state = gameState;
        this.nearestBreach = null;
        this.showingCrewMenu = false;
        this.selectedBreach = null;  // Selected breach for crew assignment
        this.menuBounds = [];  // Clickable areas for mouse detection
        this.playerRepairing = false;
        this.currentRepairBreach = null;
        this.repairProgress = 0;
    }

    /**
     * Update - check proximity and handle input
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
     * Toggle crew assignment menu (accessible anywhere)
     */
    toggleCrewMenu() {
        // Toggle menu - no proximity check needed
        this.showingCrewMenu = !this.showingCrewMenu;

        // Reset selection when opening
        if (this.showingCrewMenu) {
            this.selectedBreach = null;
        }
    }

    /**
     * Assign crew to breach
     */
    assignCrewToBreach(crewMember, breachIndex) {
        const breach = this.state.hazardManager.breaches[breachIndex];
        if (!breach) return false;

        // Set crew target
        crewMember.targetBreach = breachIndex;
        crewMember.targetX = breach.x * 32 + 16;
        crewMember.targetY = breach.y * 32 + 16;
        crewMember.state = 'moving';  // Start moving to breach
        crewMember.path = [];  // Reset path

        this.showingCrewMenu = false;
        this.selectedBreach = null;
        console.log(`[HazardUI] Assigned ${crewMember.name} to breach at (${breach.x}, ${breach.y})`);
        return true;
    }

    /**
     * Render all UI elements
     */
    render(ctx, shipRenderer, player) {
        // Render repair prompt if near breach
        if (this.nearestBreach && !this.playerRepairing && !this.showingCrewMenu) {
            this.renderRepairPrompt(ctx, shipRenderer);
        }

        // Render repair progress if player is repairing
        if (this.playerRepairing && this.currentRepairBreach !== null) {
            this.renderRepairProgress(ctx, shipRenderer, player);
        }

        // Render crew assignment menu (accessible from anywhere)
        if (this.showingCrewMenu) {
            this.renderCrewMenu(ctx);
        }

        // Render oxygen level in HUD
        this.renderOxygenHUD(ctx, player);
    }

    /**
     * Render "Press E/R" prompt near breach
     */
    renderRepairPrompt(ctx, shipRenderer) {
        const breach = this.nearestBreach.breach;
        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 40;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(posX - 80, posY - 25, 160, 45);

        // Border
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(posX - 80, posY - 25, 160, 45);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press E to Repair', posX, posY - 5);
        ctx.fillText('Press R to Assign Crew', posX, posY + 10);

        // Severity indicator
        const severity = breach.severity;
        ctx.fillStyle = '#ff5555';
        for (let i = 0; i < severity; i++) {
            ctx.beginPath();
            ctx.arc(posX - 20 + i * 15, posY + 25, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Render repair progress bar
     */
    renderRepairProgress(ctx, shipRenderer, player) {
        const breach = this.state.hazardManager.breaches[this.currentRepairBreach];
        if (!breach || !player) return;

        const posX = breach.x * shipRenderer.tileSize + shipRenderer.offsetX;
        const posY = breach.y * shipRenderer.tileSize + shipRenderer.offsetY - 50;

        const playerSkill = player.engineeringSkill || 0;
        const repairTime = Math.max(2, 10 - playerSkill);
        const progress = Math.min(1, this.repairProgress / repairTime);

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(posX - 60, posY - 15, 120, 25);

        // Progress bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(posX - 55, posY - 5, 110, 10);

        // Progress bar fill
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(posX - 55, posY - 5, 110 * progress, 10);

        // Progress text
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Repairing... ${Math.floor(progress * 100)}%`, posX, posY + 15);

        ctx.restore();
    }

    /**
 * Render crew assignment menu (two stages: select breach, then select crew)
 */
    renderCrewMenu(ctx) {
        const menuX = ctx.canvas.width / 2 - 200;
        const menuY = ctx.canvas.height / 2 - 150;
        const menuWidth = 400;
        const menuHeight = 300;
        // Reset clickable bounds
        this.menuBounds = [];
        ctx.save();
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        // Border
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
        if (!this.selectedBreach) {
            // STAGE 1: Select Breach
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 18px "Rajdhani", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Select Breach to Repair', menuX + menuWidth / 2, menuY + 30);
            // List breaches
            const breaches = this.state.hazardManager.breaches || [];

            if (breaches.length === 0) {
                ctx.fillStyle = '#888';
                ctx.font = '14px "Rajdhani", sans-serif';
                ctx.fillText('No breaches detected', menuX + menuWidth / 2, menuY + 100);
            } else {
                ctx.font = '14px "Rajdhani", sans-serif';
                ctx.textAlign = 'left';

                let yOffset = 60;
                for (let i = 0; i < breaches.length; i++) {
                    const breach = breaches[i];
                    const buttonX = menuX + 20;
                    const buttonY = menuY + yOffset;
                    const buttonWidth = menuWidth - 40;
                    const buttonHeight = 30;

                    // Button background
                    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
                    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

                    // Button border
                    ctx.strokeStyle = '#00f0ff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

                    // Button text
                    ctx.fillStyle = '#fff';
                    ctx.fillText(`Breach at (${breach.x}, ${breach.y}) - Severity ${breach.severity}`, buttonX + 10, buttonY + 20);

                    // Store clickable bounds
                    this.menuBounds.push({
                        x: buttonX,
                        y: buttonY,
                        width: buttonWidth,
                        height: buttonHeight,
                        type: 'breach',
                        index: i
                    });

                    yOffset += 40;
                }
            }

            // Close button
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(menuX + menuWidth - 80, menuY + menuHeight - 40, 70, 30);
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(menuX + menuWidth - 80, menuY + menuHeight - 40, 70, 30);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('Close', menuX + menuWidth - 45, menuY + menuHeight - 20);

            this.menuBounds.push({
                x: menuX + menuWidth - 80,
                y: menuY + menuHeight - 40,
                width: 70,
                height: 30,
                type: 'close'
            });

        } else {
            // STAGE 2: Select Crew
            const breach = this.state.hazardManager.breaches[this.selectedBreach];

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 18px "Rajdhani", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Assign Crew to Breach at (${breach.x}, ${breach.y})`, menuX + menuWidth / 2, menuY + 30);
            // List crew
            const crew = this.state.ship.crew || [];
            ctx.font = '14px "Rajdhani", sans-serif';
            ctx.textAlign = 'left';
            let yOffset = 60;
            for (let i = 0; i < crew.length; i++) {
                const member = crew[i];
                const skill = member.engineeringSkill || 0;

                const buttonX = menuX + 20;
                const buttonY = menuY + yOffset;
                const buttonWidth = menuWidth - 40;
                const buttonHeight = 30;

                // Button background
                ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
                ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

                // Button border
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 1;
                ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

                // Button text - name and role
                ctx.fillStyle = '#fff';
                ctx.fillText(`${member.name} - ${member.role}`, buttonX + 10, buttonY + 20);

                // Engineering skill
                ctx.fillStyle = skill > 0 ? '#00ff00' : '#888';
                ctx.textAlign = 'right';
                ctx.fillText(`Engineering: ${skill}`, buttonX + buttonWidth - 10, buttonY + 20);
                ctx.textAlign = 'left';

                // Store clickable bounds
                this.menuBounds.push({
                    x: buttonX,
                    y: buttonY,
                    width: buttonWidth,
                    height: buttonHeight,
                    type: 'crew',
                    crewMember: member
                });

                yOffset += 40;
            }

            // Back button
            ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
            ctx.fillRect(menuX + 10, menuY + menuHeight - 40, 70, 30);
            ctx.strokeStyle = '#888';
            ctx.strokeRect(menuX + 10, menuY + menuHeight - 40, 70, 30);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('Back', menuX + 45, menuY + menuHeight - 20);

            this.menuBounds.push({
                x: menuX + 10,
                y: menuY + menuHeight - 40,
                width: 70,
                height: 30,
                type: 'back'
            });
        }
        ctx.restore();
    }

    /**
     * Render oxygen level in HUD
     */
    renderOxygenHUD(ctx, player) {
        if (!player) return;

        const gridX = Math.floor(player.x / 32);
        const gridY = Math.floor(player.y / 32);

        const oxygenLevel = this.state.hazardManager.getOxygenAt(gridX, gridY);

        // Position in top-left HUD
        const posX = 20;
        const posY = 120;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(posX, posY, 120, 30);

        // Border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, 120, 30);

        // Oxygen level color
        let color;
        if (oxygenLevel >= 70) color = '#00ff00';
        else if (oxygenLevel >= 30) color = '#ffff00';
        else color = '#ff0000';

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('O₂:', posX + 10, posY + 20);

        // Level
        ctx.fillStyle = color;
        ctx.font = 'bold 14px "Rajdhani", sans-serif';
        ctx.fillText(`${Math.round(oxygenLevel)}%`, posX + 45, posY + 20);

        // Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(posX + 90, posY + 10, 20, 15);
        ctx.fillStyle = color;
        ctx.fillRect(posX + 90, posY + 10, 20 * (oxygenLevel / 100), 15);

        ctx.restore();
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
    /**
     * Handle mouse click on crew menu
     * Returns true if click was handled
     */
    handleClick(mouseX, mouseY) {
        if (!this.showingCrewMenu) return false;

        // Check if click is on any menu bounds
        for (const bound of this.menuBounds) {
            if (mouseX >= bound.x && mouseX <= bound.x + bound.width &&
                mouseY >= bound.y && mouseY <= bound.y + bound.height) {

                if (bound.type === 'breach') {
                    // Select this breach for crew assignment
                    this.selectedBreach = bound.index;
                    return true;
                }

                if (bound.type === 'crew') {
                    // Assign this crew member to selected breach
                    this.assignCrewToBreach(bound.crewMember, this.selectedBreach);
                    return true;
                }

                if (bound.type === 'back') {
                    // Go back to breach selection
                    this.selectedBreach = null;
                    return true;
                }

                if (bound.type === 'close') {
                    // Close menu
                    this.showingCrewMenu = false;
                    this.selectedBreach = null;
                    return true;
                }
            }
        }

        return false;
    }

}
