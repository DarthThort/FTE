setInterval(() => {
    const panel = document.getElementById('shield-panel');
    if (panel && window.game && window.game.state && window.game.state.shieldManager) {
        const status = window.game.state.shieldManager.getShieldStatus();

        if (status.isRecharging) {
            // Update progress bar
            const rechargeBar = panel.querySelector('.shield-recharge-bar');
            if (rechargeBar) {
                const percent = status.rechargeProgress * 100;
                rechargeBar.style.width = `${percent}%`;
            }

            // Update percentage text
            const percentText = panel.querySelector('.shield-recharge-percent');
            if (percentText) {
                percentText.textContent = `${Math.round(status.rechargeProgress * 100)}%`;
            }
        }
    }
}, 50);
