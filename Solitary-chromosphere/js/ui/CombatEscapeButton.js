/**
 * CombatEscapeButton - Standalone escape button for combat
 * Created as a separate overlay with proper pointer-events
 */
class CombatEscapeButton {
    constructor(game) {
        this.game = game;
        this.button = null;
        this.container = null;
    }

    show() {
        if (this.container) return; // Already visible

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'combat-escape-overlay';
        this.container.style.cssText = `
            position: fixed;
            top: 160px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999999;
            pointer-events: none;
        `;

        // Create button
        this.button = document.createElement('button');
        this.button.id = 'escape-btn-new';
        this.button.textContent = '🏃 ESCAPE';
        this.button.style.cssText = `
            padding: 12px 24px;
            font-size: 1.1rem;
            background: rgba(255, 0, 85, 0.3);
            border: 2px solid #ff0055;
            color: #ff0055;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.2s;
            pointer-events: auto;
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
        `;

        // Add event listener
        this.button.addEventListener('click', () => this.handleClick());
        this.button.addEventListener('mouseover', () => {
            this.button.style.transform = 'scale(1.1)';
            this.button.style.boxShadow = '0 0 30px rgba(255, 0, 85, 0.8)';
        });
        this.button.addEventListener('mouseout', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.boxShadow = '0 0 20px rgba(255, 0, 85, 0.5)';
        });

        this.container.appendChild(this.button);
        document.body.appendChild(this.container);

        console.log('[CombatEscapeButton] Button created and visible');
    }

    hide() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.button = null;
            console.log('[CombatEscapeButton] Button hidden');
        }
    }

    handleClick() {
        console.log('[CombatEscapeButton] Escape button clicked!');

        if (!this.game.state.combatManager) {
            console.error('[CombatEscapeButton] No combat manager!');
            return;
        }

        // Call attemptPlayerEscape
        this.game.state.combatManager.attemptPlayerEscape();
    }

    update() {
        // Update button state if combat ends
        if (!this.game.state.combatManager || !this.game.state.combatManager.active) {
            this.hide();
        }
    }
}
