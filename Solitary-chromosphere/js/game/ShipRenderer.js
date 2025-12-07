class ShipRenderer {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.tileSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        this.powerUI = null;
        this.explored = [];
        this.visible = [];

        // Initialize starfield background
        this.starfield = new StarfieldBackground(gameEngine.canvas.width, gameEngine.canvas.height);

        // Initialize weapon fire effects
        this.weaponFireEffects = new WeaponFireEffects();

        // Initialize hazard renderer (will get manager reference later)
        this.hazardRenderer = null;
    }

    initFog(layout) {
        if (this.explored.length !== layout.length || (layout.length > 0 && this.explored[0].length !== layout[0].length)) {
            this.explored = Array(layout.length).fill().map((_, y) =>
                Array(layout[0].length).fill().map((_, x) =>
                    // All ship tiles (non-zero) are explored from start - it's our ship!
                    layout[y][x] !== 0
                )
            );
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

    render(ctx, deltaTime = 0.016) {
        const ship = this.game.state.ship;
        if (!ship || !ship.layout) {
            console.error("ShipRenderer: No ship layout found!", ship);
            return;
        }

        // Ensure starfield matches full canvas size
        if (this.starfield.width !== ctx.canvas.width || this.starfield.height !== ctx.canvas.height) {
            this.starfield.resize(ctx.canvas.width, ctx.canvas.height);
        }

        // Update and render starfield FIRST (background layer)
        this.starfield.update(deltaTime);
        this.starfield.render(ctx);

        // Update weapon fire effects
        this.weaponFireEffects.update();

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
        this.renderEngineThruster(ctx, ship);
        this.renderWeaponTurrets(ctx, ship);

        // Render weapon fire effects (on top of weapons)
        this.weaponFireEffects.render(ctx, this.tileSize);

        // Render hazards (breaches, fires, oxygen overlay)
        if (!this.hazardRenderer && this.game.state.hazardManager) {
            this.hazardRenderer = new HazardRenderer(this.game.state.hazardManager);
        }
        if (this.hazardRenderer) {
            this.hazardRenderer.render(ctx, this.tileSize, this.offsetX, this.offsetY);
        }

        // Render hazard UI (repair prompts, progress bars, oxygen HUD)
        if (this.game.state.hazardUI) {
            const player = this.game.sceneManager.player;
            this.game.state.hazardUI.render(ctx, this, player);
        }

        this.drawFog(ctx, layout);
        ctx.restore();

        // Render station if near one
        this.renderStation(ctx);

        this.renderShields(ctx);
    }

    drawGrid(ctx, layout, systems) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const tile = layout[y][x];
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;

                // Tile 0 = outer space, make it COMPLETELY transparent (no fill, no grid)
                if (tile === 0) {
                    continue; // Don't draw anything - let starfield show through
                }
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
                } else if (tile === 7) {
                    // Infirmary - reddish floor with medical cross
                    ctx.fillStyle = '#2d1a1a'; // Dark red floor
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                    // Medical cross
                    ctx.fillStyle = '#ff5555';
                    const centerX = posX + this.tileSize / 2;
                    const centerY = posY + this.tileSize / 2;
                    const crossSize = this.tileSize * 0.4;
                    const crossWidth = crossSize * 0.3;

                    // Vertical bar  
                    ctx.fillRect(centerX - crossWidth / 2, centerY - crossSize / 2, crossWidth, crossSize);
                    // Horizontal bar
                    ctx.fillRect(centerX - crossSize / 2, centerY - crossWidth / 2, crossSize, crossWidth);

                    // Border
                    ctx.strokeStyle = 'rgba(255, 85, 85, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
        for (const sys of systems) {
            const posX = sys.x * this.tileSize;
            const posY = sys.y * this.tileSize;

            // Check if system has a module installed
            const systemToHardpoint = {
                'bridge': 'bridge',
                'shield': 'shield',
                'engine': 'engine',
                'jumpdrive': 'jumpDrive',
                'reactor': 'reactor',
                'weapon': sys.id === 'weapons1' ? 'weapon1' : 'weapon2'
            };
            const hardpointKey = systemToHardpoint[sys.type];
            const hasModule = hardpointKey && this.game.state.ship.hardpoints[hardpointKey];

            // Darker appearance if no module installed
            const alpha = hasModule ? 0.2 : 0.05;
            const shadowBlur = hasModule ? 15 : 5;

            ctx.shadowColor = sys.color;
            ctx.shadowBlur = shadowBlur;
            ctx.fillStyle = sys.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = hasModule ? sys.color : '#444';
            ctx.lineWidth = 2;
            ctx.strokeRect(posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);



            // Draw system ID
            ctx.fillStyle = hasModule ? '#fff' : '#666';
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

                // Skip tile 0 (outer space) - let starfield show through
                if (layout[y][x] === 0) {
                    continue;
                }

                // Only draw shadow for non-visible tiles (all ship tiles are pre-explored)
                if (!this.visible[y][x]) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    /**
     * Render oxygen level indicators for each room
     * Shows compact horizontal bars at room centers using HazardManager data
     */
    renderOxygenBars(ctx, ship) {
        // Use HazardManager data if available, otherwise fall back to old system
        if (this.game.state.hazardManager && this.game.state.hazardManager.rooms.length > 0) {
            // Use new HazardManager room data
            for (const room of this.game.state.hazardManager.rooms) {
                if (!room.tiles || room.tiles.length === 0) continue;

                // Calculate room center from tiles
                let sumX = 0, sumY = 0;
                for (const tile of room.tiles) {
                    sumX += tile.x;
                    sumY += tile.y;
                }
                const centerX = (sumX / room.tiles.length) * this.tileSize + this.tileSize / 2;
                const centerY = (sumY / room.tiles.length) * this.tileSize + this.tileSize / 2;

                const roomOxygen = this.game.state.hazardManager.roomOxygen[room.id];
                if (!roomOxygen) continue;

                const oxygenLevel = roomOxygen.level;

                // Calculate oxygen color based on level
                let color;
                if (oxygenLevel >= 75) {
                    color = '#00ff00'; // Green
                } else if (oxygenLevel >= 50) {
                    color = '#90ff00'; // Yellow-green
                } else if (oxygenLevel >= 25) {
                    color = '#ffff00'; // Yellow
                } else if (oxygenLevel >= 10) {
                    color = '#ff8800'; // Orange
                } else {
                    color = '#ff0000'; // Red
                }

                // Bar dimensions
                const maxWidth = 20;
                const barHeight = 3;
                const width = (oxygenLevel / 100) * maxWidth;

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
                if (oxygenLevel < 25) {
                    ctx.fillStyle = color;
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('!', centerX, centerY + 6);
                }
            }
        } else if (ship.rooms && ship.rooms.length > 0) {
            // Fallback to old system
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
            // Impact effects rendering
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

    /**
     * Render engine thruster visual based on installed engine module
     * Futuristic design with hexagonal nozzle, plasma particles, and energy rings
     */
    renderEngineThruster(ctx, ship) {
        // Engine is at position (13, 20)
        const engineX = 13;
        const engineY = 20;

        // Check what engine module is installed
        const engineModuleId = ship.hardpoints?.engine;
        if (!engineModuleId) return;

        const engineModule = getModule(engineModuleId);
        if (!engineModule) return;

        const time = Date.now() / 1000;
        const tier = engineModule.tier;

        // Thruster dimensions scale with tier
        const widthMultiplier = 0.7 + (tier * 0.4);
        const heightMultiplier = 1.8 + (tier * 0.5);

        const thrusterWidth = this.tileSize * widthMultiplier;
        const thrusterHeight = this.tileSize * heightMultiplier;

        const centerX = engineX * this.tileSize + this.tileSize / 2;
        const startY = (engineY + 1) * this.tileSize;

        ctx.save();

        // === HEXAGONAL NOZZLE ===
        const hexRadius = thrusterWidth * 0.5;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            hexPoints.push({
                x: centerX + Math.cos(angle) * hexRadius,
                y: startY + Math.sin(angle) * hexRadius * 0.6
            });
        }

        const nozzleGradient = ctx.createLinearGradient(centerX, startY, centerX, startY + thrusterHeight);
        nozzleGradient.addColorStop(0, '#1a2a4a');
        nozzleGradient.addColorStop(0.5, '#0d1825');
        nozzleGradient.addColorStop(1, '#050a15');

        ctx.fillStyle = nozzleGradient;
        ctx.beginPath();
        ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
        for (let i = 1; i < 6; i++) ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
        ctx.closePath();
        const bottomScale = 1.4 + tier * 0.3;
        for (let i = 5; i >= 0; i--) {
            ctx.lineTo(centerX + (hexPoints[i].x - centerX) * bottomScale, startY + thrusterHeight);
        }
        ctx.fill();

        ctx.strokeStyle = '#3a5a8a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
        for (let i = 1; i < 6; i++) ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
        ctx.closePath();
        ctx.stroke();

        // === ENERGY RINGS ===
        const numRings = 3 + tier;
        for (let i = 0; i < numRings; i++) {
            const progress = ((time * 0.5 + i * 0.3) % 1.0);
            const ringY = startY + progress * thrusterHeight;
            const ringScale = 0.3 + progress * 0.7;
            const ringAlpha = (1 - progress) * 0.6;

            ctx.strokeStyle = `rgba(0, 200, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = `rgba(0, 200, 255, ${ringAlpha})`;
            ctx.shadowBlur = 8;

            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 3) * j - Math.PI / 2;
                const radius = hexRadius * ringScale * (1 + tier * 0.2);
                const x = centerX + Math.cos(angle) * radius;
                const y = ringY + Math.sin(angle) * radius * 0.6;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // === PLASMA CORE ===
        const pulse = Math.sin(time * 5) * 0.3 + 0.7;
        const coreIntensity = pulse * (0.6 + tier * 0.1);

        const coreGradient = ctx.createRadialGradient(
            centerX, startY + thrusterHeight * 0.65, 0,
            centerX, startY + thrusterHeight * 0.65, thrusterWidth * 0.5
        );
        coreGradient.addColorStop(0, `rgba(150, 220, 255, ${coreIntensity})`);
        coreGradient.addColorStop(0.3, `rgba(80, 150, 255, ${coreIntensity * 0.8})`);
        coreGradient.addColorStop(0.6, `rgba(0, 100, 255, ${coreIntensity * 0.5})`);
        coreGradient.addColorStop(1, 'rgba(0, 50, 200, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, startY + thrusterHeight * 0.7, thrusterWidth * 0.45, thrusterHeight * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `rgba(80, 150, 255, ${coreIntensity * 0.8})`;
        ctx.shadowBlur = 20 + tier * 5;
        ctx.fillStyle = `rgba(0, 150, 255, ${coreIntensity * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(centerX, startY + thrusterHeight * 0.75, thrusterWidth * 0.6, thrusterHeight * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === PLASMA PARTICLES ===
        const numParticles = 15 + tier * 5;
        for (let i = 0; i < numParticles; i++) {
            const particleProgress = ((time * (1 + Math.sin(i)) + i * 0.1) % 1.0);
            const particleY = startY + thrusterHeight * (0.4 + particleProgress * 0.6);
            const spread = thrusterWidth * 0.3 * (1 - particleProgress);
            const particleX = centerX + (Math.sin(i * 2.5) * spread);
            const particleAlpha = (1 - particleProgress) * 0.7;
            const particleSize = (1 + tier * 0.3) * (1 - particleProgress * 0.5);

            ctx.fillStyle = `rgba(150, 200, 255, ${particleAlpha})`;
            ctx.shadowColor = `rgba(150, 200, 255, ${particleAlpha})`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // === STRUCTURAL VENTS ===
        ctx.strokeStyle = '#4a7aaa';
        ctx.lineWidth = 1.5;
        const numVents = 2 + Math.floor(tier / 2);
        for (let i = 0; i < numVents; i++) {
            const ventY = startY + (thrusterHeight / (numVents + 1)) * (i + 1);
            const ventWidth = hexRadius * (1 + (i / numVents) * 0.5);

            ctx.beginPath();
            ctx.moveTo(centerX - ventWidth, ventY);
            ctx.lineTo(centerX - ventWidth * 0.8, ventY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX + ventWidth, ventY);
            ctx.lineTo(centerX + ventWidth * 0.8, ventY);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Render weapon turrets based on installed weapon modules
     * Different visual designs for each weapon type
     */
    renderWeaponTurrets(ctx, ship) {
        // Weapon positions
        const weapons = [
            { x: 9, y: 6, hardpoint: 'weapon1' },
            { x: 17, y: 6, hardpoint: 'weapon2' }
        ];

        for (const weapon of weapons) {
            const weaponModuleId = ship.hardpoints?.[weapon.hardpoint];
            if (!weaponModuleId) continue;

            const weaponModule = getModule(weaponModuleId);
            if (!weaponModule) continue;

            const centerX = weapon.x * this.tileSize + this.tileSize / 2;
            const centerY = weapon.y * this.tileSize + this.tileSize / 2;
            const time = Date.now() / 1000;

            ctx.save();

            // Render based on weapon type
            switch (weaponModule.id) {
                case 'laser_mk1':
                    this.renderLaserCannon(ctx, centerX, centerY, time);
                    break;
                case 'ion_cannon':
                    this.renderIonCannon(ctx, centerX, centerY, time);
                    break;
                case 'railgun':
                    this.renderRailgun(ctx, centerX, centerY, time);
                    break;
                case 'plasma_cannon':
                    this.renderPlasmaCannon(ctx, centerX, centerY, time);
                    break;
                case 'pulse_laser':
                    this.renderPulseLaser(ctx, centerX, centerY, time);
                    break;
            }

            ctx.restore();
        }
    }

    renderLaserCannon(ctx, x, y, time) {
        // Twin laser barrels with red glow
        const barrelLength = this.tileSize * 0.8;
        const barrelWidth = 4;
        const spacing = 8;

        // Left barrel
        ctx.fillStyle = '#555';
        ctx.fillRect(x - spacing - barrelWidth, y - barrelLength / 2, barrelWidth, barrelLength);

        // Right barrel
        ctx.fillRect(x + spacing, y - barrelLength / 2, barrelWidth, barrelLength);

        // Glowing tips
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 68, 68, ${pulse})`;
        ctx.fillStyle = `rgba(255, 68, 68, ${pulse})`;

        ctx.fillRect(x - spacing - barrelWidth, y - barrelLength / 2 - 3, barrelWidth, 3);
        ctx.fillRect(x + spacing, y - barrelLength / 2 - 3, barrelWidth, 3);
        ctx.shadowBlur = 0;

        // Mount base
        ctx.fillStyle = '#444';
        ctx.fillRect(x - this.tileSize * 0.3, y + barrelLength / 2 - 6, this.tileSize * 0.6, 6);
    }

    renderIonCannon(ctx, x, y, time) {
        // Circular ion coil with cyan energy
        const radius = this.tileSize * 0.35;

        // Outer ring
        ctx.strokeStyle = '#3a5a7a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Energy coils (rotating)
        const rotation = time * 2;
        for (let i = 0; i < 4; i++) {
            const angle = rotation + (i * Math.PI / 2);
            const x1 = x + Math.cos(angle) * radius * 0.6;
            const y1 = y + Math.sin(angle) * radius * 0.6;
            const x2 = x + Math.cos(angle + Math.PI) * radius * 0.6;
            const y2 = y + Math.sin(angle + Math.PI) * radius * 0.6;

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Central core
        const pulse = Math.sin(time * 4) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    renderRailgun(ctx, x, y, time) {
        // Long barrel with magnetic rings
        const barrelLength = this.tileSize * 1.1;
        const barrelWidth = 8;

        // Main barrel
        const gradient = ctx.createLinearGradient(x, y - barrelLength / 2, x, y + barrelLength / 2);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(0.5, '#555');
        gradient.addColorStop(1, '#2a2a2a');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - barrelWidth / 2, y - barrelLength / 2, barrelWidth, barrelLength);

        // Magnetic accelerator rings
        const numRings = 5;
        const pulse = (time * 3) % 1.0;
        for (let i = 0; i < numRings; i++) {
            const ringY = y - barrelLength / 2 + (barrelLength / numRings) * i;
            const ringAlpha = Math.max(0, 1 - Math.abs(pulse - (i / numRings)));

            ctx.strokeStyle = `rgba(255, 200, 0, ${ringAlpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(255, 200, 0, ${ringAlpha})`;
            ctx.beginPath();
            ctx.arc(x, ringY, barrelWidth * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Mount
        ctx.fillStyle = '#333';
        ctx.fillRect(x - this.tileSize * 0.25, y + barrelLength / 2 - 4, this.tileSize * 0.5, 6);
    }

    renderPlasmaCannon(ctx, x, y, time) {
        // Plasma containment sphere with rotating energy
        const radius = this.tileSize * 0.4;

        // Containment field hexagon
        ctx.strokeStyle = '#5a3a7a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Plasma core (pulsing)
        const pulse = Math.sin(time * 4) * 0.4 + 0.6;
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.7);
        coreGradient.addColorStop(0, `rgba(255, 0, 255, ${pulse})`);
        coreGradient.addColorStop(0.5, `rgba(200, 0, 255, ${pulse * 0.6})`);
        coreGradient.addColorStop(1, 'rgba(100, 0, 200, 0)');

        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rotating energy streams
        const rotation = time * 2;
        for (let i = 0; i < 3; i++) {
            const angle = rotation + (i * Math.PI * 2 / 3);
            const streamRadius = radius * 0.5;
            const sx = x + Math.cos(angle) * streamRadius;
            const sy = y + Math.sin(angle) * streamRadius;

            ctx.fillStyle = `rgba(255, 100, 255, 0.6)`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderPulseLaser(ctx, x, y, time) {
        // Triple barrel pulse laser array
        const barrelLength = this.tileSize * 0.7;
        const barrelWidth = 3;
        const spacing = 6;

        // Three barrels
        const barrels = [-spacing, 0, spacing];
        for (const offset of barrels) {
            ctx.fillStyle = '#555';
            ctx.fillRect(x + offset - barrelWidth / 2, y - barrelLength / 2, barrelWidth, barrelLength);
        }

        // Pulsing charge effect (staggered)
        for (let i = 0; i < 3; i++) {
            const pulse = Math.sin(time * 6 + i * 1.5) * 0.5 + 0.5;
            if (pulse > 0.7) {
                const offset = barrels[i];
                ctx.fillStyle = `rgba(255, 136, 0, ${pulse})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ff8800';
                ctx.fillRect(x + offset - barrelWidth / 2, y - barrelLength / 2 - 3, barrelWidth, 3);
                ctx.shadowBlur = 0;
            }
        }

        // Mount base
        ctx.fillStyle = '#444';
        ctx.fillRect(x - this.tileSize * 0.3, y + barrelLength / 2 - 4, this.tileSize * 0.6, 5);
    }

    /**
     * Render a distant Stanford Torus space station
     * Only renders if the current planet has a station
     */
    renderStation(ctx) {
        const currentPlanet = this.game.state.currentPlanet;
        if (!currentPlanet || !currentPlanet.hasStation) {
            return; // No station to render
        }

        ctx.save();

        // Position in upper right corner (moved left to avoid UI overlap)
        const stationX = ctx.canvas.width - 400;
        const stationY = 150;
        const time = Date.now() / 1000;

        // Stanford Torus dimensions
        const outerRadius = 100;
        const innerRadius = 60;
        const thickness = outerRadius - innerRadius;

        // Draw outer ring with gradient
        const outerGradient = ctx.createRadialGradient(
            stationX, stationY, innerRadius,
            stationX, stationY, outerRadius
        );
        outerGradient.addColorStop(0, '#2a2a3e');
        outerGradient.addColorStop(0.5, '#4a4a6e');
        outerGradient.addColorStop(1, '#1a1a2e');

        // Draw main torus ring
        ctx.strokeStyle = outerGradient;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.arc(stationX, stationY, (outerRadius + innerRadius) / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner shadow for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = thickness * 0.3;
        ctx.beginPath();
        ctx.arc(stationX, stationY, innerRadius + thickness * 0.15, 0, Math.PI * 2);
        ctx.stroke();

        // Draw structural spokes (connecting hub to ring)
        const numSpokes = 8;
        const hubRadius = 15;
        ctx.strokeStyle = '#556677';
        ctx.lineWidth = 2;
        for (let i = 0; i < numSpokes; i++) {
            const angle = (i / numSpokes) * Math.PI * 2;
            const x1 = stationX + Math.cos(angle) * hubRadius;
            const y1 = stationY + Math.sin(angle) * hubRadius;
            const x2 = stationX + Math.cos(angle) * innerRadius;
            const y2 = stationY + Math.sin(angle) * innerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Draw central hub
        const hubGradient = ctx.createRadialGradient(
            stationX, stationY, 0,
            stationX, stationY, hubRadius
        );
        hubGradient.addColorStop(0, '#5a5a7e');
        hubGradient.addColorStop(1, '#2a2a4e');

        ctx.fillStyle = hubGradient;
        ctx.beginPath();
        ctx.arc(stationX, stationY, hubRadius, 0, Math.PI * 2);
        ctx.fill();

        // Add detail lines on the ring (segments)
        const numSegments = 16;
        ctx.strokeStyle = '#667788';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
            const x1 = stationX + Math.cos(angle) * innerRadius;
            const y1 = stationY + Math.sin(angle) * innerRadius;
            const x2 = stationX + Math.cos(angle) * outerRadius;
            const y2 = stationY + Math.sin(angle) * outerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Add illuminated windows on the ring
        ctx.fillStyle = '#ffcc66';
        const numWindows = 40;
        for (let i = 0; i < numWindows; i++) {
            const angle = (i / numWindows) * Math.PI * 2;
            const windowRadius = (outerRadius + innerRadius) / 2;
            const windowX = stationX + Math.cos(angle) * windowRadius;
            const windowY = stationY + Math.sin(angle) * windowRadius;

            // Some windows blink
            const blink = Math.sin(time * 2 + i * 0.5) > 0.5 ? 1.0 : 0.4;
            ctx.globalAlpha = blink;

            ctx.beginPath();
            ctx.arc(windowX, windowY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Add navigation lights
        ctx.shadowBlur = 15;

        // Red light (port side - left)
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(stationX - outerRadius, stationY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Green light (starboard side - right)
        ctx.shadowColor = '#00ff00';
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(stationX + outerRadius, stationY, 4, 0, Math.PI * 2);
        ctx.fill();

        // White light (top)
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(stationX, stationY - outerRadius, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Add station name label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(currentPlanet.name + ' Station', stationX, stationY + outerRadius + 25);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}
