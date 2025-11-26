// Auto-refresh weapon panel to show charging progress
setInterval(() => {
    const panel = document.getElementById('weapons-panel');
    if (panel) {
        // Get the game instance from window
        const game = window.game;
        if (game && game.ui && game.ui.weaponUI && game.state && game.state.ship && game.state.ship.weapons) {
            // Only refresh if there are weapons that are NOT idle (charging/ready/cooldown)
            const hasActiveWeapons = game.state.ship.weapons.some(w => w.state !== 'idle');
            if (hasActiveWeapons) {
                game.ui.weaponUI.refreshWeaponsPanel();
            }
        }
    }
}, 100);
