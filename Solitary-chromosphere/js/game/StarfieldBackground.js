/**
 * StarfieldBackground - Generates and animates a field of stars
 * Creates a parallax effect with stars moving slowly downward
 */
class StarfieldBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.speed = 15; // pixels per second
        this.generateStars(250); // Generate 250 stars
    }

    /**
     * Generate random stars across the viewport
     * Stars have varying brightness and sizes for depth effect
     */
    generateStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5, // 0.5 to 2.0px
                brightness: Math.random() * 0.5 + 0.5, // 0.5 to 1.0 alpha
                twinkleSpeed: Math.random() * 2 + 1, // Varies per star
                twinkleOffset: Math.random() * Math.PI * 2 // Random phase
            });
        }
    }

    /**
     * Update star positions based on elapsed time
     * @param {number} deltaTime - Time elapsed since last frame (in seconds)
     */
    update(deltaTime) {
        for (const star of this.stars) {
            // Move star downward
            star.y += this.speed * deltaTime;

            // If star goes off the bottom, wrap it to the top
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width; // Randomize X position on wrap
            }
        }
    }

    /**
     * Render all stars to the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        const time = Date.now() / 1000;

        ctx.save();

        for (const star of this.stars) {
            // Calculate twinkling effect
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.brightness * twinkle;

            // Draw star
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.shadowBlur = star.size * 2;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    /**
     * Resize the starfield (e.g., when canvas size changes)
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        // Regenerate stars for new dimensions
        this.generateStars(this.stars.length);
    }
}
