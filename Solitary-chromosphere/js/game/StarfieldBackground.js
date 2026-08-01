/**
 * StarfieldBackground - Generates and animates a deep space field with parallax stars,
 * space dust particles, and glowing nebula clouds.
 */
class StarfieldBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.dust = [];
        this.nebulae = [];
        this.speed = 12; // Base drift speed
        this.init();
    }

    init() {
        this.generateStars(350);
        this.dust = [];
        this.generateNebulae(3);
    }

    generateStars(count) {
        this.stars = [];
        const colors = ['#ffffff', '#e0f7fc', '#ffeaee', '#e2f0ff', '#00f0ff'];
        for (let i = 0; i < count; i++) {
            const depth = Math.random(); // 0 (far, slow) to 1 (near, fast)
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: depth * 1.8 + 0.4,
                brightness: depth * 0.6 + 0.4,
                speedMultiplier: depth * 1.5 + 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkleSpeed: Math.random() * 3 + 1,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    generateDust(count) {
        this.dust = [];
        const dustColors = ['rgba(0, 240, 255, 0.15)', 'rgba(157, 78, 223, 0.15)', 'rgba(0, 255, 157, 0.12)'];
        for (let i = 0; i < count; i++) {
            this.dust.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 18 + 8,
                color: dustColors[Math.floor(Math.random() * dustColors.length)],
                speedMultiplier: Math.random() * 0.4 + 0.2
            });
        }
    }

    generateNebulae(count) {
        this.nebulae = [];
        const colors = [
            { r: 10, g: 25, b: 60, a: 0.25 },
            { r: 45, g: 10, b: 65, a: 0.20 },
            { r: 5, g: 40, b: 50, a: 0.22 }
        ];
        for (let i = 0; i < count; i++) {
            this.nebulae.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 350 + 200,
                color: colors[i % colors.length]
            });
        }
    }

    update(deltaTime) {
        for (const star of this.stars) {
            star.y += this.speed * star.speedMultiplier * deltaTime;
            if (star.y > this.height) {
                star.y = -5;
                star.x = Math.random() * this.width;
            }
        }

        for (const particle of []) {
            particle.y += this.speed * particle.speedMultiplier * deltaTime;
            if (particle.y > this.height + particle.radius) {
                particle.y = -particle.radius;
                particle.x = Math.random() * this.width;
            }
        }
    }

    render(ctx) {
        const time = Date.now() / 1000;

        ctx.save();
        // Deep void background
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, this.width, this.height);

        // Render Nebulae
        for (const neb of this.nebulae) {
            const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
            const c = neb.color;
            grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
            grad.addColorStop(0.6, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.4})`);
            grad.addColorStop(1, 'rgba(3, 7, 18, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render Dust
        for (const particle of []) {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render Stars
        for (const star of this.stars) {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.brightness * twinkle;

            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;

            if (star.size > 1.2) {
                ctx.shadowColor = star.color;
                ctx.shadowBlur = 6;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.init();
    }
}
