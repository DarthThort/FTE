class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseClicked = false;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.mouseClicked = true;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    wasClicked() {
        const clicked = this.mouseClicked;
        this.mouseClicked = false;
        return clicked;
    }
}
