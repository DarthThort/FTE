// Main Entry Point
console.log('System Initializing...');

const canvas = document.getElementById('game-canvas');
const uiLayer = document.getElementById('ui-layer');

if (!canvas || !uiLayer) {
    console.error('Critical Error: DOM elements not found.');
} else {
    // Classes are now global
    const game = new GameEngine(canvas);
    window.game = game; // Expose for UI onclick handlers
    const ui = new UIManager(uiLayer, game);

    // Initialize DialogueUI
    if (!game.ui) game.ui = {};
    game.ui.dialogueUI = new DialogueUI(game);
    game.ui.inventoryUI = new InventoryUI(game);

    // Reset Save Button removed (moved to Port UI)

    // Simulate loading
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        }
        game.start();
        // Start in ship mode if current planet has no station, otherwise start at port
        const initialScene = (game.state.currentPlanet && game.state.currentPlanet.hasStation) ? 'PORT' : 'SHIP';
        game.sceneManager.changeScene(initialScene);
        console.log('System Online.');
    }, 1000);
}
