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
        this.renderOxygenBars(ctx, ship);
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

    /**
     * Render oxygen level indicators for each room
     * Shows compact horizontal bars at room centers
     */
    renderOxygenBars(ctx, ship) {
        if (!ship.rooms || ship.rooms.length === 0) return;

        ship.rooms.forEach(room => {
            // Safety check: ensure room has center
            if (!room.center || typeof room.center.x === 'undefined' || typeof room.center.y === 'undefined') {
                console.warn('Room missing center coordinates:', room);
                return;
            }

            const centerX = room.center.x * this.tileSize;
            const centerY = room.center.y * this.tileSize;

            // Calculate oxygen color based on level
            let color;
            if (room.oxygen >= 75) {
                color = '#00ff00'; // Green
            } else if (room.oxygen >= 50) {
                color = '#90ff00'; // Yellow-green
            } else if (room.oxygen >= 25) {
                color = '#ffff00'; // Yellow
            } else if (room.oxygen >= 10) {
                color = '#ff8800'; // Orange
            } else {
                color = '#ff0000'; // Red
            }

            // Bar dimensions
            const maxWidth = 20;
            const barHeight = 3;
            const width = (room.oxygen / 100) * maxWidth;

            // Draw bar background (dark)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                centerX - maxWidth / 2,
                centerY - barHeight / 2 - 8,
                maxWidth,
                barHeight
            );

            // Draw oxygen bar
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fillRect(
                centerX - maxWidth / 2,
                centerY - barHeight / 2 - 8,
                width,
                barHeight
            );
            ctx.shadowBlur = 0;

            // Optional: Add warning icon for critical oxygen
            if (room.oxygen < 25) {
                ctx.fillStyle = color;
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('!', centerX, centerY + 6);
            }
        });
    }

    renderShields(ctx) {
        const shields = this.game.state.ship.shields;
        if (!shields) return;

        const status = this.game.state.shieldManager.getShieldStatus();

        // Shield parameters
        const time = Date.now() / 1000;

        // Calculate opacity
        let opacity;
        if (status.isRecharging) {
            opacity = status.rechargeProgress;
        } else if (shields.currentLayers >= shields.maxLayers) {
            const fadeStartTime = 5.0;
            if (status.fullChargeTime < fadeStartTime) {
                opacity = 1.0;
            } else {
                const fadeTime = status.fullChargeTime - fadeStartTime;
                opacity = Math.max(0, 1.0 - (fadeTime / 2.0));
            }
        } else {
            const chargePercent = shields.currentLayers / Math.max(shields.maxLayers, 1);
            opacity = chargePercent;
        }

        // Impact flash: boost opacity to 100% for brief moment
        if (this.game.state.shieldManager.impactFlashTime > 0) {
            opacity = 1.0;
        }

        // Calculate ship center for impact effects
        const shipCenterX = this.offsetX + (25 * this.tileSize) / 2;
        const shipCenterY = this.offsetY + (25 * this.tileSize) / 2;
        const baseRadius = 360;

        // Draw impact wave FIRST (even if shields are down) - use separate rendering
        const waveProgress = this.game.state.shieldManager.impactWaveProgress;
        const flashTime = this.game.state.shieldManager.impactFlashTime;

        // DEBUG: Log effect values when they're active
        if (waveProgress > 0 || flashTime > 0) {
            console.log('[ShipRenderer] Impact effects:', { waveProgress, flashTime, opacity });
        }

        if (waveProgress > 0 && waveProgress < 1.0) {
            ctx.save();
            const waveRadius = baseRadius + (waveProgress * 100); // Expands 100px
            const waveOpacity = (1.0 - waveProgress); // Fades out as it expands, independent of shield opacity

            ctx.beginPath();
            ctx.arc(shipCenterX, shipCenterY, waveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 85, ${waveOpacity})`; // Green wave (matches shields)
            ctx.lineWidth = 3;
            ctx.shadowColor = `rgba(0, 255, 85, ${waveOpacity})`;
            ctx.shadowBlur = 15;
            ctx.stroke();

            // Energy particles dispersing with randomness
            const numParticles = 12;
            for (let i = 0; i < numParticles; i++) {
                const baseAngle = (i / numParticles) * Math.PI * 2;
                const angleVariation = (Math.random() - 0.5) * 0.4; // Random angle offset
                const angle = baseAngle + angleVariation;

                const distanceVariation = (Math.random() - 0.5) * 50; // Random distance variation
                const particleDistance = waveRadius - 30 + distanceVariation;

                const px = shipCenterX + Math.cos(angle) * particleDistance;
                const py = shipCenterY + Math.sin(angle) * particleDistance;

                const sizeVariation = Math.random() * 2 + 1; // Size between 1-3x base
                const particleSize = (1.0 - waveProgress) * 4 * sizeVariation;

                ctx.beginPath();
                ctx.arc(px, py, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 85, ${waveOpacity})`; // Green particles
                ctx.shadowBlur = 10;
                ctx.fill();
            }
            ctx.restore();
        }

        if (opacity <= 0) return;

        ctx.save();

        // Generate mesh points for active shield layers only
        const numPointsPerRing = 24;
        const numActiveLayers = Math.min(shields.currentLayers, 4); // Max 4 visual rings

        // Only create rings for active layers
        const rings = [];
        for (let i = 0; i < numActiveLayers; i++) {
            rings.push({
                radius: baseRadius - (i * 40),  // Each layer 40px smaller
                variation: 25 - (i * 5)          // Less variation for inner rings
            });
        }

        if (rings.length === 0) return; // No shields active

        const points = [];

        rings.forEach((ring, ringIndex) => {
            for (let i = 0; i < numPointsPerRing; i++) {
                const angle = (i / numPointsPerRing) * Math.PI * 2;
                const chaosAngle = angle + Math.sin(time * (0.2 + ringIndex * 0.1) + i * 0.5) * 0.2;
                const chaosRadius = ring.radius + Math.sin(time * 0.5 + i * 1.2 + ringIndex) * ring.variation;

                const x = shipCenterX + Math.cos(chaosAngle) * chaosRadius;
                const y = shipCenterY + Math.sin(chaosAngle) * chaosRadius;

                points.push({ x, y, index: i, ring: ringIndex });
            }
        });

        // Draw mesh network connections
        ctx.strokeStyle = `rgba(0, 255, 85, ${opacity * 0.6})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];

            const connections = [];
            for (let j = 0; j < points.length; j++) {
                if (i === j) continue;

                const p2 = points[j];
                const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

                if (dist < 180) {
                    connections.push({ point: p2, dist: dist });
                }
            }

            connections.sort((a, b) => a.dist - b.dist);
            const numConnections = Math.min(3 + Math.floor(Math.random() * 3), connections.length);

            for (let k = 0; k < numConnections; k++) {
                const conn = connections[k];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(conn.point.x, conn.point.y);
                ctx.globalAlpha = opacity * 0.4 * (1 - conn.dist / 180);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        }

        // Draw glowing vertices
        ctx.shadowColor = `rgba(0, 255, 85, ${opacity})`;
        ctx.shadowBlur = 8;

        for (const point of points) {
            const pulse = Math.sin(time * 4 + point.index * 0.3) * 0.3 + 0.7;
            const size = 2 + pulse;

            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 85, ${opacity * pulse})`;
            ctx.fill();
        }

        ctx.restore();
    }
}
