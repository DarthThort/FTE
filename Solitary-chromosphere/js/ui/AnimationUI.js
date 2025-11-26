class AnimationUI {
    constructor(game, root) {
        this.game = game;
        this.root = root;
    }

    showTravelAnimation(type, callback) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center;
            flex-direction: column; overflow: hidden;
        `;

        if (type === 'WARP') {
            this._createWarpAnimation(overlay, callback);
        } else if (type === 'SUBLIGHT') {
            this._createSublightAnimation(overlay, callback);
        } else {
            // Fallback
            overlay.innerHTML = `<div style="color: #fff; font-family: var(--font-tech); font-size: 2rem;">TRAVELLING...</div>`;
            document.body.appendChild(overlay);
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 3000);
        }
    }

    _createWarpAnimation(overlay, callback) {
        // Warp effect with streaking stars
        overlay.innerHTML = `
            <canvas id="warp-canvas" width="1920" height="1080" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
            <div style="position: relative; z-index: 10; color: var(--primary); font-family: var(--font-tech); font-size: 2rem; letter-spacing: 5px; text-shadow: 0 0 20px var(--primary);">
                INITIATING WARP JUMP...
            </div>
        `;

        document.body.appendChild(overlay);

        // Create warp effect on canvas
        const canvas = document.getElementById('warp-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create stars
        const stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                speed: Math.random() * 20 + 10
            });
        }

        // Animation loop
        let animationId;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.z -= star.speed;
                if (star.z <= 0) {
                    star.z = canvas.width;
                    star.x = Math.random() * canvas.width;
                    star.y = Math.random() * canvas.height;
                }

                const k = 128 / star.z;
                const px = (star.x - canvas.width / 2) * k + canvas.width / 2;
                const py = (star.y - canvas.height / 2) * k + canvas.height / 2;

                const size = (1 - star.z / canvas.width) * 3;
                const opacity = 1 - star.z / canvas.width;

                ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`;
                ctx.fillRect(px, py, size, size);
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            overlay.remove();
            if (callback) callback();
        }, 3000);
    }

    _createSublightAnimation(overlay, callback) {
        // Sublight effect with ship visible and planets/moons passing by
        overlay.innerHTML = `
            <canvas id="sublight-canvas" width="1920" height="1080" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
            <div style="position: absolute; top: 30px; left: 50%; transform: translateX(-50%); z-index: 10; color: var(--warning); font-family: var(--font-tech); font-size: 1.2rem; letter-spacing: 3px; text-shadow: 0 0 10px var(--warning); opacity: 0.7;">
                TRAVELLING...
            </div>
        `;

        document.body.appendChild(overlay);

        // Create planetary travel scene
        const canvas = document.getElementById('sublight-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create planets and moons
        const celestialBodies = [];
        const colors = ['#ff8844', '#4488ff', '#88ff44', '#ff4488', '#ffaa44', '#aaaaaa', '#8844ff'];
        for (let i = 0; i < 8; i++) {
            celestialBodies.push({
                x: Math.random() * canvas.width * 2 - canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 60 + 20,
                speedX: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                isMoon: Math.random() > 0.6
            });
        }

        // Add background stars
        const stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 1 + 0.5
            });
        }

        // Animation loop
        let animationId;
        const animate = () => {
            // Clear with space background
            ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw moving stars
            stars.forEach(star => {
                star.x += star.speedX;
                if (star.x > canvas.width) {
                    star.x = -10;
                    star.y = Math.random() * canvas.height;
                }
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });

            // Draw planets/moons
            celestialBodies.forEach(body => {
                body.x += body.speedX;
                if (body.x > canvas.width + 100) {
                    body.x = -100;
                    body.y = Math.random() * canvas.height;
                }

                // Planet with glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = body.color;
                ctx.fillStyle = body.color;
                ctx.beginPath();
                ctx.arc(body.x, body.y, body.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Craters for moons
                if (body.isMoon) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    for (let i = 0; i < 3; i++) {
                        const craterX = body.x + (Math.random() - 0.5) * body.size;
                        const craterY = body.y + (Math.random() - 0.5) * body.size;
                        const craterSize = Math.random() * body.size * 0.2 + 2;
                        ctx.beginPath();
                        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // Draw player ship in center
            const shipX = canvas.width / 2;
            const shipY = canvas.height / 2;
            const shipSize = 40;

            ctx.save();
            ctx.translate(shipX, shipY);

            // Ship body (triangle)
            ctx.fillStyle = '#00f0ff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(shipSize, 0);
            ctx.lineTo(-shipSize / 2, -shipSize / 2);
            ctx.lineTo(-shipSize / 2, shipSize / 2);
            ctx.closePath();
            ctx.fill();

            // Engine glow
            ctx.fillStyle = '#ff8800';
            ctx.shadowColor = '#ff8800';
            ctx.beginPath();
            ctx.arc(-shipSize / 2, 0, shipSize / 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();

            animationId = requestAnimationFrame(animate);
        };
        animate();

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            overlay.remove();
            if (callback) callback();
        }, 5000);
    }
}
