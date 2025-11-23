class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.rooms = [];
        this.furniture = [];

        for (let y = 0; y < height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                this.tiles[y][x] = 0;
            }
        }

        // Load furniture images
        this.furnitureImages = {
            terminal: new Image(),
            crate: new Image(),
            console: new Image()
        };
        this.furnitureImages.terminal.src = 'assets/furniture_terminal.png';
        this.furnitureImages.crate.src = 'assets/furniture_crate.png';
        this.furnitureImages.console.src = 'assets/furniture_console.png';

        this.generateDungeon();
        this.generateFurniture();
    }

    generateDungeon() {
        const numRooms = 10;
        let attempts = 0;
        const maxAttempts = 100;

        while (this.rooms.length < numRooms && attempts < maxAttempts) {
            attempts++;
            const width = 5 + Math.floor(Math.random() * 5);
            const height = 5 + Math.floor(Math.random() * 5);
            const x = 1 + Math.floor(Math.random() * (this.width - width - 2));
            const y = 1 + Math.floor(Math.random() * (this.height - height - 2));

            const newRoom = { x, y, width, height };
            let overlaps = false;

            for (let room of this.rooms) {
                if (this.roomsOverlap(newRoom, room)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this.createRoom(newRoom);

                if (this.rooms.length > 0) {
                    const prevRoom = this.rooms[this.rooms.length - 1];
                    this.createCorridor(prevRoom, newRoom);
                }

                this.rooms.push(newRoom);
            }
        }

        console.log(`Generated ${this.rooms.length} rooms`);
    }

    roomsOverlap(room1, room2) {
        return room1.x < room2.x + room2.width + 1 &&
            room1.x + room1.width + 1 > room2.x &&
            room1.y < room2.y + room2.height + 1 &&
            room1.y + room1.height + 1 > room2.y;
    }

    createRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.tiles[y][x] = 1;
                }
            }
        }
    }

    createCorridor(room1, room2) {
        const x1 = Math.floor(room1.x + room1.width / 2);
        const y1 = Math.floor(room1.y + room1.height / 2);
        const x2 = Math.floor(room2.x + room2.width / 2);
        const y2 = Math.floor(room2.y + room2.height / 2);

        if (Math.random() < 0.5) {
            this.createHCorridor(x1, x2, y1);
            this.createVCorridor(y1, y2, x2);
        } else {
            this.createVCorridor(y1, y2, x1);
            this.createHCorridor(x1, x2, y2);
        }
    }

    createHCorridor(x1, x2, y) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        for (let x = minX; x <= maxX; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.tiles[y][x] = 1;
            }
        }
    }

    createVCorridor(y1, y2, x) {
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        for (let y = minY; y <= maxY; y++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.tiles[y][x] = 1;
            }
        }
    }

    generateFurniture() {
        const furnitureTypes = ['terminal', 'crate', 'console'];

        this.rooms.forEach(room => {
            const furnitureCount = 3 + Math.floor(Math.random() * 5);

            for (let i = 0; i < furnitureCount; i++) {
                let placed = false;
                let attempts = 0;

                while (!placed && attempts < 50) {
                    attempts++;

                    const x = room.x + Math.floor(Math.random() * room.width);
                    const y = room.y + Math.floor(Math.random() * room.height);

                    if (this.tiles[y][x] !== 1) continue;

                    const hasWallAdjacent =
                        (y > 0 && this.tiles[y - 1][x] === 0) ||
                        (y < this.height - 1 && this.tiles[y + 1][x] === 0) ||
                        (x > 0 && this.tiles[y][x - 1] === 0) ||
                        (x < this.width - 1 && this.tiles[y][x + 1] === 0);

                    if (!hasWallAdjacent) continue;

                    const hasFurniture = this.furniture.some(f => f.x === x && f.y === y);
                    if (hasFurniture) continue;

                    const type = furnitureTypes[Math.floor(Math.random() * furnitureTypes.length)];
                    const flip = Math.random() < 0.5;
                    this.furniture.push({ x, y, type, flip });
                    placed = true;
                }
            }
        });

        console.log(`Placed ${this.furniture.length} furniture items`);
    }

    isWalkable(x, y) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return false;
        }

        if (this.tiles[tileY][tileX] !== 1) {
            return false;
        }

        const hasFurniture = this.furniture.some(f => f.x === tileX && f.y === tileY);
        if (hasFurniture) {
            return false;
        }

        return true;
    }

    isWalkableWithHitbox(x, y) {
        return this.isWalkable(x, y);
    }

    spawnEnemies(count) {
        const spawns = [];
        if (this.rooms.length === 0) return spawns;

        for (let i = 0; i < count; i++) {
            const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
            const x = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
            const y = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
            spawns.push({ x, y });
        }
        return spawns;
    }

    spawnStairs() {
        if (this.rooms.length === 0) return { x: 25, y: 25 };

        const room = this.rooms[this.rooms.length - 1];
        const x = room.x + Math.floor(room.width / 2);
        const y = room.y + Math.floor(room.height / 2);
        return { x, y };
    }

    draw(renderer, cameraX, cameraY, stairs) {
        const minX = Math.floor(cameraX - 15);
        const maxX = Math.ceil(cameraX + 15);
        const minY = Math.floor(cameraY - 15);
        const maxY = Math.ceil(cameraY + 15);
        const ctx = renderer.ctx;
        const tw = renderer.tileWidth;
        const th = renderer.tileHeight;

        for (let y = Math.max(0, minY); y < Math.min(this.height, maxY); y++) {
            for (let x = Math.max(0, minX); x < Math.min(this.width, maxX); x++) {
                if (this.tiles[y][x] === 1) {
                    this.drawFloor(renderer, x, y, cameraX, cameraY);
                } else {
                    this.drawWall(renderer, x, y, cameraX, cameraY);
                }
            }
        }

        // Draw furniture with flip
        this.furniture.forEach(item => {
            const pos = renderer.isoToScreen(item.x, item.y, cameraX, cameraY);
            const img = this.furnitureImages[item.type];

            if (img.complete) {
                ctx.save();
                ctx.translate(pos.x, pos.y);
                if (item.flip) {
                    ctx.scale(-1, 1);
                }
                ctx.drawImage(img, -64, -64, 128, 128);
                ctx.restore();
            } else {
                ctx.fillStyle = '#555';
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(pos.x + tw / 2, pos.y + th / 2);
                ctx.lineTo(pos.x, pos.y + th);
                ctx.lineTo(pos.x - tw / 2, pos.y + th / 2);
                ctx.closePath();
                ctx.fill();
            }
        });

        if (stairs) {
            this.drawTeleporter(renderer, stairs.x, stairs.y, cameraX, cameraY);
        }
    }

    drawFloor(renderer, x, y, cameraX, cameraY) {
        const pos = renderer.isoToScreen(x, y, cameraX, cameraY);
        const ctx = renderer.ctx;
        const tw = renderer.tileWidth;
        const th = renderer.tileHeight;

        const gradient = ctx.createLinearGradient(pos.x - tw, pos.y, pos.x + tw, pos.y + th * 2);
        gradient.addColorStop(0, '#1a2a3a');
        gradient.addColorStop(0.5, '#2a3a4a');
        gradient.addColorStop(1, '#1a2a3a');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.lineTo(pos.x - tw, pos.y + th);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0a1520';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#15252f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x - tw, pos.y + th);
        ctx.lineTo(pos.x + tw, pos.y + th);
        ctx.stroke();
    }

    drawWall(renderer, x, y, cameraX, cameraY) {
        const pos = renderer.isoToScreen(x, y, cameraX, cameraY);
        const ctx = renderer.ctx;
        const tw = renderer.tileWidth;
        const th = renderer.tileHeight;

        const gradient = ctx.createLinearGradient(pos.x - tw, pos.y, pos.x + tw, pos.y + th * 2);
        gradient.addColorStop(0, '#0a0f1a');
        gradient.addColorStop(0.5, '#1a1f2a');
        gradient.addColorStop(1, '#0a0f1a');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.lineTo(pos.x - tw, pos.y + th);
        ctx.closePath();
        ctx.fill();
    }

    drawTeleporter(renderer, x, y, cameraX, cameraY) {
        const pos = renderer.isoToScreen(x, y, cameraX, cameraY);
        const ctx = renderer.ctx;
        const tw = renderer.tileWidth;
        const th = renderer.tileHeight;
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;

        ctx.save();
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.3})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0ff';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + th, tw * 0.6, th * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#1a4a5a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + tw / 2, pos.y + th / 2);
        ctx.lineTo(pos.x, pos.y + th);
        ctx.lineTo(pos.x - tw / 2, pos.y + th / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + th, tw * 0.4, th * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(0, 200, 255, ${pulse * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + th, tw * 0.5, th * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}
