// Auto-refresh weapon panel to show charging progress
setInterval(() => {
    const panel = document.getElementById('weapons-panel');
    if (panel) {
        // Get the game instance from window
        const game = window.game;
        if (game && game.ui && game.ui.weaponUI && game.state && game.state.ship && game.state.ship.weapons) {
            // Only refresh when weapons are charging or cooling down (NOT when ready or idle)
            // This prevents refresh from interfering with FIRE button clicks
            const needsRefresh = game.state.ship.weapons.some(w => w.state === 'charging' || w.state === 'cooldown');
            if (needsRefresh) {
                game.ui.weaponUI.refreshWeaponsPanel();
            }
        }
    }
}, 100);
