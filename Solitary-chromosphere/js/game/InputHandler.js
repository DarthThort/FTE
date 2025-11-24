class InputHandler {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.clickHandlers = [];

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('click', (e) => {
            for (const handler of this.clickHandlers) {
                handler(e.clientX, e.clientY);
            }
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    onCanvasClick(handler) {
        this.clickHandlers.push(handler);
    }
}
