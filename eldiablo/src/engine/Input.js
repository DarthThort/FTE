class Input {
    constructor() {
        this.keys = {};
        this.downKeys = {}; // Keys pressed this frame

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.downKeys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isPressed(code) {
        return !!this.downKeys[code];
    }

    update() {
        this.downKeys = {}; // Reset per frame
    }
}
