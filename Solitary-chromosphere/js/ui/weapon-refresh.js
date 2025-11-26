// Auto-refresh weapon panel to show charging progress
setInterval(() => {
    const panel = document.getElementById('weapons-panel');
    if (panel) {
        // Get the game instance from window
        const game = window.game;
        if (game && game.ui && game.ui.weaponUI) {
            console.log('[weapon-refresh] Refreshing weapon panel');
            game.ui.weaponUI.refreshWeaponsPanel();
        } else {
            console.log('[weapon-refresh] Could not find game.ui.weaponUI');
        }
    }
}, 100);
