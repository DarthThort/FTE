class Enemy extends Entity {
    constructor(x, y, type = 'minion') {
        super(x, y);
        this.type = type;

        if (type === 'boss') {
            this.color = '#f0f';
            this.sprite = 'boss';
            this.stats = {
                hp: 100,
                maxHp: 100,
                damage: 15,
                xpValue: 100
            };
            this.speed = 3;
            this.attackSpeed = 1.0;
        } else {
            this.color = '#f00';
            this.sprite = 'enemy';
            this.stats = {
                hp: 30,
                maxHp: 30,
                damage: 5,
                xpValue: 20
            };
            this.speed = 2;
            this.attackSpeed = 1.5;
        }

        this.aggroRange = 8;
        this.attackCooldown = 0;
    }

    update(dt, player, map) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (dist < this.aggroRange) {
            if (dist > 0.8) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;

                const len = Math.sqrt(dx * dx + dy * dy);
                const moveX = (dx / len) * this.speed * dt;
                const moveY = (dy / len) * this.speed * dt;

                if (map.isWalkable(this.x + moveX, this.y)) {
                    this.x += moveX;
                }
                if (map.isWalkable(this.x, this.y + moveY)) {
                    this.y += moveY;
                }

                // Update facing direction based on horizontal direction to player
                if (dx > 0.01) {
                    this.facingRight = true;
                } else if (dx < -0.01) {
                    this.facingRight = false;
                }
            } else {
                if (this.attackCooldown <= 0) {
                    const damaged = this.attack(player);
                    this.attackCooldown = this.attackSpeed;
                    return damaged;
                }
            }
        }
        return false;
    }

    attack(player) {
        player.takeDamage(this.stats.damage);
        return true;
    }
}
