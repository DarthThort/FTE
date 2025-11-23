class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.color = '#0f0';
        this.speed = 5;
        this.sprite = 'player';

        this.baseStats = {
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            vitality: 10
        };

        this.stats = { ...this.baseStats };
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 100;
        this.statPoints = 0;
        this.ammo = 10; // Starting ammo
        this.maxAmmo = 20;

        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null
        };

        this.recalcStats();
    }

    recalcStats() {
        this.stats = { ...this.baseStats };

        if (this.equipment.weapon) {
            for (let key in this.equipment.weapon.stats) {
                if (this.stats[key] !== undefined) this.stats[key] += this.equipment.weapon.stats[key];
            }
        }
        if (this.equipment.armor) {
            for (let key in this.equipment.armor.stats) {
                if (this.stats[key] !== undefined) this.stats[key] += this.equipment.armor.stats[key];
            }
        }
        if (this.equipment.helmet) {
            for (let key in this.equipment.helmet.stats) {
                if (this.stats[key] !== undefined) this.stats[key] += this.equipment.helmet.stats[key];
            }
        }

        this.maxHp = this.stats.vitality * 10;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.nextLevelXp;
        this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);

        this.statPoints += 5;

        this.hp = this.maxHp;
        console.log(`Level Up! Now level ${this.level}. You have ${this.statPoints} stat points!`);
    }

    addStatPoint(stat) {
        if (this.statPoints > 0 && this.baseStats[stat] !== undefined) {
            this.baseStats[stat]++;
            this.statPoints--;
            this.recalcStats();
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        console.log(`Player took ${amount} damage! HP: ${this.hp}/${this.maxHp}`);
    }

    equip(item) {
        if (item.type === 'weapon') {
            if (this.equipment.weapon) this.inventory.push(this.equipment.weapon);
            this.equipment.weapon = item;
        } else if (item.type === 'armor') {
            if (this.equipment.armor) this.inventory.push(this.equipment.armor);
            this.equipment.armor = item;
        } else if (item.type === 'helmet') {
            if (this.equipment.helmet) this.inventory.push(this.equipment.helmet);
            this.equipment.helmet = item;
        }
        this.recalcStats();
        console.log('Stats after equipping:', this.stats);
        console.log('Base stats:', this.baseStats);
    }

    update(dt, input) {
        const moveSpeed = this.speed * dt;
        let dx = 0;
        let dy = 0;

        if (input.isDown('KeyW')) { dx -= moveSpeed; dy -= moveSpeed; }
        if (input.isDown('KeyS')) { dx += moveSpeed; dy += moveSpeed; }
        if (input.isDown('KeyA')) { dx -= moveSpeed; dy += moveSpeed; }
        if (input.isDown('KeyD')) { dx += moveSpeed; dy -= moveSpeed; }

        // Update facing direction based on A/D keys
        if (input.isDown('KeyD')) {
            this.facingRight = true;
        } else if (input.isDown('KeyA')) {
            this.facingRight = false;
        }

        if (dx !== 0 || dy !== 0) {
            let inputX = 0;
            let inputY = 0;

            if (input.isDown('KeyW')) { inputX -= 1; inputY -= 1; }
            if (input.isDown('KeyS')) { inputX += 1; inputY += 1; }
            if (input.isDown('KeyA')) { inputX -= 1; inputY += 1; }
            if (input.isDown('KeyD')) { inputX += 1; inputY -= 1; }

            if (inputX !== 0 || inputY !== 0) {
                const len = Math.sqrt(inputX * inputX + inputY * inputY);
                inputX /= len;
                inputY /= len;

                dx = inputX * moveSpeed;
                dy = inputY * moveSpeed;
            } else {
                dx = 0;
                dy = 0;
            }
        }

        this.x += dx;
        this.y += dy;
    }

    draw(renderer, cameraX, cameraY) {
        // Call parent draw method
        super.draw(renderer, cameraX, cameraY);

        // Draw arrow indicator if player has stat points available
        if (this.statPoints > 0) {
            const pos = renderer.isoToScreen(this.x, this.y, cameraX, cameraY);
            const ctx = renderer.ctx;

            // Animated bounce effect
            const time = Date.now() / 500;
            const bounce = Math.sin(time) * 5;

            // Arrow position (above player)
            const arrowY = pos.y - 80 + bounce;

            // Draw arrow
            ctx.save();
            ctx.fillStyle = '#FFD700'; // Gold/yellow color
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            ctx.beginPath();
            // Arrow pointing down
            ctx.moveTo(pos.x, arrowY + 15); // Bottom point
            ctx.lineTo(pos.x - 8, arrowY); // Left point
            ctx.lineTo(pos.x - 3, arrowY); // Left inner
            ctx.lineTo(pos.x - 3, arrowY - 10); // Left shaft
            ctx.lineTo(pos.x + 3, arrowY - 10); // Right shaft
            ctx.lineTo(pos.x + 3, arrowY); // Right inner
            ctx.lineTo(pos.x + 8, arrowY); // Right point
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
}
