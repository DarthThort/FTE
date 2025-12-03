/**
 * InventoryUI - Display and manage ship inventory, resources, and cargo
 */
class InventoryUI {
    constructor(game) {
        this.game = game;
    }

    /**
     * Show inventory modal
     */
    show() {
        // Remove existing if any
        this.close();

        const overlay = document.createElement('div');
        overlay.id = 'inventory-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999998;
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
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>

            <div style="
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                background: linear-gradient(135deg, rgba(10,10,30,0.98), rgba(20,10,40,0.98));
                border: 3px solid #00f0ff;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 0 60px rgba(0,240,255,0.6);
                font-family: var(--font-tech);
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            ">
                <!-- Header -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    border-bottom: 2px solid #00f0ff;
                    padding-bottom: 15px;
                ">
                    <h2 style="margin: 0; color: #00f0ff; font-size: 1.8rem;">📦 INVENTORY</h2>
                    <button onclick="game.ui.inventoryUI.close()" style="
                        background: none;
                        border: 2px solid #ff0055;
                        color: #ff0055;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                        font-weight: bold;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#ff005522'" onmouseout="this.style.background='none'">
                        ✕ CLOSE
                    </button>
                </div>

                <!-- Resources Section -->
                ${this.renderResourcesSection()}

                <!-- Cargo Section -->
                ${this.renderCargoSection()}

                <!-- Passengers Section -->
                ${this.renderPassengersSection()}
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on ESC
        this.escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this.escHandler);

        // Close on click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
    }

    /**
     * Render resources section
     */
    renderResourcesSection() {
        const state = this.game.state;
        const credits = state.credits || 0;
        const fuel = state.fuel || 0;
        const maxFuel = state.ship?.maxFuel || 100;
        const scrap = state.inventory?.scrap || 0;

        const fuelPercent = (fuel / maxFuel) * 100;
        const fuelColor = fuelPercent > 50 ? '#00ff55' : fuelPercent > 25 ? '#ffaa00' : '#ff0055';

        return `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #00f0ff; margin-bottom: 15px; font-size: 1.2rem;">💰 RESOURCES</h3>
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(0,240,255,0.3);
                ">
                    <!-- Credits -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #ffaa00; font-weight: bold;">💳 Credits</span>
                        <span style="color: #fff; font-size: 1.1rem;">${credits.toLocaleString()} cr</span>
                    </div>

                    <!-- Fuel -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="color: ${fuelColor}; font-weight: bold;">⛽ Fuel</span>
                            <span style="color: #fff;">${fuel} / ${maxFuel}</span>
                        </div>
                        <div style="
                            width: 100%;
                            height: 8px;
                            background: rgba(0,0,0,0.5);
                            border-radius: 4px;
                            overflow: hidden;
                        ">
                            <div style="
                                width: ${fuelPercent}%;
                                height: 100%;
                                background: ${fuelColor};
                                transition: width 0.3s;
                            "></div>
                        </div>
                    </div>

                    <!-- Scrap -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #aaaaaa; font-weight: bold;">🔩 Scrap</span>
                        <span style="color: #fff; font-size: 1.1rem;">${scrap}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render cargo section
     */
    renderCargoSection() {
        const state = this.game.state;
        const cargo = state.cargo || [];
        const maxCargo = state.ship?.cargoCapacity || 10;
        const usedSlots = cargo.reduce((sum, item) => sum + (item.quantity || 1), 0);

        if (cargo.length === 0) {
            return `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #00f0ff; margin-bottom: 15px; font-size: 1.2rem;">
                        📦 CARGO (0/${maxCargo} slots)
                    </h3>
                    <div style="
                        padding: 20px;
                        background: rgba(0,0,0,0.3);
                        border-radius: 8px;
                        border: 1px solid rgba(255,255,255,0.1);
                        text-align: center;
                        color: #888;
                        font-style: italic;
                    ">
                        No cargo loaded
                    </div>
                </div>
            `;
        }

        const cargoItems = cargo.map((item, index) => `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: rgba(0,240,255,0.05);
                border-left: 3px solid #00f0ff;
                margin-bottom: 8px;
            ">
                <div>
                    <div style="color: #fff; font-weight: bold;">${item.name}</div>
                    <div style="color: #aaa; font-size: 0.85rem;">Quantity: ${item.quantity || 1}</div>
                </div>
                <button onclick="game.ui.inventoryUI.discardCargo(${index})" style="
                    background: rgba(255,0,85,0.2);
                    border: 1px solid #ff0055;
                    color: #ff0055;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-family: var(--font-tech);
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,0,85,0.4)'" onmouseout="this.style.background='rgba(255,0,85,0.2)'">
                    🗑️ DISCARD
                </button>
            </div>
        `).join('');

        return `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #00f0ff; margin-bottom: 15px; font-size: 1.2rem;">
                    📦 CARGO (${usedSlots}/${maxCargo} slots)
                </h3>
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(0,240,255,0.3);
                ">
                    ${cargoItems}
                </div>
            </div>
        `;
    }

    /**
     * Render passengers section
     */
    renderPassengersSection() {
        const state = this.game.state;
        const passengers = state.passengers || 0;

        if (passengers === 0) {
            return ''; // Hide section if no passengers
        }

        const rewardPerPassenger = 30; // From EncounterTypes
        const totalReward = passengers * rewardPerPassenger;

        return `
            <div style="margin-bottom: 15px;">
                <h3 style="color: #00f0ff; margin-bottom: 15px; font-size: 1.2rem;">👥 PASSENGERS</h3>
                <div style="
                    background: rgba(0,255,85,0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(0,255,85,0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: #fff; font-weight: bold;">Refugees aboard</span>
                        <span style="color: #00ff55; font-size: 1.3rem;">${passengers}</span>
                    </div>
                    <div style="color: #aaa; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                        💰 Payment on arrival: <span style="color: #ffaa00; font-weight: bold;">${totalReward} credits</span>
                    </div>
                    <div style="color: #888; font-size: 0.85rem; margin-top: 8px; font-style: italic;">
                        ℹ️ Drop off at any station to receive payment
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Discard cargo item
     */
    discardCargo(index) {
        const item = this.game.state.cargo[index];

        if (confirm(`Discard ${item.name}? This cannot be undone.`)) {
            this.game.state.cargo.splice(index, 1);
            console.log(`[Inventory] Discarded ${item.name}`);

            // Refresh display
            this.show();
        }
    }

    /**
     * Close inventory
     */
    close() {
        const overlay = document.getElementById('inventory-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Remove ESC listener
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
    }
}
