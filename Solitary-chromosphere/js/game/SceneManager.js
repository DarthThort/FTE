class SceneManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentScene = 'PORT'; // PORT, SHIP, COMBAT
        this.shipRenderer = new ShipRenderer(gameEngine);
        this.player = new Player(gameEngine);
    }

    changeScene(sceneName) {
        console.log(`SceneManager: Switching to scene: ${sceneName}`);
        this.currentScene = sceneName;

        // Notify UI Manager (accessed via GameEngine)
        if (this.game.ui) {
            this.game.ui.setMode(sceneName);
        }
    }

    update(dt) {
        if (this.currentScene === 'SHIP') {
            this.player.update(dt);
            this.shipRenderer.computeVisibility(this.player);
        }
    }

    render(ctx) {
        if (this.currentScene === 'SHIP') {
            this.shipRenderer.render(ctx);
            this.player.render(ctx);
        } else if (this.currentScene === 'PORT') {
            // Draw port background or nothing (handled by DOM UI)
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}
