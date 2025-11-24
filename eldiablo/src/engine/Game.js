class Game {
    constructor(canvas) {
        console.log('Game constructor called');
        this.input = new Input();
        console.log('Input created');
        this.renderer = new Renderer(canvas);
        console.log('Renderer created');
        this.sound = new Sound();
        console.log('Sound created');
        this.lastTime = 0;

        this.currentLevel = 1;
        this.maxLevel = 10;

        console.log('Creating map...');
        this.map = new Map(50, 50);
        console.log('Map created, rooms:', this.map.rooms.length);

        if (this.map.rooms && this.map.rooms.length > 0) {
            const startRoom = this.map.rooms[0];
            const startX = startRoom.x + Math.floor(startRoom.width / 2);
            const startY = startRoom.y + Math.floor(startRoom.height / 2);
            console.log('Creating player at:', startX, startY);
            this.player = new Player(startX, startY);
        } else {
            console.error('No rooms generated! Using fallback position');
            this.player = new Player(25, 25);
        }

        console.log('Player created');
        this.enemies = [];
        this.items = [];
        this.effects = [];
        this.projectiles = [];
        this.batteries = [];
        this.stairs = null;
        this.damageFlash = 0;

        // Level transition properties
        this.levelTransitionActive = false;
        this.levelAnnouncementTimer = 0;
        this.levelAnnouncementText = '';

        console.log('Calling initLevel');
        this.initLevel();
        console.log('initLevel complete, enemies:', this.enemies.length);

        this.uiHpVal = document.getElementById('hp-val');
        this.uiHpMax = document.getElementById('hp-max');
        this.uiLvlVal = document.getElementById('lvl-val');
        this.uiFloorVal = document.getElementById('floor-val');
        this.uiMessages = document.getElementById('messages');
        this.uiAmmoVal = document.getElementById('ammo-val');
        this.uiAmmoMax = document.getElementById('ammo-max');

        this.statsMenu = document.getElementById('stats-menu');
        this.statsMenuOpen = false;
        this.initStatsMenu();

        this.inventoryMenu = document.getElementById('inventory-menu');
        this.inventoryMenuOpen = false;

        this.renderer.canvas.addEventListener('mousedown', (e) => {
            if (this.statsMenuOpen || this.inventoryMenuOpen) return;
            const rect = this.renderer.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.shootProjectile(mouseX, mouseY);
        });

        // Load battery image
        this.batteryImage = new Image();
        this.batteryImage.src = 'assets/battery.png';

        console.log('Game constructor complete!');
    }

    initStatsMenu() {
        const buttons = document.querySelectorAll('.stat-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const stat = btn.getAttribute('data-stat');
                if (this.player.addStatPoint(stat)) {
                    this.updateStatsMenu();
                    this.sound.playAttack();
                }
            });
        });
    }

    updateStatsMenu() {
        document.getElementById('stat-points').innerText = this.player.statPoints;

        const strBonus = this.player.stats.strength - this.player.baseStats.strength;
        const dexBonus = this.player.stats.dexterity - this.player.baseStats.dexterity;
        const vitBonus = this.player.stats.vitality - this.player.baseStats.vitality;
        const intBonus = this.player.stats.intelligence - this.player.baseStats.intelligence;

        document.getElementById('stat-str').innerText = this.player.baseStats.strength + (strBonus > 0 ? ` (+${strBonus})` : '');
        document.getElementById('stat-dex').innerText = this.player.baseStats.dexterity + (dexBonus > 0 ? ` (+${dexBonus})` : '');
        document.getElementById('stat-vit').innerText = this.player.baseStats.vitality + (vitBonus > 0 ? ` (+${vitBonus})` : '');
        document.getElementById('stat-int').innerText = this.player.baseStats.intelligence + (intBonus > 0 ? ` (+${intBonus})` : '');

        const buttons = document.querySelectorAll('.stat-btn');
        buttons.forEach(btn => {
            btn.disabled = this.player.statPoints <= 0;
        });
    }

    toggleStatsMenu() {
        this.statsMenuOpen = !this.statsMenuOpen;
        this.statsMenu.style.display = this.statsMenuOpen ? 'flex' : 'none';
        if (this.statsMenuOpen) {
            this.updateStatsMenu();
        }
    }

    toggleInventoryMenu() {
        this.inventoryMenuOpen = !this.inventoryMenuOpen;
        this.inventoryMenu.style.display = this.inventoryMenuOpen ? 'flex' : 'none';
        if (this.inventoryMenuOpen) {
            this.updateInventoryMenu();
        }
    }

    updateInventoryMenu() {
        this.updateEquipmentSlot('weapon', this.player.equipment.weapon);
        this.updateEquipmentSlot('armor', this.player.equipment.armor);
        this.updateEquipmentSlot('helmet', this.player.equipment.helmet);
    }

    updateEquipmentSlot(slotName, item) {
        const slotElement = document.getElementById(`slot-${slotName}`);

        if (!item) {
            slotElement.innerHTML = '<div class="empty-slot">Vacío</div>';
        } else {
            let statsHtml = '';
            for (let stat in item.stats) {
                const value = item.stats[stat];
                const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1);
                statsHtml += `<div class="stat-bonus">${statLabel}: ${value}</div>`;
            }

            slotElement.innerHTML = `
                <div class="item-equipped">
                    <div class="item-name">${item.name}</div>
                    <div class="item-stats">${statsHtml}</div>
                </div>
            `;
        }
    }

    initLevel() {
        this.enemies = [];
        this.items = [];
        this.batteries = [];

        const enemyCount = 10 + this.currentLevel * 2;
        this.spawnEnemies(enemyCount);

        if (this.currentLevel < this.maxLevel) {
            this.stairs = this.map.spawnStairs();
        } else {
            this.stairs = null;
        }
    }

    spawnEnemies(count) {
        const positions = this.map.spawnEnemies(count);
        positions.forEach(pos => {
            if (Math.hypot(pos.x - this.player.x, pos.y - this.player.y) > 5) {
                this.enemies.push(new Enemy(pos.x, pos.y));
            }
        });

        const bossCount = this.currentLevel === this.maxLevel ? 1 : Math.floor(this.currentLevel / 3);
        for (let i = 0; i < bossCount; i++) {
            const bossPos = this.map.spawnEnemies(1)[0];
            if (bossPos) {
                this.enemies.push(new Enemy(bossPos.x, bossPos.y, 'boss'));
            }
        }
    }

    start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.draw();
        this.updateUI();

        this.input.update();
        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        // Update level announcement timer
        if (this.levelAnnouncementTimer > 0) {
            this.levelAnnouncementTimer -= dt;
            if (this.levelAnnouncementTimer <= 0) {
                this.levelTransitionActive = false;
                this.levelAnnouncementText = '';
            }
        }

        if (this.player.hp <= 0) {
            this.showMessage('GAME OVER! Refresh to restart.');
            return;
        }

        if (this.input.isPressed('KeyP')) {
            this.toggleStatsMenu();
        }

        if (this.input.isPressed('KeyI')) {
            this.toggleInventoryMenu();
        }

        if (this.statsMenuOpen || this.inventoryMenuOpen) {
            return;
        }

        const oldX = this.player.x;
        const oldY = this.player.y;

        this.player.update(dt, this.input);

        const newX = this.player.x;
        const newY = this.player.y;

        if (!this.map.isWalkableWithHitbox(newX, newY)) {
            this.player.y = oldY;
            if (!this.map.isWalkableWithHitbox(this.player.x, this.player.y)) {
                this.player.x = oldX;
                this.player.y = newY;

                if (!this.map.isWalkableWithHitbox(this.player.x, this.player.y)) {
                    this.player.x = oldX;
                    this.player.y = oldY;
                }
            }
        }

        if (this.stairs) {
            const distToStairs = Math.hypot(this.player.x - this.stairs.x, this.player.y - this.stairs.y);
            if (distToStairs < 1) {
                this.nextLevel();
            }
        }

        this.enemies.forEach(enemy => {
            const damaged = enemy.update(dt, this.player, this.map);
            if (damaged) {
                this.effects.push(new Effect(this.player.x, this.player.y, 'damage'));
                this.sound.playHit();
                this.damageFlash = 0.3;
            }
        });

        this.effects.forEach(effect => effect.update(dt));
        this.effects = this.effects.filter(e => e.life > 0);

        this.updateProjectiles(dt);

        if (this.input.isPressed('Space')) {
            this.playerAttack();
        }

        // Check battery pickup
        for (let i = this.batteries.length - 1; i >= 0; i--) {
            const battery = this.batteries[i];
            const dist = Math.hypot(battery.x - this.player.x, battery.y - this.player.y);
            if (dist < 1.5) {
                this.player.ammo = Math.min(this.player.ammo + 2, this.player.maxAmmo);
                this.batteries.splice(i, 1);
                this.showMessage(`+2 Energía! (${this.player.ammo}/${this.player.maxAmmo})`);
                this.sound.playAttack();
            }
        }

        let nearbyItem = null;
        this.items.forEach((item) => {
            const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y);
            if (dist < 1.5) {
                nearbyItem = item;
            }
        });

        this.updateItemComparison(nearbyItem);

        if (this.input.isPressed('KeyE') && nearbyItem) {
            this.player.equip(nearbyItem);
            this.items = this.items.filter(i => i !== nearbyItem);
            this.showMessage(`Equipado ${nearbyItem.name}!`);
            this.sound.playAttack();
        }

        this.enemies = this.enemies.filter(e => e.stats.hp > 0);

        if (this.currentLevel === this.maxLevel && this.enemies.length === 0) {
            this.showMessage('YOU WIN! Final boss defeated!');
        }

        if (this.damageFlash > 0) {
            this.damageFlash -= dt;
            if (this.damageFlash < 0) this.damageFlash = 0;
        }
    }

    updateItemComparison(newItem) {
        const panel = document.getElementById('item-comparison');

        if (!newItem) {
            panel.style.display = 'none';
            return;
        }

        const equippedItem = this.player.equipment[newItem.type];

        let newItemStatsHtml = '';
        for (let stat in newItem.stats) {
            const value = newItem.stats[stat];
            const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1);

            let diff = '';
            let valueClass = '';
            if (equippedItem && equippedItem.stats[stat] !== undefined) {
                const equippedValue = equippedItem.stats[stat];
                const difference = value - equippedValue;
                if (difference > 0) {
                    diff = `<span class="stat-diff positive">(+${difference})</span>`;
                    valueClass = 'better';
                } else if (difference < 0) {
                    diff = `<span class="stat-diff negative">(${difference})</span>`;
                    valueClass = 'worse';
                }
            }

            newItemStatsHtml += `
                <div class="comparison-stat">
                    <span class="stat-label">${statLabel}:</span>
                    <span>
                        <span class="stat-value ${valueClass}">${value}</span>
                        ${diff}
                    </span>
                </div>
            `;
        }

        let equippedHtml = '';
        if (equippedItem) {
            let equippedStatsHtml = '';
            for (let stat in equippedItem.stats) {
                const value = equippedItem.stats[stat];
                const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1);
                equippedStatsHtml += `
                    <div class="comparison-stat">
                        <span class="stat-label">${statLabel}:</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `;
            }

            const typeLabel = equippedItem.type.charAt(0).toUpperCase() + equippedItem.type.slice(1);
            equippedHtml = `
                <div class="comparison-title">${equippedItem.name}</div>
                <div class="comparison-type">${typeLabel} Equipado</div>
                <div class="comparison-stats">${equippedStatsHtml}</div>
            `;
        } else {
            equippedHtml = '<div class="empty-slot-text">Sin equipar</div>';
        }

        const newTypeLabel = newItem.type.charAt(0).toUpperCase() + newItem.type.slice(1);

        panel.innerHTML = `
            <div class="comparison-header">COMPARAR EQUIPO</div>
            <div class="comparison-container">
                <div class="comparison-item new-item">
                    <div class="comparison-title">${newItem.name}</div>
                    <div class="comparison-type">${newTypeLabel} Nuevo</div>
                    <div class="comparison-stats">${newItemStatsHtml}</div>
                </div>
                <div class="comparison-item">
                    ${equippedHtml}
                </div>
            </div>
            <div class="comparison-hint">Presiona E para equipar</div>
        `;

        panel.style.display = 'block';
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > this.maxLevel) {
            this.currentLevel = this.maxLevel;
            return;
        }

        // Set level announcement
        this.levelAnnouncementText = `LEVEL ${this.currentLevel}`;
        this.levelAnnouncementTimer = 3.0; // 3 seconds
        this.levelTransitionActive = true;

        this.map = new Map(50, 50);

        if (this.map.rooms && this.map.rooms.length > 0) {
            const startRoom = this.map.rooms[0];
            this.player.x = startRoom.x + Math.floor(startRoom.width / 2);
            this.player.y = startRoom.y + Math.floor(startRoom.height / 2);
        } else {
            this.player.x = 25;
            this.player.y = 25;
        }

        this.initLevel();

        // Trigger teleport effects AFTER player position is updated
        this.effects.push(new Effect(this.player.x, this.player.y, 'teleport', 0));
        this.sound.playTeleport();
    }

    playerAttack() {
        this.sound.playAttack();

        const range = 1.2 + (this.player.stats.intelligence * 0.05);
        const effectSize = Math.min(range / 1.5, 2);
        this.effects.push(new Effect(this.player.x, this.player.y, 'pulse', effectSize));

        this.enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist <= range) {
                const dmg = this.player.stats.strength;

                enemy.stats.hp -= dmg;
                this.sound.playHit();

                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                enemy.x += dx * 0.5;
                enemy.y += dy * 0.5;

                if (enemy.stats.hp <= 0) {
                    this.onEnemyDeath(enemy);
                }
            }
        });
    }

    onEnemyDeath(enemy) {
        this.player.gainXp(enemy.stats.xpValue);
        this.showMessage(`Killed ${enemy.type}! +${enemy.stats.xpValue} XP`);

        if (Math.random() > 0.5) {
            const item = Item.generate(this.player.level);
            item.x = enemy.x;
            item.y = enemy.y;
            this.items.push(item);
        }

        // 30% chance for battery drop
        if (Math.random() > 0.7) {
            this.batteries.push({
                x: enemy.x,
                y: enemy.y
            });
        }
    }

    updateUI() {
        this.uiHpVal.innerText = Math.floor(this.player.hp);
        this.uiHpMax.innerText = this.player.maxHp;
        this.uiLvlVal.innerText = this.player.level;
        this.uiFloorVal.innerText = this.currentLevel;
        this.uiAmmoVal.innerText = this.player.ammo;
        this.uiAmmoMax.innerText = this.player.maxAmmo;
    }

    showMessage(msg) {
        this.uiMessages.innerText = msg;
        setTimeout(() => {
            if (this.uiMessages.innerText === msg) this.uiMessages.innerText = '';
        }, 2000);
    }

    draw() {
        this.renderer.clear();

        const cameraX = this.player.x;
        const cameraY = this.player.y;

        this.map.draw(this.renderer, cameraX, cameraY, this.stairs);

        // Draw batteries with image
        this.batteries.forEach(battery => {
            const pos = this.renderer.isoToScreen(battery.x, battery.y, cameraX, cameraY);
            const ctx = this.renderer.ctx;

            if (this.batteryImage.complete) {
                ctx.drawImage(this.batteryImage, pos.x - 16, pos.y - 16, 32, 32);
            } else {
                // Fallback while loading
                ctx.fillStyle = '#00ff00';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ff00';
                ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
                ctx.shadowBlur = 0;
            }
        });

        this.items.forEach(item => item.draw(this.renderer, cameraX, cameraY));
        this.enemies.forEach(enemy => enemy.draw(this.renderer, cameraX, cameraY));

        this.player.draw(this.renderer, cameraX, cameraY);
        this.projectiles.forEach(p => p.draw(this.renderer, cameraX, cameraY));

        this.effects.forEach(effect => effect.draw(this.renderer, cameraX, cameraY));

        if (this.damageFlash > 0) {
            const ctx = this.renderer.ctx;
            const alpha = Math.min(this.damageFlash, 0.4);
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        }

        // Draw level announcement banner
        if (this.levelAnnouncementTimer > 0 && this.levelAnnouncementText) {
            const ctx = this.renderer.ctx;
            const canvas = this.renderer.canvas;

            // Calculate fade animation
            let alpha = 1.0;
            if (this.levelAnnouncementTimer > 2.5) {
                // Fade in (first 0.5s)
                alpha = (3.0 - this.levelAnnouncementTimer) / 0.5;
            } else if (this.levelAnnouncementTimer < 0.5) {
                // Fade out (last 0.5s)
                alpha = this.levelAnnouncementTimer / 0.5;
            }

            ctx.save();

            // Draw background overlay
            ctx.fillStyle = `rgba(0, 20, 30, ${alpha * 0.8})`;
            const bannerHeight = 120;
            const bannerY = 80;
            ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

            // Draw border
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.strokeRect(10, bannerY + 10, canvas.width - 20, bannerHeight - 20);

            // Draw text
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 20;
            ctx.shadowColor = `rgba(0, 255, 255, ${alpha})`;
            ctx.fillText(this.levelAnnouncementText, canvas.width / 2, bannerY + bannerHeight / 2);

            ctx.restore();
        }
    }

    shootProjectile(mouseX, mouseY) {
        if (this.player.ammo <= 0) {
            this.showMessage('Sin energía! Busca baterías');
            return;
        }

        const cameraX = this.player.x;
        const cameraY = this.player.y;
        const targetIso = this.renderer.screenToIso(mouseX, mouseY, cameraX, cameraY);

        const speed = 12;
        const damage = this.player.stats.strength * 0.8;

        this.projectiles.push(new Projectile(
            this.player.x,
            this.player.y,
            targetIso.x,
            targetIso.y,
            speed,
            damage
        ));

        this.player.ammo--;
        this.effects.push(new Effect(this.player.x, this.player.y, 'pulse', 0.8));
        this.sound.playAttack();
    }

    updateProjectiles(dt) {
        this.projectiles.forEach(p => {
            const hitWall = p.update(dt, this.map);

            if (hitWall) {
                this.effects.push(new Effect(p.x, p.y, 'pulse', 0.5));
            } else if (p.active) {
                for (let enemy of this.enemies) {
                    const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
                    if (dist < 0.8) {
                        p.active = false;
                        enemy.stats.hp -= p.damage;
                        this.sound.playHit();
                        this.effects.push(new Effect(enemy.x, enemy.y, 'damage'));

                        const dx = p.vx * 0.1;
                        const dy = p.vy * 0.1;
                        enemy.x += dx;
                        enemy.y += dy;

                        if (enemy.stats.hp <= 0) {
                            this.onEnemyDeath(enemy);
                        }
                        break;
                    }
                }
            }
        });

        this.projectiles = this.projectiles.filter(p => p.active);
    }
}
