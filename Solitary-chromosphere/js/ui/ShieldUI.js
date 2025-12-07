class ShieldUI {
    constructor(gameEngine, uiManager) {
        this.game = gameEngine;
        this.ui = uiManager;
    }

    renderShieldPanel() {
        if (!this.game.state.shieldManager) return '';

        const status = this.game.state.shieldManager.getShieldStatus();

        return `
            <div id="shield-panel" class="draggable-panel" style="position:absolute;bottom:380px;left:20px;width:280px;background:rgba(0,0,0,0.85);border:2px solid #00ff55;border-radius:6px;padding:12px;font-family:var(--font-tech);box-shadow:0 0 15px rgba(0,255,85,0.3);">
                <div class="drag-handle" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(0,255,85,0.3);cursor:move;user-select:none;">
                    <span style="font-size:0.9rem;font-weight:600;color:#00ff55;">🛡️ SHIELDS</span>
                    <span style="font-size:0.85rem;color:${status.currentLayers === status.maxLayers ? '#00ff55' : '#ffaa00'};font-weight:500;">${status.currentLayers}/${status.maxLayers} LAYERS</span>
                </div>
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:4px;">
                        <span style="color:#aaa;">Shield Strength</span>
                        <span style="color:#00ff55;">${Math.round((status.currentLayers / Math.max(status.maxLayers, 1)) * 100)}%</span>
                    </div>
                    <div style="width:100%;height:12px;background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.2);">
                        <div style="width:${(status.currentLayers / Math.max(status.maxLayers, 1)) * 100}%;height:100%;background:linear-gradient(90deg,#00ff55,#00ccaa);box-shadow:0 0 10px #00ff55;transition:width 0.3s ease;"></div>
                    </div>
                </div>
                ${status.isRecharging ? `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;font-size:0.65rem;margin-bottom:3px;color:#ffaa00;">
                            <span>⚡ Recharging...</span>
                            <span><span class="shield-recharge-percent">${Math.round(status.rechargeProgress * 100)}%</span></span>
                        </div>
                        <div style="width:100%;height:6px;background:rgba(255,170,0,0.2);border-radius:3px;overflow:hidden;">
                            <div class="shield-recharge-bar" style="width:${status.rechargeProgress * 100}%;height:100%;background:#ffaa00;box-shadow:0 0 5px #ffaa00;transition:width 0.05s linear;"></div>
                        </div>
                    </div>
                ` : ''}
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#aaa;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">
                    <span>⚡ Power: <span style="color:${status.systemPower > 0 ? '#00ff55' : '#ff0055'};">${status.systemPower}/${status.systemMaxPower}</span></span>
                    <span>🔄 Rate: ${status.rechargeRate}s/layer</span>
                </div>
            </div>
        `;
    }

    refreshShieldPanel() {
        const panel = document.getElementById('shield-panel');
        if (panel) {
            const newContent = this.renderShieldPanel();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newContent;
            const newPanel = tempDiv.firstElementChild;

            if (newPanel) {
                panel.replaceWith(newPanel);

                // Make draggable
                if (window.draggableUI) {
                    window.draggableUI.makeDraggable(newPanel, 'shield-panel', '.drag-handle');
                }
            }
        }
    }

    attachShieldEventListeners() {
        // No interactive elements yet
    }
}
