class PowerUI {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
    }

    // Render power management panel in ship view
    renderPowerPanel() {
        const state = this.game.state;
        const powerDist = state.powerManager.getPowerDistribution();

        const content = `
            <div id="power-panel" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid var(--primary);
                border-radius: 8px;
                padding: 15px;
                min-width: 300px;
                font-family: var(--font-tech);
                z-index: 100;
            ">
                <h3 style="margin: 0 0 15px 0; color: var(--primary); text-transform: uppercase; border-bottom: 1px solid var(--primary); padding-bottom: 8px;">
                    ⚡ REACTOR POWER
                </h3>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="color: #aaa;">Available:</span>
                        <span style="color: var(--primary); font-weight: bold;">${powerDist.availablePower}/${powerDist.maxPower}</span>
                    </div>
                    <div style="display: flex; gap: 4px;">
                        ${this.renderPowerBar(powerDist.usedPower, powerDist.maxPower)}
                    </div>
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--secondary); font-size: 0.9rem;">SYSTEMS</h4>
                    ${state.ship.systems.map(sys => this.renderSystemPowerRow(sys)).join('')}
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-top: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--warning); font-size: 0.9rem;">SHIELDS</h4>
                    ${this.renderShieldStatus()}
                </div>
            </div>
        `;

        return content;
    }

    renderPowerBar(used, max) {
        let bars = '';
        for (let i = 0; i < max; i++) {
            const filled = i < used;
            bars += `<div style="
                width: 20px;
                height: 20px;
                background: ${filled ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                border: 1px solid ${filled ? 'var(--primary)' : 'rgba(255,255,255,0.3)'};
                border-radius: 3px;
                box-shadow: ${filled ? '0 0 8px var(--primary)' : 'none'};
            "></div>`;
        }
        return bars;
    }

    renderSystemPowerRow(system) {
        const status = this.game.state.powerManager.getSystemStatus(system.id);
        const healthColor = status.health > 70 ? '#00ff55' : status.health > 30 ? '#ffaa00' : '#ff0055';
        const offline = status.offline ? ' (OFFLINE)' : '';
        const ionized = status.ionized ? ' ⚡' : '';

        return `
            <div style="
                margin-bottom: 12px;
                padding: 8px;
                background: rgba(0,0,0,0.3);
                border-radius: 4px;
                border-left: 3px solid ${system.color};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #fff; font-size: 0.85rem; font-weight: 500;">
                        ${system.name}${offline}${ionized}
                    </span>
                    <span style="color: ${healthColor}; font-size: 0.75rem;">
                        ${Math.round(status.health)}% HP
                    </span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button 
                        class="power-btn-minus" 
                        data-system-id="${system.id}"
                        style="
                            width: 24px;
                            height: 24px;
                            background: rgba(255,0,85,0.2);
                            border: 1px solid #ff0055;
                            color: #ff0055;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 16px;
                            line-height: 1;
                            padding: 0;
                        "
                        ${status.currentPower === 0 ? 'disabled' : ''}
                    >-</button>
                    
                    <div style="display: flex; gap: 3px; flex: 1;">
                        ${this.renderSystemPowerBars(status.currentPower, status.maxPower)}
                    </div>
                    
                    <button 
                        class="power-btn-plus" 
                        data-system-id="${system.id}"
                        style="
                            width: 24px;
                            height: 24px;
                            background: rgba(0,240,255,0.2);
                            border: 1px solid var(--primary);
                            color: var(--primary);
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 16px;
                            line-height: 1;
                            padding: 0;
                        "
                        ${status.currentPower >= status.maxPower ? 'disabled' : ''}
                    >+</button>
                    
                    <span style="color: #aaa; font-size: 0.75rem; min-width: 35px; text-align: right;">
                        ${status.currentPower}/${status.maxPower}
                    </span>
                </div>
                
                ${status.effectiveness < 1.0 ? `
                    <div style="margin-top: 4px; font-size: 0.7rem; color: #ffaa00;">
                        Efficiency: ${Math.round(status.effectiveness * 100)}%
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderSystemPowerBars(current, max) {
        let bars = '';
        for (let i = 0; i < max; i++) {
            const filled = i < current;
            bars += `<div style="
                flex: 1;
                height: 16px;
                background: ${filled ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};
                border: 1px solid ${filled ? 'var(--primary)' : 'rgba(255,255,255,0.2)'};
                border-radius: 2px;
                box-shadow: ${filled ? '0 0 6px var(--primary)' : 'none'};
                transition: all 0.2s;
            "></div>`;
        }
        return bars;
    }

    renderShieldStatus() {
        const shields = this.game.state.ship.shields;
        let layers = '';

        for (let i = 0; i < shields.maxLayers; i++) {
            const active = i < shields.currentLayers;
            layers += `<div style="
                width: 30px;
                height: 30px;
                border: 2px solid ${active ? '#00ff55' : 'rgba(255,255,255,0.2)'};
                border-radius: 50%;
                background: ${active ? 'rgba(0,255,85,0.2)' : 'transparent'};
                box-shadow: ${active ? '0 0 10px #00ff55' : 'none'};
            "></div>`;
        }

        return `
            <div style="display: flex; gap: 8px; align-items: center;">
                ${layers}
                <span style="color: #aaa; font-size: 0.85rem; margin-left: 8px;">
                    ${shields.currentLayers}/${shields.maxLayers} Layers
                </span>
            </div>
            ${shields.rechargeTimer > 0 ? `
                <div style="margin-top: 8px; font-size: 0.75rem; color: var(--secondary);">
                    Recharging in ${shields.rechargeTimer.toFixed(1)}s
                </div>
            ` : ''}
        `;
    }

    // Render room status overlays on ship grid
    renderRoomOverlays(ctx, layout, offsetX, offsetY, cellSize) {
        const rooms = this.game.state.ship.rooms;
        if (!rooms) return;

        rooms.forEach(room => {
            this.renderRoomOverlay(ctx, room, offsetX, offsetY, cellSize);
        });
    }

    renderRoomOverlay(ctx, room, offsetX, offsetY, cellSize) {
        // Draw O2 level as background tint
        if (room.oxygen < 100) {
            const alpha = 1 - (room.oxygen / 100);
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;

            room.tiles.forEach(([x, y]) => {
                ctx.fillRect(
                    offsetX + x * cellSize,
                    offsetY + y * cellSize,
                    cellSize,
                    cellSize
                );
            });
        }

        // Draw fire
        if (room.onFire) {
            const intensity = room.fireIntensity / 100;
            ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + intensity * 0.4})`;

            room.tiles.forEach(([x, y]) => {
                ctx.fillRect(
                    offsetX + x * cellSize,
                    offsetY + y * cellSize,
                    cellSize,
                    cellSize
                );
            });

            // Fire icon
            const centerTile = room.tiles[Math.floor(room.tiles.length / 2)];
            ctx.fillStyle = '#ff6600';
            ctx.font = '20px Arial';
            ctx.fillText('🔥',
                offsetX + centerTile[0] * cellSize + cellSize / 4,
                offsetY + centerTile[1] * cellSize + cellSize / 1.5
            );
        }

        // Draw breach
        if (room.breached) {
            const centerTile = room.tiles[Math.floor(room.tiles.length / 2)];
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('⚠',
                offsetX + centerTile[0] * cellSize + cellSize / 4,
                offsetY + centerTile[1] * cellSize + cellSize / 1.5
            );
        }

        // O2 text indicators removed - now using visual oxygen bars in ShipRenderer
        /*
        const centerTile = room.tiles[Math.floor(room.tiles.length / 2)];
        const o2Color = room.oxygen > 50 ? '#00ff55' : room.oxygen > 20 ? '#ffaa00' : '#ff0055';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            offsetX + centerTile[0] * cellSize + 2,
            offsetY + centerTile[1] * cellSize + 2,
            cellSize - 4,
            16
        );

        ctx.fillStyle = o2Color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            `O2: ${Math.round(room.oxygen)}%`,
            offsetX + centerTile[0] * cellSize + cellSize / 2,
            offsetY + centerTile[1] * cellSize + 13
        );
        ctx.textAlign = 'left';
        */
    }

    // Render door controls panel - SIMPLIFIED VERSION
    renderDoorPanel() {
        const content = `
            <div id="door-panel" style="
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid var(--secondary);
                border-radius: 8px;
                padding: 15px;
                min-width: 200px;
                font-family: var(--font-tech);
                z-index: 100;
            ">
                <h3 style="margin: 0 0 15px 0; color: var(--secondary); text-transform: uppercase; border-bottom: 1px solid var(--secondary); padding-bottom: 8px; font-size: 0.9rem;">
                    🚪 DOOR CONTROLS
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button id="btn-open-all-doors" style="
                        padding: 10px; 
                        font-size: 0.85rem; 
                        background: rgba(0,255,85,0.2); 
                        border: 1px solid #00ff55; 
                        color: #00ff55;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                    ">
                        ▶ OPEN ALL DOORS
                    </button>
                    <button id="btn-close-all-doors" style="
                        padding: 10px; 
                        font-size: 0.85rem; 
                        background: rgba(255,0,85,0.2); 
                        border: 1px solid #ff0055; 
                        color: #ff0055;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: var(--font-tech);
                    ">
                        ◀ CLOSE ALL DOORS
                    </button>
                </div>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; color: #888; text-align: center;">
                    Controls all ship doors
                </div>
            </div>
        `;

        return content;
    }

    // Attach event listeners for power controls
    attachPowerEventListeners() {
        // Power + buttons
        document.querySelectorAll('.power-btn-plus').forEach(btn => {
            btn.onclick = () => {
                const systemId = btn.dataset.systemId;
                const success = this.game.state.powerManager.addPower(systemId);
                if (success) {
                    this.refreshPowerPanel();
                }
            };
        });

        // Power - buttons
        document.querySelectorAll('.power-btn-minus').forEach(btn => {
            btn.onclick = () => {
                const systemId = btn.dataset.systemId;
                const success = this.game.state.powerManager.removePower(systemId);
                if (success) {
                    this.refreshPowerPanel();
                }
            };
        });
    }

    // Attach event listeners for door controls - SIMPLIFIED VERSION
    attachDoorEventListeners() {
        // Open all doors
        const btnOpenAll = document.getElementById('btn-open-all-doors');
        if (btnOpenAll) {
            btnOpenAll.onclick = () => {
                this.game.state.lifeSupportManager.openAllDoors();
            };
        }

        // Close all doors
        const btnCloseAll = document.getElementById('btn-close-all-doors');
        if (btnCloseAll) {
            btnCloseAll.onclick = () => {
                this.game.state.lifeSupportManager.closeAllDoors();
            };
        }
    }

    // Refresh panels
    refreshPowerPanel() {
        const panel = document.getElementById('power-panel');
        if (panel) {
            const newContent = this.renderPowerPanel();
            const temp = document.createElement('div');
            temp.innerHTML = newContent;
            panel.replaceWith(temp.firstElementChild);
            this.attachPowerEventListeners();
        }
    }
}
