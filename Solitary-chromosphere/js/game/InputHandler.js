class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastClickPos = null;

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
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.lastClickPos = { x: clickX, y: clickY };
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    getClickPosition() {
        const pos = this.lastClickPos;
        this.lastClickPos = null; // Always consume click on check
        return pos;
    }

    wasClicked() {
        const clicked = !!this.lastClickPos;
        this.lastClickPos = null;
        return clicked;
    }
}
