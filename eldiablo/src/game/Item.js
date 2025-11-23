class Item {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type;
        this.stats = stats;
        this.x = 0;
        this.y = 0;
        this.color = '#ff0';
    }

    static generate(level) {
        const types = ['weapon', 'armor', 'helmet'];
        const type = types[Math.floor(Math.random() * types.length)];

        let name = '';
        let stats = {};

        if (type === 'weapon') {
            name = 'Laser Sword';
            stats.strength = Math.floor(Math.random() * 3) + level;
            stats.dexterity = Math.floor(Math.random() * 2) + Math.floor(level / 2);
        } else if (type === 'armor') {
            name = 'Nano Armor';
            stats.vitality = Math.floor(Math.random() * 3) + level;
            stats.strength = Math.floor(Math.random() * 2) + Math.floor(level / 2);
        } else {
            name = 'Cyber Helmet';
            stats.intelligence = Math.floor(Math.random() * 3) + level;
            stats.vitality = Math.floor(Math.random() * 2) + Math.floor(level / 2);
        }

        return new Item(name, type, stats);
    }

    draw(renderer, cameraX, cameraY) {
        const spriteMap = {
            'weapon': 'weapon',
            'armor': 'armor',
            'helmet': 'helmet'
        };

        const spriteName = spriteMap[this.type];
        if (spriteName) {
            const drawn = renderer.drawSprite(spriteName, this.x, this.y, 40, 40, cameraX, cameraY);
            if (drawn) return;
        }

        renderer.drawRectIso(this.x, this.y, 0.4, 0.4, this.color, 0, cameraX, cameraY);
    }
}
