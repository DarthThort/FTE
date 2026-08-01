/**
 * CrewRepairUI.js
 * HTML-based UI panel for assigning crew to repair breaches
 */

class CrewRepairUI {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.selectedBreachIndex = null;

        this.createUI();
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'crew-repair-ui';
        this.container.className = 'ui-panel';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-height: 600px;
            background: rgba(10, 10, 25, 0.95);
            border: 2px solid #00f0ff;
            border-radius: 8px;
            padding: 20px;
            display: none;
            z-index: 1000;
            font-family: 'Rajdhani', sans-serif;
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(0, 240, 255, 0.3);
            padding-bottom: 10px;
        `;

        const title = document.createElement('h2');
        title.textContent = 'CREW REPAIR ASSIGNMENT';
        title.style.cssText = `
            color: #00f0ff;
            margin: 0;
            font-size: 20px;
            font-weight: bold;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid #ff0000;
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Content area
        this.contentArea = document.createElement('div');
        this.contentArea.style.cssText = `
            max-height: 500px;
            overflow-y: auto;
        `;

        this.container.appendChild(header);
        this.container.appendChild(this.contentArea);
        document.body.appendChild(this.container);

        // Make draggable (header is drag handle)
        if (window.draggableUI) {
            // Wait a frame to ensure DOM is ready
            setTimeout(() => {
                window.draggableUI.makeDraggable(this.container, 'crew-repair-panel', '.ui-panel > div:first-child');
            }, 0);
        }
    }

    show() {
        this.visible = true;
        this.selectedBreachIndex = null;
        this.container.style.display = 'block';
        this.render();
    }

    hide() {
        this.visible = false;
        this.container.style.display = 'none';
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    render() {
        if (!this.visible) return;

        this.contentArea.innerHTML = '';

        if (this.selectedBreachIndex === null) {
            // STAGE 1: Select Breach
            this.renderBreachSelection();
        } else {
            // STAGE 2: Select Crew
            this.renderCrewSelection();
        }
    }

    renderBreachSelection() {
        const breaches = this.game.state.hazardManager.breaches || [];

        if (breaches.length === 0) {
            this.contentArea.innerHTML = `
                <div style="text-align: center; color: #888; padding: 40px;">
                    No breaches detected
                </div>
            `;
            return;
        }

        const section = document.createElement('div');
        section.innerHTML = '<h3 style="color: #00f0ff; margin-bottom: 15px;">Select Breach to Repair:</h3>';

        breaches.forEach((breach, index) => {
            const btn = document.createElement('button');
            btn.className = 'breach-button';
            btn.style.cssText = `
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                background: rgba(0, 240, 255, 0.1);
                border: 1px solid #00f0ff;
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                text-align: left;
                font-family: 'Rajdhani', sans-serif;
                transition: background 0.2s;
            `;
            btn.innerHTML = `
                <strong>Breach at (${breach.x}, ${breach.y})</strong><br>
                <span style="color: #ff5555;">Severity: ${breach.severity}</span>
            `;
            btn.onmouseover = () => btn.style.background = 'rgba(0, 240, 255, 0.2)';
            btn.onmouseout = () => btn.style.background = 'rgba(0, 240, 255, 0.1)';
            btn.onclick = () => {
                this.selectedBreachIndex = index;
                this.render();
            };

            section.appendChild(btn);
        });

        this.contentArea.appendChild(section);
    }

    renderCrewSelection() {
        const breach = this.game.state.hazardManager.breaches[this.selectedBreachIndex];
        const crew = this.game.state.ship.crew || [];

        const section = document.createElement('div');

        // Back button
        const backBtn = document.createElement('button');
        backBtn.textContent = '← Back to Breach Selection';
        backBtn.style.cssText = `
            padding: 8px 15px;
            margin-bottom: 15px;
            background: rgba(128, 128, 128, 0.2);
            border: 1px solid #888;
            border-radius: 4px;
            color: #fff;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
        `;
        backBtn.onclick = () => {
            this.selectedBreachIndex = null;
            this.render();
        };
        section.appendChild(backBtn);

        // Title
        const title = document.createElement('h3');
        title.textContent = `Assign Crew to Breach at (${breach.x}, ${breach.y})`;
        title.style.cssText = 'color: #00f0ff; margin-bottom: 15px;';
        section.appendChild(title);

        // Crew list
        crew.forEach((member) => {
            const skill = member.engineeringSkill || 0;

            const btn = document.createElement('button');
            btn.className = 'crew-button';
            btn.style.cssText = `
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                background: rgba(0, 240, 255, 0.1);
                border: 1px solid #00f0ff;
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                text-align: left;
                font-family: 'Rajdhani', sans-serif;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background 0.2s;
            `;

            const skillColor = skill > 0 ? '#00ff00' : '#888';
            const avatarUrl = window.getCrewAvatarURL ? window.getCrewAvatarURL(member) : '';
            btn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatarUrl}" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #00f0ff; background: #0f172a; flex-shrink: 0;" />
                    <span><strong>${member.name}</strong> - ${member.role} (${member.species})</span>
                </div>
                <span style="color: ${skillColor}; font-weight: bold;">Ingeniería: ${skill}</span>
            `;

            btn.onmouseover = () => btn.style.background = 'rgba(0, 240, 255, 0.2)';
            btn.onmouseout = () => btn.style.background = 'rgba(0, 240, 255, 0.1)';
            btn.onclick = () => this.assignCrew(member, this.selectedBreachIndex);

            section.appendChild(btn);
        });

        this.contentArea.appendChild(section);
    }

    assignCrew(crewMember, breachIndex) {
        const breach = this.game.state.hazardManager.breaches[breachIndex];
        if (!breach) return;

        // Make sure crew is not assigned to a system
        const assignedSystem = this.game.state.ship.systems.find(s => s.assignedCrew?.id === crewMember.id);
        if (assignedSystem) {
            assignedSystem.assignedCrew = null;
            console.log(`[CrewRepairUI] Unassigned ${crewMember.name} from ${assignedSystem.type} system`);
        }

        // HACK: Teleport crew to breach and start repairing immediately (bypassing movement)
        crewMember.x = breach.x * 32 + 16;
        crewMember.y = breach.y * 32 + 16;
        crewMember.targetBreach = breachIndex;
        crewMember.targetX = breach.x * 32 + 16;
        crewMember.targetY = breach.y * 32 + 16;
        crewMember.state = 'repairing';  // GO STRAIGHT TO REPAIRING
        crewMember.repairProgress = 0;
        crewMember.path = [];

        console.log(`[CrewRepairUI] 🔧 HACK: ${crewMember.name} TELEPORTED to breach and REPAIRING NOW`);

        this.hide();
    }
}
