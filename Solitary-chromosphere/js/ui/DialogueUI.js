/**
 * DialogueUI - Interactive dialogue system for encounters
 * Shows encounter messages and player choice options
 */
class DialogueUI {
    constructor(game) {
        this.game = game;
        this.currentEncounter = null;
    }

    /**
     * Show encounter dialogue with options
     */
    show(encounter) {
        this.currentEncounter = encounter;

        const overlay = document.createElement('div');
        overlay.id = 'dialogue-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .dialogue-option {
                    animation: slideUp 0.3s ease forwards;
                    opacity: 0;
                }
                .dialogue-option:nth-child(1) { animation-delay: 0.1s; }
                .dialogue-option:nth-child(2) { animation-delay: 0.2s; }
                .dialogue-option:nth-child(3) { animation-delay: 0.3s; }
                .dialogue-option:nth-child(4) { animation-delay: 0.4s; }
            </style>

            <div style="
                max-width: 700px;
                width: 90%;
                background: linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98));
                border: 3px solid #00f0ff;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 0 60px rgba(0,240,255,0.6), inset 0 0 40px rgba(0,240,255,0.1);
                font-family: var(--font-tech);
            ">
                <!-- Ship Icon -->
                <div style="
                    text-align: center;
                    font-size: 5rem;
                    margin-bottom: 25px;
                    text-shadow: 0 0 20px currentColor;
                ">
                    ${this.getShipIcon(encounter)}
                </div>

                <!-- Encounter Type Badge -->
                <div style="
                    text-align: center;
                    margin-bottom: 15px;
                ">
                    <span style="
                        display: inline-block;
                        padding: 5px 15px;
                        background: ${this.getCategoryColor(encounter.category)};
                        border-radius: 20px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">${encounter.category}</span>
                </div>

                <!-- Message -->
                <div style="
                    font-size: 1.3rem;
                    color: #00f0ff;
                    text-align: center;
                    margin-bottom: 35px;
                    line-height: 1.8;
                    text-shadow: 0 0 10px rgba(0,240,255,0.5);
                ">
                    ${encounter.message}
                </div>

                <!-- Options -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                ">
                    ${this.generateOptions(encounter)}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    /**
     * Get ship icon based on encounter type
     */
    getShipIcon(encounter) {
        const icons = {
            'combat': '🚀',
            'dialogue': '💬',
            'help': '🆘',
            'trade': '🛒',
            'refugee': '👨‍👩‍👧',
            'anomaly': '❓',
            'quest': '📜'
        };
        return icons[encounter.type] || '🚀';
    }

    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = {
            'hostile': 'rgba(255, 0, 85, 0.3)',
            'neutral': 'rgba(255, 170, 0, 0.3)',
            'friendly': 'rgba(0, 255, 85, 0.3)'
        };
        return colors[category] || 'rgba(100, 100, 100, 0.3)';
    }

    /**
     * Generate option buttons based on encounter type
     */
    generateOptions(encounter) {
        const options = [];

        // Combat/Dialogue encounters
        if (encounter.type === 'dialogue' || encounter.type === 'combat') {
            // Option to pay/negotiate
            if (encounter.canNegotiate && encounter.demandCredits) {
                options.push(this.createOptionButton(
                    '💰 Pay Credits',
                    `Pay ${encounter.demandCredits} credits to avoid conflict`,
                    () => this.handlePay(encounter),
                    '#ffaa00'
                ));
            }

            // Option to fight
            options.push(this.createOptionButton(
                '⚔️ Fight',
                'Engage in combat',
                () => this.handleFight(encounter),
                '#ff0055'
            ));

            // Option to flee
            options.push(this.createOptionButton(
                '🚀 Attempt to Flee',
                `${this.getFleeChance()}% chance to escape`,
                () => this.handleFlee(encounter),
                '#00aaff'
            ));
        }

        // Help/Distress encounters
        if (encounter.type === 'help') {
            options.push(this.createOptionButton(
                '🆘 Provide Assistance',
                `Cost: ${encounter.cost?.scrap || 0} scrap, ${encounter.cost?.fuel || 0} fuel`,
                () => this.handleHelp(encounter),
                '#00ff55'
            ));

            options.push(this.createOptionButton(
                '⏩ Ignore',
                'Continue on your way',
                () => this.close(),
                '#666666'
            ));
        }

        // Trade encounters
        if (encounter.type === 'trade') {
            options.push(this.createOptionButton(
                '🛒 Browse Goods',
                'See what they have to offer',
                () => this.handleTrade(encounter),
                '#00ff55'
            ));

            options.push(this.createOptionButton(
                '👋 Decline',
                'Not interested',
                () => this.close(),
                '#666666'
            ));
        }

        // Refugee encounters
        if (encounter.type === 'refugee') {
            const passengerCount = Math.floor(Math.random() * (encounter.passengerCount.max - encounter.passengerCount.min + 1)) + encounter.passengerCount.min;

            options.push(this.createOptionButton(
                `🚶 Take Passengers (${passengerCount})`,
                `Reward: ${passengerCount * encounter.rewardPerPassenger} credits at next station`,
                () => this.handleRefugees(encounter, passengerCount),
                '#00ff55'
            ));

            options.push(this.createOptionButton(
                '😔 Refuse',
                'Not enough space',
                () => this.close(),
                '#666666'
            ));
        }

        // Anomaly encounters
        if (encounter.type === 'anomaly') {
            options.push(this.createOptionButton(
                '🔍 Investigate',
                'Unknown outcome - could be good or bad',
                () => this.handleAnomaly(encounter),
                '#aa00ff'
            ));

            options.push(this.createOptionButton(
                '🚫 Avoid',
                'Better safe than sorry',
                () => this.close(),
                '#666666'
            ));
        }

        return options.join('');
    }

    /**
     * Create option button HTML
     */
    createOptionButton(title, description, onClick, color) {
        const buttonId = `dialogue-option-${Math.random().toString(36).substr(2, 9)}`;

        // Store callback
        if (!window.dialogueCallbacks) window.dialogueCallbacks = {};
        window.dialogueCallbacks[buttonId] = onClick;

        return `
            <button 
                id="${buttonId}"
                onclick="window.dialogueCallbacks['${buttonId}']()"
                class="dialogue-option"
                style="
                    padding: 18px 25px;
                    background: linear-gradient(135deg, ${color}22, ${color}11);
                    border: 2px solid ${color};
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    font-family: var(--font-tech);
                "
                onmouseover="
                    this.style.background = 'linear-gradient(135deg, ${color}44, ${color}22)';
                    this.style.transform = 'translateX(5px)';
                    this.style.boxShadow = '0 0 20px ${color}';
                "
                onmouseout="
                    this.style.background = 'linear-gradient(135deg, ${color}22, ${color}11)';
                    this.style.transform = 'translateX(0)';
                    this.style.boxShadow = 'none';
                "
            >
                <div style="font-size: 1.1rem; margin-bottom: 5px;">${title}</div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">${description}</div>
            </button>
        `;
    }

    /**
     * Calculate flee chance
     */
    getFleeChance() {
        const engineSystem = this.game.state.ship.systems.find(s => s.type === 'engine');
        const baseChance = 30;
        const engineBonus = engineSystem ? engineSystem.level * 15 : 0;
        return baseChance + engineBonus;
    }

    /**
     * Handler: Pay credits
     */
    handlePay(encounter) {
        const cost = encounter.demandCredits;

        if (this.game.state.credits >= cost) {
            this.game.state.credits -= cost;
            this.showResult(
                '💰 Payment Accepted',
                `You paid ${cost} credits. They let you pass.`,
                '#00ff55'
            );
            setTimeout(() => this.close(), 2000);
        } else {
            this.showResult(
                '❌ Insufficient Funds',
                `You don't have ${cost} credits! They attack!`,
                '#ff0055'
            );
            setTimeout(() => this.startCombat(encounter), 1500);
        }
    }

    /**
     * Handler: Fight
     */
    handleFight(encounter) {
        this.close();
        this.startCombat(encounter);
    }

    /**
     * Handler: Flee
     */
    handleFlee(encounter) {
        const fleeChance = this.getFleeChance() / 100;

        if (Math.random() < fleeChance) {
            // Success
            this.game.state.fuel = Math.max(0, this.game.state.fuel - 10);
            this.showResult(
                '🚀 Escaped!',
                'You managed to escape. Lost 10 fuel in the process.',
                '#00ff55'
            );
            setTimeout(() => this.close(), 2000);
        } else {
            // Failed
            this.showResult(
                '❌ Failed to Escape',
                'They blocked your exit! Combat starts.',
                '#ff0055'
            );
            setTimeout(() => this.startCombat(encounter), 1500);
        }
    }

    /**
     * Handler: Help distressed ship
     */
    handleHelp(encounter) {
        // Check resources
        const cost = encounter.cost;
        if (this.game.state.inventory.scrap < cost.scrap) {
            this.showResult(
                '❌ Not Enough Resources',
                `You need ${cost.scrap} scrap to help.`,
                '#ff0055'
            );
            setTimeout(() => this.close(), 2000);
            return;
        }

        // Pay cost
        this.game.state.inventory.scrap -= cost.scrap;
        this.game.state.fuel = Math.max(0, this.game.state.fuel - cost.fuel);

        // Random reward
        if (Math.random() < encounter.rewardChance) {
            const credits = Math.floor(Math.random() * (encounter.rewards.credits.max - encounter.rewards.credits.min + 1)) + encounter.rewards.credits.min;
            this.game.state.credits += credits;

            this.showResult(
                '✨ Grateful Survivors',
                `They thank you and give ${credits} credits!`,
                '#00ff55'
            );
        } else {
            this.showResult(
                '😔 No Reward',
                'They thank you but have nothing to offer. You did the right thing.',
                '#ffaa00'
            );
        }

        setTimeout(() => this.close(), 2500);
    }

    /**
     * Handler: Trade
     */
    handleTrade(encounter) {
        this.close();
        // TODO: Open trade UI
        console.log('[DialogueUI] Trade encounter - opening port UI');
        this.game.ui.renderPortView();
    }

    /**
     * Handler: Take refugees
     */
    handleRefugees(encounter, count) {
        // TODO: Add passenger system
        // For now, just add to state
        if (!this.game.state.passengers) this.game.state.passengers = 0;
        this.game.state.passengers += count;

        const reward = count * encounter.rewardPerPassenger;

        this.showResult(
            '👥 Passengers Aboard',
            `${count} refugees board your ship. Drop them at next station for ${reward} credits.`,
            '#00ff55'
        );

        setTimeout(() => this.close(), 2500);
    }

    /**
     * Handler: Investigate anomaly
     */
    handleAnomaly(encounter) {
        const totalWeight = encounter.outcomes.reduce((sum, o) => sum + o.chance, 0);
        let random = Math.random() * totalWeight;

        for (const outcome of encounter.outcomes) {
            random -= outcome.chance;
            if (random <= 0) {
                this.processAnomalyOutcome(outcome);
                break;
            }
        }
    }

    processAnomalyOutcome(outcome) {
        let message = '';
        let color = '#00aaff';

        switch (outcome.type) {
            case 'loot':
                this.game.state.inventory.scrap += outcome.reward.scrap;
                message = `Found ${outcome.reward.scrap} scrap!`;
                color = '#00ff55';
                break;
            case 'damage':
                this.game.state.ship.health -= outcome.damage;
                message = `Unexpected radiation! Lost ${outcome.damage} hull points.`;
                color = '#ff0055';
                break;
            case 'fuel':
                this.game.state.fuel += outcome.fuel;
                message = `Discovered fuel cache! +${outcome.fuel} fuel.`;
                color = '#00ff55';
                break;
            case 'nothing':
                message = 'Nothing of interest found.';
                color = '#666666';
                break;
        }

        this.showResult('🔍 Anomaly Result', message, color);
        setTimeout(() => this.close(), 2500);
    }

    /**
     * Start combat
     */
    startCombat(encounter) {
        this.close();
        console.log('[DialogueUI] Starting combat with', encounter.enemyType);
        // Let EncounterManager handle combat initialization
        if (this.game.state.encounterManager) {
            this.game.state.encounterManager.startCombatFromDialogue(encounter);
        }
    }

    /**
     * Show result message
     */
    showResult(title, message, color) {
        const overlay = document.getElementById('dialogue-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div style="
                max-width: 600px;
                width: 90%;
                background: linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98));
                border: 3px solid ${color};
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 0 60px ${color}, inset 0 0 40px ${color}22;
                font-family: var(--font-tech);
                text-align: center;
                animation: slideUp 0.3s ease;
            ">
                <div style="font-size: 2rem; color: ${color}; margin-bottom: 20px; text-shadow: 0 0 20px ${color};">
                    ${title}
                </div>
                <div style="font-size: 1.2rem; color: #fff; line-height: 1.6;">
                    ${message}
                </div>
            </div>
        `;
    }

    /**
     * Close dialogue
     */
    close() {
        const overlay = document.getElementById('dialogue-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
        this.currentEncounter = null;

        // Clean up callbacks
        if (window.dialogueCallbacks) {
            window.dialogueCallbacks = {};
        }
    }
}
