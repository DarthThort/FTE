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

    // Reset Save Button removed (moved to Port UI)

    // Simulate loading
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        }
        game.start();
        // Force UI update for initial scene
        game.sceneManager.changeScene('PORT');
        console.log('System Online.');
    }, 1000);
}
