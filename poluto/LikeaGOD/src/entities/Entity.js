export class Entity {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isDead = false;
        this.age = 0;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    update(deltaTime) {
        this.age += deltaTime;
    }

    render(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, 5, 5);
    }
}
