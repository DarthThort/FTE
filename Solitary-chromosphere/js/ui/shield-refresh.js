setInterval(() => {
    const panel = document.getElementById('shield-panel');
    if (panel && window.game && window.game.state && window.game.state.shieldManager) {
        const status = window.game.state.shieldManager.getShieldStatus();

        // Make draggable if not already
        if (window.draggableUI && !panel._draggableInitialized) {
            const handle = panel.querySelector('.drag-handle');
            if (handle) {
                window.draggableUI.makeDraggable(panel, 'shield-panel', '.drag-handle');
                panel._draggableInitialized = true;
            }
        }

        // Update recharge bar if recharging
        if (status.isRecharging) {
            const rechargeBar = panel.querySelector('.shield-recharge-bar');
            const rechargePercent = panel.querySelector('.shield-recharge-percent');

            if (rechargeBar && rechargePercent) {
                const percent = Math.round(status.rechargeProgress * 100);
                rechargeBar.style.width = `${percent}%`;
                rechargePercent.textContent = `${percent}%`;
            }
        }
    }
}, 50);
