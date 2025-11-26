// Smart refresh: only update progress bars, not the entire panel
// This allows smooth animation without interfering with button clicks
setInterval(() => {
    const panel = document.getElementById('weapons-panel');
    if (panel && window.game && window.game.state && window.game.state.weaponManager) {
        const weapons = window.game.state.weaponManager.getAllWeaponsStatus();

        weapons.forEach(weapon => {
            // Only update if weapon is charging or in cooldown
            if (weapon.state === 'charging' || weapon.state === 'cooldown') {
                // Find the progress bar for this weapon
                const weaponDiv = panel.querySelector(`[data-weapon-id="${weapon.id}"]`)?.closest('.weapon-slot');
                if (weaponDiv) {
                    const progressBar = weaponDiv.querySelector('.weapon-progress-bar');
                    const progressText = weaponDiv.querySelector('.weapon-progress-text');
                    const stateText = weaponDiv.querySelector('.weapon-state-text');

                    if (progressBar && progressText && stateText) {
                        const percent = weapon.state === 'charging'
                            ? weapon.chargeProgress * 100
                            : weapon.cooldownProgress * 100;

                        progressBar.style.width = `${percent}%`;
                        progressText.textContent = `${Math.round(percent)}%`;

                        const stateColor = weapon.state === 'charging' ? '#ffaa00' : '#ff0055';
                        progressBar.style.background = stateColor;
                        progressBar.style.boxShadow = `0 0 8px ${stateColor}`;
                        stateText.style.color = stateColor;
                    }
                }
            }
        });
    }
}, 50); // 50ms = 20fps, smooth enough without being too frequent
