class Effect {
    constructor(x, y, type = 'pulse', initialSize = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = type === 'damage' ? 0.5 : 0.3;
        this.maxLife = this.life;
        this.size = initialSize;

        if (type === 'damage') {
            this.particles = [];
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                this.particles.push({
                    dx: Math.cos(angle) * (2 + Math.random()),
                    dy: Math.sin(angle) * (2 + Math.random()),
                    size: 2 + Math.random() * 3
                });
            }
        }
    }

    update(dt) {
        this.life -= dt;
        if (this.type === 'pulse') {
            this.size += dt * 5;
        } else if (this.type === 'damage') {
            this.size += dt * 3;
        }
    }

    draw(renderer, cameraX, cameraY) {
        const alpha = this.life / this.maxLife;
        const pos = renderer.isoToScreen(this.x, this.y, cameraX, cameraY);
        const ctx = renderer.ctx;

        if (this.type === 'pulse') {
            const color = `rgba(0, 255, 255, ${alpha})`;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y, this.size * 32, this.size * 16, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (this.type === 'damage') {
            ctx.save();
            for (let particle of this.particles) {
                const px = pos.x + particle.dx * this.size * 10;
                const py = pos.y + particle.dy * this.size * 10;

                ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, particle.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(200, 0, 0, ${alpha * 0.5})`;
                ctx.lineWidth = particle.size / 2;
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(px, py);
                ctx.stroke();
            }

            const flashSize = (1 - alpha) * 40;
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, flashSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
