class Projectile {
    constructor(x, y, targetX, targetY, speed, damage) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.damage = damage;
        this.life = 2.0; // 2 seconds life
        this.active = true;

        // Calculate direction vector
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
        } else {
            this.vx = speed;
            this.vy = 0;
        }
    }

    update(dt, map) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;

        if (this.life <= 0) {
            this.active = false;
        }

        // Wall collision
        if (!map.isWalkable(this.x, this.y)) {
            this.active = false;
            return 'wall';
        }
        return null;
    }

    draw(renderer, cameraX, cameraY) {
        const pos = renderer.isoToScreen(this.x, this.y, cameraX, cameraY);
        const ctx = renderer.ctx;

        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';

        // Draw laser bolt
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Trail effect
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const tailX = this.x - this.vx * 0.05;
        const tailY = this.y - this.vy * 0.05;
        const tailPos = renderer.isoToScreen(tailX, tailY, cameraX, cameraY);
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(tailPos.x, tailPos.y);
        ctx.stroke();

        ctx.restore();
    }
}
