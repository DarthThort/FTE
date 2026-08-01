/**
 * CombatPauseButton - Standalone pause button for combat
 * Controls tactical pause (SPACE key or click)
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
            top: 75px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            pointer-events: none;
        `;

        // Create button
        this.button = document.createElement('button');
        this.button.id = 'pause-btn-new';
        this.button.innerHTML = '⏸️ PAUSE <span style="font-size:0.8rem; opacity:0.8;">[SPACE]</span>';
        this.button.style.cssText = `
            padding: 10px 22px;
            font-size: 1.05rem;
            background: rgba(255, 204, 0, 0.2);
            border: 2px solid var(--warning);
            color: var(--warning);
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--font-header);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            box-shadow: 0 0 20px rgba(255, 204, 0, 0.4);
        `;

        // Add event listener
        this.button.addEventListener('click', () => this.handleClick());
        this.button.addEventListener('mouseover', () => {
            this.button.style.transform = 'scale(1.05)';
            this.button.style.boxShadow = '0 0 30px rgba(255, 204, 0, 0.7)';
        });
        this.button.addEventListener('mouseout', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
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
    }

    hide() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.button = null;

            if (this.keyListener) {
                document.removeEventListener('keydown', this.keyListener);
                this.keyListener = null;
            }
        }
    }

    handleClick() {
        if (!this.game.state.combatManager) return;

        this.game.state.combatManager.togglePause();
        const paused = this.game.state.combatManager.paused;

        if (paused) {
            this.button.innerHTML = '▶️ RESUME <span style="font-size:0.8rem; opacity:0.8;">[SPACE]</span>';
            this.button.style.background = 'rgba(0, 255, 157, 0.25)';
            this.button.style.borderColor = 'var(--secondary)';
            this.button.style.color = 'var(--secondary)';
            this.button.style.boxShadow = '0 0 25px rgba(0, 255, 157, 0.6)';
        } else {
            this.button.innerHTML = '⏸️ PAUSE <span style="font-size:0.8rem; opacity:0.8;">[SPACE]</span>';
            this.button.style.background = 'rgba(255, 204, 0, 0.2)';
            this.button.style.borderColor = 'var(--warning)';
            this.button.style.color = 'var(--warning)';
            this.button.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
        }
    }

    update() {
        if (!this.game.state.combatManager || !this.game.state.combatManager.active) {
            this.hide();
        }
    }
}
