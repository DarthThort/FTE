// Auto-refresh weapon panel to show charging progress
setInterval(() => {
    const panel = document.getElementById('weapons-panel');
    if (panel) {
        // Get the game instance from window
        const game = window.gameEngine || window.game;
        if (game && game.ui && game.ui.weaponUI) {
            game.ui.weaponUI.refreshWeaponsPanel();
        }
    }
}, 100);
