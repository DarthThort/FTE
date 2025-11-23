class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 1;
        this.color = '#fff';
        this.sprite = null;
        this.facingRight = false; // Track which direction entity is facing
    }

    draw(renderer, cameraX, cameraY) {
        if (this.sprite) {
            const drawn = renderer.drawSprite(this.sprite, this.x, this.y, 128, 128, cameraX, cameraY, this.facingRight);
            if (drawn) return;
        }
        renderer.drawRectIso(this.x, this.y, this.size, this.size, this.color, 0, cameraX, cameraY);
    }
}
