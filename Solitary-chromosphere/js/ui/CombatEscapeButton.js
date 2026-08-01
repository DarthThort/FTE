/**
 * CombatEscapeButton - Standalone escape button for combat FTL jump
 */
class CombatEscapeButton {
    constructor(game) {
        this.game = game;
        this.button = null;
        this.container = null;
    }

    show() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'combat-escape-overlay';
        this.container.style.cssText = `
            position: fixed;
            top: 130px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            pointer-events: none;
        `;

        this.button = document.createElement('button');
        this.button.id = 'escape-btn-new';
        this.button.innerHTML = '🚀 FTL ESCAPE';
        this.button.style.cssText = `
            padding: 8px 20px;
            font-size: 0.95rem;
            background: rgba(255, 51, 102, 0.2);
            border: 2px solid var(--danger);
            color: var(--danger);
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--font-header);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            box-shadow: 0 0 15px rgba(255, 51, 102, 0.4);
        `;

        this.button.addEventListener('click', () => this.handleClick());
        this.button.addEventListener('mouseover', () => {
            if (!this.button.disabled) {
                this.button.style.transform = 'scale(1.05)';
                this.button.style.boxShadow = '0 0 25px rgba(255, 51, 102, 0.7)';
            }
        });
        this.button.addEventListener('mouseout', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.boxShadow = '0 0 15px rgba(255, 51, 102, 0.4)';
        });

        this.container.appendChild(this.button);
        document.body.appendChild(this.container);
    }

    hide() {
        if (this.container) {
            this.container.remove();
            this.container = null;
            this.button = null;
        }
    }

    handleClick() {
        if (!this.game.state.combatManager) return;
        this.game.state.combatManager.attemptPlayerEscape();
    }

    update() {
        if (!this.game.state.combatManager || !this.game.state.combatManager.active) {
            this.hide();
            return;
        }

        if (this.button && this.game.state.combatManager) {
            const cm = this.game.state.combatManager;
            const now = Date.now() / 1000;
            const bridgeModule = getModule ? getModule(this.game.state.ship.hardpoints.bridge) : null;
            const bridgeTier = bridgeModule?.tier || 1;
            const cooldown = Math.max(5, cm.escapeCooldownBase - (bridgeTier - 1));
            const timeSinceLastAttempt = now - cm.lastEscapeAttempt;

            if (timeSinceLastAttempt < cooldown) {
                const remaining = Math.ceil(cooldown - timeSinceLastAttempt);
                this.button.innerHTML = `⏳ FTL CHARGING (${remaining}s)`;
                this.button.disabled = true;
                this.button.style.opacity = '0.5';
                this.button.style.cursor = 'not-allowed';
            } else {
                this.button.innerHTML = '🚀 FTL ESCAPE';
                this.button.disabled = false;
                this.button.style.opacity = '1';
                this.button.style.cursor = 'pointer';
            }
        }
    }
}
