/**
 * CrewAssignmentMenu.js
 * Handles the crew assignment UI with two-stage selection: breach → crew
 */

class CrewAssignmentMenu {
    constructor(gameState) {
        this.state = gameState;
        this.showing = false;
        this.selectedBreach = null;
        this.menuBounds = [];  // Clickable button areas
    }

    /**
     * Toggle menu visibility
     */
    toggle() {
        this.showing = !this.showing;

        // Reset selection when opening
        if (this.showing) {
            this.selectedBreach = null;
        }
    }

    /**
     * Handle mouse click on menu
     * Returns true if click was handled
     */
    handleClick(mouseX, mouseY) {
        if (!this.showing) return false;

        console.log('[CrewMenu] Click at', mouseX, mouseY, 'Bounds:', this.menuBounds.length);

        // Debug: log all bounds
        this.menuBounds.forEach((bound, i) => {
            console.log(`  Bound ${i}: x=${bound.x}, y=${bound.y}, w=${bound.width}, h=${bound.height}, type=${bound.type}`);
        });

        // Check if click is on any menu bounds
        for (const bound of this.menuBounds) {
            if (mouseX >= bound.x && mouseX <= bound.x + bound.width &&
                mouseY >= bound.y && mouseY <= bound.y + bound.height) {

                console.log('[CrewMenu] Hit bound type:', bound.type);

                if (bound.type === 'breach') {
                    // Select this breach for crew assignment
                    this.selectedBreach = bound.index;
                    console.log('[CrewMenu] Selected breach:', bound.index);
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
                    console.log('[CrewMenu] Back to breach selection');
                    return true;
                }

                if (bound.type === 'close') {
                    // Close menu
                    this.showing = false;
                    this.selectedBreach = null;
                    console.log('[CrewMenu] Closing menu');
                    return true;
                }
            }
        }

        console.log('[CrewMenu] No bound hit');
        return false;
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

        this.showing = false;
        this.selectedBreach = null;
        console.log(`[CrewMenu] Assigned ${crewMember.name} to breach at (${breach.x}, ${breach.y})`);
        return true;
    }

    /**
     * Render the menu (two-stage: select breach → select crew)
     */
    render(ctx) {
        if (!this.showing) return;

        const menuX = ctx.canvas.width / 2 - 200;
        const menuY = ctx.canvas.height / 2 - 150;
        const menuWidth = 400;
        const menuHeight = 300;

        console.log('[CrewMenu] Canvas size:', ctx.canvas.width, 'x', ctx.canvas.height);
        console.log('[CrewMenu] Menu position:', menuX, menuY, 'size:', menuWidth, menuHeight);

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

        if (this.selectedBreach === null) {
            // STAGE 1: Select Breach
            this.renderBreachSelection(ctx, menuX, menuY, menuWidth, menuHeight);
        } else {
            // STAGE 2: Select Crew
            this.renderCrewSelection(ctx, menuX, menuY, menuWidth, menuHeight);
        }

        ctx.restore();
    }

    /**
     * Render breach selection stage
     */
    renderBreachSelection(ctx, menuX, menuY, menuWidth, menuHeight) {
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
        const closeX = menuX + menuWidth - 80;
        const closeY = menuY + menuHeight - 40;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(closeX, closeY, 70, 30);
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(closeX, closeY, 70, 30);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Close', closeX + 35, closeY + 20);

        this.menuBounds.push({
            x: closeX,
            y: closeY,
            width: 70,
            height: 30,
            type: 'close'
        });
    }

    /**
     * Render crew selection stage
     */
    renderCrewSelection(ctx, menuX, menuY, menuWidth, menuHeight) {
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
        const backX = menuX + 10;
        const backY = menuY + menuHeight - 40;
        ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.fillRect(backX, backY, 70, 30);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(backX, backY, 70, 30);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Back', backX + 35, backY + 20);

        this.menuBounds.push({
            x: backX,
            y: backY,
            width: 70,
            height: 30,
            type: 'back'
        });
    }
}
