class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.tileWidth = 128;
        this.tileHeight = 64;

        this.sprites = {};
        this.spritesLoaded = false;
        this.loadSprites();

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    loadSprites() {
        const spritesList = {
            player: 'assets/player.png',
            enemy: 'assets/enemy.png',
            boss: 'assets/boss.png',
            weapon: 'assets/weapon.png',
            armor: 'assets/armor.png',
            helmet: 'assets/helmet.png',
            floor: 'assets/floor.png',
            stairs: 'assets/stairs.png'
        };

        let loadedCount = 0;
        const totalSprites = Object.keys(spritesList).length;

        for (let key in spritesList) {
            const img = new Image();
            img.src = spritesList[key];
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${spritesList[key]}`);
                loadedCount++;
                if (loadedCount === totalSprites) {
                    this.spritesLoaded = true;
                }
            };
            this.sprites[key] = img;
        }
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    isoToScreen(x, y, cameraX, cameraY) {
        const offsetX = (x - cameraX) - (y - cameraY);
        const offsetY = (x - cameraX + y - cameraY) * 0.5;

        const screenX = this.canvas.width / 2 + offsetX * this.tileWidth / 2;
        const screenY = this.canvas.height / 2 + offsetY * this.tileHeight;

        return { x: screenX, y: screenY };
    }

    screenToIso(screenX, screenY, cameraX, cameraY) {
        const relX = screenX - this.canvas.width / 2;
        const relY = screenY - this.canvas.height / 2;

        const isoX = (relX / (this.tileWidth / 2) + relY / this.tileHeight) / 2 + cameraX;
        const isoY = (relY / this.tileHeight - relX / (this.tileWidth / 2)) / 2 + cameraY;

        return { x: isoX, y: isoY };
    }

    drawTile(x, y, color, cameraX, cameraY) {
        const pos = this.isoToScreen(x, y, cameraX, cameraY);

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x + this.tileWidth, pos.y + this.tileHeight);
        this.ctx.lineTo(pos.x, pos.y + this.tileHeight * 2);
        this.ctx.lineTo(pos.x - this.tileWidth, pos.y + this.tileHeight);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#111';
        this.ctx.stroke();
    }

    drawSprite(spriteName, x, y, width, height, cameraX, cameraY, flip = false) {
        const img = this.sprites[spriteName];

        if (!img || !img.complete || img.naturalWidth === 0) {
            return false;
        }

        const pos = this.isoToScreen(x, y, cameraX, cameraY);

        try {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            const footOffset = -height * 0.1;

            this.ctx.save();
            this.ctx.translate(pos.x, pos.y + this.tileHeight - height / 2 + footOffset);

            if (flip) {
                this.ctx.scale(-1, 1);
            }

            this.ctx.drawImage(
                img,
                -width / 2,
                -height / 2,
                width,
                height
            );

            this.ctx.restore();
            return true;
        } catch (e) {
            return false;
        }
    }

    drawRectIso(x, y, width, height, color, z, cameraX, cameraY) {
        const pos = this.isoToScreen(x, y, cameraX, cameraY);

        this.ctx.fillStyle = color;
        const w = this.tileWidth;
        const h = this.tileWidth * 1.5;

        this.ctx.fillRect(pos.x - w / 2, pos.y - h, w, h);
    }
}
