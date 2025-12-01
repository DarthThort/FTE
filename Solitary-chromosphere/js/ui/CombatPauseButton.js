/**
 * CombatPauseButton - Standalone pause button for combat
 * Created as a separate overlay to avoid pointer-events issues
 */
class CombatPauseButton {
    constructor(game) {
        this.game = game;
        this.button = null;
        this.container = null;
    }

    show() {
        if (this.container) return; // Already visible

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'combat-pause-overlay';
        this.container.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999999;
            pointer-events: none;
        `;

        // Create button
        this.button = document.createElement('button');
        this.button.id = 'pause-btn-new';
        this.button.textContent = '⏸️ PAUSE [SPACE]';
        this.button.style.cssText = `
            padding: 12px 24px;
            font-size: 1.1rem;
            background: rgba(255, 170, 0, 0.3);
            border: 2px solid #ffaa00;
            color: #ffaa00;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.2s;
            pointer-events: auto;
            box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
        `;

        // Add event listener
        this.button.addEventListener('click', () => this.handleClick());
        this.button.addEventListener('mouseover', () => {
            this.button.style.transform = 'scale(1.1)';
            this.button.style.boxShadow = '0 0 30px rgba(255, 170, 0, 0.8)';
        });
        this.button.addEventListener('mouseout', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.5)';
        });

        // Add keyboard listener for SPACE
        this.keyListener = (e) => {
            if (e.code === 'Space' && this.game.state.combatManager && this.game.state.combatManager.active) {
                e.preventDefault();
                this.handleClick();
            }
        };
        document.addEventListener('keydown', this.keyListener);

        this.container.appendChild(this.button);
        document.body.appendChild(this.container);

        console.log('[CombatPauseButton] Button created and visible');
    }

    hide() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.button = null;

            // Remove keyboard listener
            if (this.keyListener) {
                document.removeEventListener('keydown', this.keyListener);
                this.keyListener = null;
            }

            console.log('[CombatPauseButton] Button hidden');
        }
    }

    handleClick() {
        console.log('[CombatPauseButton] Button clicked!');

        if (!this.game.state.combatManager) {
            console.error('[CombatPauseButton] No combat manager!');
            return;
        }

        this.game.state.combatManager.togglePause();
        const paused = this.game.state.combatManager.paused;

        console.log('[CombatPauseButton] Paused is now:', paused);

        // Update button appearance
        if (paused) {
            this.button.textContent = '▶️ RESUME [SPACE]';
            this.button.style.background = 'rgba(0, 255, 85, 0.3)';
            this.button.style.borderColor = '#00ff55';
            this.button.style.color = '#00ff55';
            this.button.style.boxShadow = '0 0 20px rgba(0, 255, 85, 0.5)';
        } else {
            this.button.textContent = '⏸️ PAUSE [SPACE]';
            this.button.style.background = 'rgba(255, 170, 0, 0.3)';
            this.button.style.borderColor = '#ffaa00';
            this.button.style.color = '#ffaa00';
            this.button.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.5)';
        }
    }

    update() {
        // Update button state if combat ends
        if (!this.game.state.combatManager || !this.game.state.combatManager.active) {
            this.hide();
        }
    }
}
