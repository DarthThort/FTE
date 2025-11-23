window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element:', canvas);

    try {
        const game = new Game(canvas);
        console.log('Game object created successfully');
        console.log('Calling game.start()...');
        game.start();
        console.log('game.start() called - Laser System Active');
    } catch (e) {
        console.error('Error creating or starting game:', e);
        console.error('Stack:', e.stack);
    }
});
