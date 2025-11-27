class ShipRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        this.powerUI = null;
        this.explored = [];
        this.visible = [];
    }

    initFog(layout) {
        if (this.explored.length !== layout.length || (layout.length > 0 && this.explored[0].length !== layout[0].length)) {
            this.explored = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
            this.visible = Array(layout.length).fill().map(() => Array(layout[0].length).fill(false));
        }
    }

    computeVisibility(player) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) return;
        this.initFog(ship.layout);
        this.visible = this.visible.map(row => row.map(() => false));
        const playerGridX = Math.floor((player.x + player.size / 2) / this.tileSize);
        const playerGridY = Math.floor((player.y + player.size / 2) / this.tileSize);
        const viewRadius = 8;
        for (let y = 0; y < ship.layout.length; y++) {
            for (let x = 0; x < ship.layout[0].length; x++) {
                const dist = Math.sqrt((x - playerGridX) ** 2 + (y - playerGridY) ** 2);
                if (dist <= viewRadius) {
                    if (this.hasLineOfSight(playerGridX, playerGridY, x, y, ship.layout)) {
                        this.visible[y][x] = true;
                        this.explored[y][x] = true;
                    }
                }
            }
        }
    }

    hasLineOfSight(x0, y0, x1, y1, layout) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        let x = x0;
        let y = y0;
        while (true) {
            if (x === x1 && y === y1) return true;
            if (layout[y][x] === 1 || layout[y][x] === 4) return false;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    render(ctx) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) {
            console.error("ShipRenderer: No ship layout found!", ship);
            return;
        }
        const layout = ship.layout;
        this.initFog(layout);
        const mapWidth = layout[0].length * this.tileSize;
        const mapHeight = layout.length * this.tileSize;
        this.offsetX = (ctx.canvas.width - mapWidth) / 2;
        this.offsetY = (ctx.canvas.height - mapHeight) / 2;
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        this.drawGrid(ctx, layout, ship.systems);
        if (this.powerUI) {
            this.powerUI.renderRoomOverlays(ctx, layout, 0, 0, this.tileSize);
        }
        this.drawCrew(ctx, ship);
        this.drawFog(ctx, layout);
        ctx.restore();
        this.renderShields(ctx);
    }

    drawGrid(ctx, layout, systems) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;
                if (tile === 0) continue;
                ctx.fillStyle = '#0b1120';
                ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.lineWidth = 1;
                ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);
                if (tile === 1) {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = '#00f0ff';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
                    ctx.shadowBlur = 0;
                } else if (tile === 3) {
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
                    ctx.fillStyle = '#64748b';
                    const s = 4;
                    ctx.fillRect(posX + 4, posY + 4, s, s);
                    ctx.fillRect(posX + this.tileSize - 4 - s, posY + 4, s, s);
                    ctx.fillRect(posX + 4, posY + this.tileSize - 4 - s, s, s);
                    ctx.fillRect(posX + this.tileSize - 4 - s, posY + this.tileSize - 4 - s, s, s);
                } else if (tile === 4) {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
                    ctx.clip();
                    ctx.fillStyle = '#d97706';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#000';
                    ctx.lineWidth = 4;
                    for (let i = -this.tileSize; i < this.tileSize * 2; i += 8) {
                        ctx.beginPath();
                        ctx.moveTo(posX + i, posY);
                        ctx.lineTo(posX + i + 8, posY + this.tileSize);
                        ctx.lineTo(posX + i + 4, posY + this.tileSize);
                        ctx.lineTo(posX + i - 4, posY);
                        ctx.fill();
                    }
                    ctx.restore();
                    ctx.strokeStyle = '#d97706';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
                } else if (tile === 5) {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#059669';
                    ctx.fillRect(posX, posY, 6, this.tileSize);
                    ctx.fillRect(posX + this.tileSize - 6, posY, 6, this.tileSize);
                    ctx.fillStyle = '#34d399';
                    ctx.fillRect(posX + 2, posY + this.tileSize / 2 - 2, 2, 4);
                    ctx.fillRect(posX + this.tileSize - 4, posY + this.tileSize / 2 - 2, 2, 4);
                }
            }
        }
        for (const sys of systems) {
            const posX = sys.x * this.tileSize;
            const posY = sys.y * this.tileSize;
            ctx.shadowColor = sys.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = sys.color;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = sys.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(sys.id.substring(0, 3).toUpperCase(), posX + this.tileSize / 2, posY + this.tileSize / 2 + 4);
        }
    }

    drawCrew(ctx, ship) {
        if (!ship.crew || ship.crew.length === 0) return;
        for (const crewMember of ship.crew) {
            const posX = crewMember.x || 0;
            const posY = crewMember.y || 0;
            const radius = 8;
            ctx.save();
            ctx.shadowColor = this.getCrewColor(crewMember.role);
            ctx.shadowBlur = 12;
            ctx.fillStyle = this.getCrewColor(crewMember.role);
            ctx.beginPath();
            ctx.arc(posX, posY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(posX, posY, radius - 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.getCrewColor(crewMember.role);
            ctx.beginPath();
            ctx.arc(posX, posY, radius - 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            const gridX = Math.floor(posX / this.tileSize);
            const gridY = Math.floor(posY / this.tileSize);
            if (this.visible && this.visible[gridY] && this.visible[gridY][gridX]) {
                ctx.fillStyle = '#fff';
                ctx.font = '9px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(crewMember.name.split(' ')[0], posX, posY - radius - 4);
            }
        }
    }

    getCrewColor(role) {
        const colors = {
            'Engineer': '#fbbf24',
            'Pilot': '#60a5fa',
            'Gunner': '#ef4444',
            'Medic': '#34d399'
        };
        return colors[role] || '#9ca3af';
    }

    drawFog(ctx, layout) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[0].length; x++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;
                if (!this.explored[y][x]) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                } else if (!this.visible[y][x]) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    renderShields(ctx) {
        const shields = this.game.state.ship.shields;
        if (!shields) return;
        
        const status = this.game.state.shieldManager.getShieldStatus();
        
        // Calculate ship center
        const shipCenterX = this.offsetX + (20 * this.tileSize) / 2;
        const shipCenterY = this.offsetY + (18 * this.tileSize) / 2;
        
        // Shield parameters
        const baseRadius = 320;
        const pulseRadius = baseRadius + Math.sin(Date.now() / 500) * 3;
        const time = Date.now() / 1000; // For animations
        
        // Calculate opacity with smooth recharge visibility
        let opacity;
        if (status.isRecharging) {
            // During recharge: smooth opacity increase including partial layer
            opacity = status.rechargeProgress; // Fade in from 0 to 100% during recharge
        } else if (shields.currentLayers >= shields.maxLayers) {
            // Fully charged: fade out after 5 seconds
            const fadeStartTime = 5.0;
            if (status.fullChargeTime < fadeStartTime) {
                opacity = 1.0;
            } else {
                const fadeTime = status.fullChargeTime - fadeStartTime;
                opacity = Math.max(0, 1.0 - (fadeTime / 2.0));
            }
        } else {
            // Partially charged but not recharging
            const chargePercent = shields.currentLayers / Math.max(shields.maxLayers, 1);
            opacity = chargePercent;
        }
        
        if (opacity <= 0) return;
        
        ctx.save();
        
        // Draw hexagonal shield with 6 segments
        const segments = 6;
        const angleStep = (Math.PI * 2) / segments;
        const rotationOffset = time * 0.1; // Slow rotation
        
        // Create hexagon path
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep + rotationOffset;
            const x = shipCenterX + Math.cos(angle) * pulseRadius;
            const y = shipCenterY + Math.sin(angle) * pulseRadius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        // Main shield edge with glow
        ctx.strokeStyle = `rgba(0, 255, 85, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `rgba(0, 255, 85, ${opacity * 0.8})`;
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        // Draw segment dividers with pulsing effect
        ctx.shadowBlur = 0;
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep + rotationOffset;
            const x1 = shipCenterX + Math.cos(angle) * (pulseRadius - 30);
            const y1 = shipCenterY + Math.sin(angle) * (pulseRadius - 30);
            const x2 = shipCenterX + Math.cos(angle) * (pulseRadius + 30);
            const y2 = shipCenterY + Math.sin(angle) * (pulseRadius + 30);
            
            // Pulse effect on dividers
            const pulse = Math.sin(time * 3 + i) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(0, 255, 85, ${opacity * pulse * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw vertices (glowing points at corners)
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep + rotationOffset;
            const x = shipCenterX + Math.cos(angle) * pulseRadius;
            const y = shipCenterY + Math.sin(angle) * pulseRadius;
            
            // Rotating glow at vertices
            const vertexPulse = Math.sin(time * 4 + i * 0.5) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 85, ${opacity * vertexPulse})`;
            ctx.shadowColor = `rgba(0, 255, 85, ${opacity})`;
            ctx.shadowBlur = 15;
            ctx.fill();
        }
        
        // Energy lines during recharge (animated segments filling up)
        if (status.isRecharging) {
            const rechargeSegment = Math.floor(status.rechargeProgress * segments);
            for (let i = 0; i < segments; i++) {
                const angle1 = i * angleStep + rotationOffset;
                const angle2 = (i + 1) * angleStep + rotationOffset;
                
                // Highlight segments that are "recharging"
                if (i <= rechargeSegment) {
                    const midAngle = (angle1 + angle2) / 2;
                    const innerRadius = pulseRadius - 25;
                    const outerRadius = pulseRadius - 5;
                    
                    ctx.beginPath();
                    ctx.arc(shipCenterX, shipCenterY, innerRadius, angle1, angle2);
                    ctx.arc(shipCenterX, shipCenterY, outerRadius, angle2, angle1, true);
                    ctx.closePath();
                    
                    const segmentPulse = Math.sin(time * 6) * 0.2 + 0.5;
                    ctx.fillStyle = `rgba(0, 255, 85, ${opacity * segmentPulse * 0.3})`;
                    ctx.fill();
                }
            }
        }
        
        // Outer glow ring
        ctx.beginPath();
        ctx.arc(shipCenterX, shipCenterY, pulseRadius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 85, ${opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 25;
        ctx.stroke();
        
        ctx.restore();
    }
}
