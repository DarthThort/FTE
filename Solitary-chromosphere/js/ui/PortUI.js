/**
 * PortUI.js
 * Holographic Terminal Starport UI with centered sci-fi aesthetic,
 * cyan/navy blue theme, scanner effects, and futuristic controls.
 */

class PortUI {
    constructor(gameEngine, rootElement, uiManager) {
        this.game = gameEngine;
        this.root = rootElement;
        this.uiManager = uiManager || rootElement;
    }

    getCrewColor(role) {
        if (window.game && window.game.sceneManager && window.game.sceneManager.shipRenderer && window.game.sceneManager.shipRenderer.crewUIRenderer) {
            return window.game.sceneManager.shipRenderer.crewUIRenderer.getCrewColor(role);
        }
        return '#00f0ff';
    }

    /**
     * Render Centered Futuristic Holographic Terminal Menu
     */
    renderPortUI() {
        // 1. Check for passengers - show dropoff screen before port menu
        if (this.game.state.passengers > 0) {
            this.handleRefugeeDropoff();
            return;
        }

        // 2. Generate procedural crew for this station if not yet generated
        if (!this.game.state.port.crew || this.game.state.port.crew.length === 0) {
            const crewCount = Math.floor(Math.random() * 6) + 2;
            const proceduralCrew = this.game.state.portGenerator.generateProceduralCrew(
                crewCount,
                this.game.state.currentSystem?.id || 1,
                this.game.state.currentPlanet?.id || 1
            );
            this.game.state.port.crew = proceduralCrew;
        }

        const existing = document.getElementById('port-main-menu');
        if (existing) existing.remove();

        const state = this.game.state;
        const planetName = state.currentPlanet && state.currentPlanet.name ? state.currentPlanet.name.toUpperCase() : 'ESPACIAL';
        const systemName = state.currentSystem && state.currentSystem.name ? state.currentSystem.name.toUpperCase() : 'SOLAR';

        const overlay = document.createElement('div');
        overlay.id = 'port-main-menu';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(3, 10, 24, 0.75); backdrop-filter: blur(8px);
            z-index: 1000; display: flex; align-items: center; justify-content: center;
            font-family: 'Orbitron', var(--font-tech, monospace);
        `;

        overlay.innerHTML = `
            <div style="
                width: 720px; max-width: 92vw;
                background: rgba(8, 20, 42, 0.94);
                border: 2px solid #00f0ff;
                border-radius: 10px;
                padding: 35px 40px;
                box-shadow: 0 0 50px rgba(0, 240, 255, 0.25), inset 0 0 30px rgba(0, 240, 255, 0.08);
                position: relative; overflow: hidden;
            ">
                <!-- Scanline Scan Grid Effect -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.025), rgba(0, 240, 255, 0.025) 1px, transparent 1px, transparent 4px); pointer-events: none;"></div>

                <!-- Reticle Corner Brackets -->
                <div style="position: absolute; top: 12px; left: 12px; border-top: 3px solid #00f0ff; border-left: 3px solid #00f0ff; width: 18px; height: 18px;"></div>
                <div style="position: absolute; top: 12px; right: 12px; border-top: 3px solid #00f0ff; border-right: 3px solid #00f0ff; width: 18px; height: 18px;"></div>
                <div style="position: absolute; bottom: 12px; left: 12px; border-bottom: 3px solid #00f0ff; border-left: 3px solid #00f0ff; width: 18px; height: 18px;"></div>
                <div style="position: absolute; bottom: 12px; right: 12px; border-bottom: 3px solid #00f0ff; border-right: 3px solid #00f0ff; width: 18px; height: 18px;"></div>

                <!-- Terminal Header -->
                <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid rgba(0, 240, 255, 0.3); padding-bottom: 18px;">
                    <div style="color: #00f0ff; font-size: 0.8rem; letter-spacing: 4px; opacity: 0.8; font-weight: 700;">TERMINAL ORBITAL DE MANDO [v4.2]</div>
                    <div style="color: #ffffff; font-size: 1.8rem; font-weight: 900; letter-spacing: 3px; margin-top: 6px; text-shadow: 0 0 15px rgba(0, 240, 255, 0.7);">
                        ESTACIÓN ${planetName}
                    </div>
                    <div style="color: #7dd3fc; font-size: 0.85rem; letter-spacing: 2px; margin-top: 4px;">
                        SISTEMA: ${systemName} • ESTADO: OPERATIVO
                    </div>
                </div>

                <!-- Futuristic Cyan/Navy Button Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;" id="holo-btn-grid">
                    <button class="holo-terminal-btn" id="btn-holo-market" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">MERCADO</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-01]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Comercio de bienes y recursos</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-shipyard" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">ASTILLERO</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-02]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Mejoras y componentes de nave</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-tavern" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">TABERNA</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-03]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Reclutamiento de tripulación</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-crew" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">TRIPULACIÓN</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-04]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Gestión y estado de personal</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-contracts" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">CONTRATOS</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-05]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Misiones comerciales y encargo</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-modules" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">MÓDULOS</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-06]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Instalación de sistemas de nave</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-map" style="padding: 14px 18px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #00f0ff;">MAPA GALÁCTICO</span>
                            <span style="font-size: 0.7rem; color: #38bdf8; font-family: monospace;">[EST-07]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Carta estelar e itinerario</div>
                    </button>

                    <button class="holo-terminal-btn" id="btn-holo-undock" style="padding: 14px 18px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 6px; color: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-family: 'Orbitron', monospace; font-weight: 800; font-size: 0.95rem; letter-spacing: 2px; color: #f87171;">VOLVER A LA NAVE</span>
                            <span style="font-size: 0.7rem; color: #f87171; font-family: monospace;">[SYS-EXIT]</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8; font-family: 'Rajdhani', sans-serif; margin-top: 3px;">Desatraque de puerto espacial</div>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Attach hover effects & click handlers
        const buttons = [
            { id: 'btn-holo-market', action: () => this.renderMarket() },
            { id: 'btn-holo-shipyard', action: () => this.renderShipyard() },
            { id: 'btn-holo-tavern', action: () => this.renderTavern() },
            { id: 'btn-holo-crew', action: () => this.renderCrewRoster() },
            { id: 'btn-holo-contracts', action: () => this.renderContracts() },
            { id: 'btn-holo-modules', action: () => {
                overlay.style.display = 'none';
                if (this.game.ui && this.game.ui.modulesUI) {
                    this.game.ui.modulesUI.show();
                }
            }},
            { id: 'btn-holo-map', action: () => this.uiManager.renderSystemMap() },
            { id: 'btn-holo-undock', action: () => {
                overlay.remove();
                this.game.sceneManager.changeScene('SHIP');
            }}
        ];

        buttons.forEach(b => {
            const btn = document.getElementById(b.id);
            if (!btn) return;

            btn.onmouseover = () => {
                btn.style.background = b.id === 'btn-holo-undock' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 240, 255, 0.2)';
                btn.style.borderColor = b.id === 'btn-holo-undock' ? '#ef4444' : '#00f0ff';
                btn.style.boxShadow = b.id === 'btn-holo-undock' ? '0 0 15px rgba(239, 68, 68, 0.4)' : '0 0 15px rgba(0, 240, 255, 0.4)';
                btn.style.transform = 'translateY(-2px)';
            };

            btn.onmouseout = () => {
                btn.style.background = b.id === 'btn-holo-undock' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 240, 255, 0.05)';
                btn.style.borderColor = b.id === 'btn-holo-undock' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 240, 255, 0.4)';
                btn.style.boxShadow = 'none';
                btn.style.transform = 'none';
            };

            btn.onclick = b.action;
        });
    }

    /**
     * Handle refugee disembarkation when docking with passengers
     */
    handleRefugeeDropoff() {
        const state = this.game.state;
        const passengerCount = state.passengers;
        const rewardPerPassenger = 35;
        const totalReward = passengerCount * rewardPerPassenger;

        const container = document.createElement('div');
        container.id = 'refugee-dropoff';
        container.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(3, 10, 24, 0.95); z-index: 9999;
            display: flex; align-items: center; justify-content: center; flex-direction: column;
            font-family: 'Orbitron', var(--font-tech, monospace);
        `;

        container.innerHTML = `
            <div style="
                max-width: 500px;
                background: rgba(8, 20, 42, 0.95);
                border: 2px solid #00f0ff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 0 50px rgba(0, 240, 255, 0.3);
                text-align: center;
            ">
                <h2 style="color: #00f0ff; margin-bottom: 15px; font-size: 1.6rem; letter-spacing: 2px;">
                    DESEMBARCO DE REFUGIADOS
                </h2>
                <p style="color: #cbd5e1; font-size: 1.05rem; margin-bottom: 25px; line-height: 1.6;">
                    ${passengerCount} refugiado${passengerCount > 1 ? 's' : ''} entregados a salvo en la estación espacial.
                </p>
                <div style="
                    background: rgba(0, 240, 255, 0.1);
                    border: 1.5px solid #00f0ff;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 25px;
                ">
                    <p style="color: #94a3b8; margin-bottom: 6px; font-size: 0.85rem;">RECOMPENSA RECIBIDA</p>
                    <p style="color: #00f0ff; font-size: 2.2rem; font-weight: 900; margin: 0;">
                        +${totalReward} CRÉDITOS
                    </p>
                </div>
                <button id="btn-continue-port" style="
                    width: 100%; padding: 14px; font-size: 1rem;
                    background: #00f0ff; border: none; border-radius: 6px;
                    color: #000; font-weight: 900; cursor: pointer;
                ">
                    CONTINUAR A LA ESTACIÓN
                </button>
            </div>
        `;

        document.body.appendChild(container);

        state.credits += totalReward;
        state.passengers = 0;
        state.saveGame();
        state.notify();

        document.getElementById('btn-continue-port').onclick = () => {
            container.remove();
            this.renderPortUI();
        };
    }

    renderCrewRoster() {
        const state = this.game.state;
        const crew = state.ship.crew || [];

        const content = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; width: 100%; max-height: 70vh; overflow-y: auto;">
                ${crew.length === 0 ? `
                    <p style="color: #94a3b8; padding: 30px; text-align: center; grid-column: 1/-1;">No tienes tripulantes contratados aún. Visita la Taberna en la estación para reclutar.</p>
                ` : crew.map(c => {
                    const primarySkill = state.getRolePrimarySkill(c.role);
                    const primaryLevel = c.skills[primarySkill]?.level || 1;
                    const assignment = state.ship.systems.find(s => s.assignedCrew?.id === c.id);
                    const avatarUrl = window.getCrewAvatarURL ? window.getCrewAvatarURL(c) : '';
                    const roleColor = this.getCrewColor(c.role);

                    return `
                        <div class="crew-card" style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid ${roleColor}; padding: 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s;" data-crew-id="${c.id}">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <img src="${avatarUrl}" style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid ${roleColor}; background: #030712; flex-shrink: 0; box-shadow: 0 0 12px ${roleColor};" />
                                <div>
                                    <h4 style="color: var(--secondary); margin: 0 0 2px 0; font-size: 1rem;">${c.name}</h4>
                                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0;">${c.species} • ${c.gender} • ${c.age}a</p>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                                <span style="color: #fff; font-weight: bold;">${c.role}</span>
                                ${assignment ? `<p style="color: var(--success); font-size: 0.82rem; margin: 4px 0 0 0;">📍 Asignado a: ${assignment.name}</p>` : '<p style="color: #64748b; font-size: 0.82rem; margin: 4px 0 0 0;">En espera / Sin asignar</p>'}
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-size: 0.8rem;">
                                <div>
                                    <span style="color: #64748b;">Salud:</span>
                                    <span style="color: var(--success); font-weight: bold;"> ${c.health}/${c.maxHealth}</span>
                                </div>
                                <div>
                                    <span style="color: #64748b;">Moral:</span>
                                    <span style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; font-weight: bold;"> ${c.morale}/100</span>
                                </div>
                            </div>
                            
                            <div style="font-size: 0.75rem; color: #94a3b8;">
                                ${Object.entries(c.skills).map(([skill, data]) =>
                                    `<span style="display:inline-block; margin-right:6px;">${skill.charAt(0).toUpperCase() + skill.slice(1)}: <b style="color:#fff;">${data.level}</b></span>`
                                ).join(' • ')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.uiManager.createModal('PLANTILLA DE TRIPULACIÓN', content);

        // Click listener for crew detail modal
        setTimeout(() => {
            const crewCards = document.querySelectorAll('.crew-card');
            crewCards.forEach(card => {
                card.onclick = () => {
                    const crewId = parseInt(card.dataset.crewId);
                    this.uiManager.showCrewDetail(crewId);
                };
            });
        }, 100);
    }

    renderShipyard() {
        const state = this.game.state;
        const ship = state.ship;
        const health = ship.health || 0;
        const maxHealth = ship.maxHealth || 100;
        const missingHealth = maxHealth - health;
        const costPerHp = 3; // 3 credits per 1 HP repair
        const repair10Cost = Math.min(missingHealth, 10) * costPerHp;
        const repairFullCost = missingHealth * costPerHp;

        const healthPercent = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)));
        const healthColor = healthPercent > 60 ? '#10b981' : healthPercent > 30 ? '#f59e0b' : '#ef4444';

        const modules = state.port.modules || [];

        const content = `
            <div style="font-family: 'Rajdhani', sans-serif; display: flex; flex-direction: column; gap: 20px; width: 100%; max-height: 75vh; overflow-y: auto; padding-right: 5px;">
                
                <!-- HULL REPAIR BAY SECTION -->
                <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #00f0ff; border-radius: 10px; padding: 20px; box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="font-family: 'Orbitron', sans-serif; color: #00f0ff; margin: 0; font-size: 1.1rem; letter-spacing: 1px;">
                            🛠️ SERVICIO DE REPARACIÓN DE CASCO
                        </h3>
                        <span style="color: #38bdf8; font-weight: bold; font-size: 0.9rem;">
                            CRÉDITOS: <span style="color: #f59e0b;">${state.credits} CR</span>
                        </span>
                    </div>

                    <!-- Health Progress Bar -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem; margin-bottom: 6px;">
                            <span>Integridad del Casco:</span>
                            <span style="color: ${healthColor};">${health} / ${maxHealth} HP (${healthPercent}%)</span>
                        </div>
                        <div style="width: 100%; height: 16px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; overflow: hidden; position: relative;">
                            <div style="width: ${healthPercent}%; height: 100%; background: ${healthColor}; transition: width 0.3s ease; box-shadow: 0 0 10px ${healthColor};"></div>
                        </div>
                    </div>

                    <!-- Repair Buttons Grid -->
                    ${missingHealth === 0 ? `
                        <div style="padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 6px; text-align: center; color: #10b981; font-weight: bold; font-size: 0.95rem;">
                            ✅ EL CASCO ESTÁ AL 100% DE SU CAPACIDAD. NO REQUIERE REPARACIONES.
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <button id="btn-repair-10" style="padding: 12px; background: rgba(0, 240, 255, 0.15); border: 1.5px solid #00f0ff; color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onclick="window.game.ui.portUI.repairShip(10, ${repair10Cost})">
                                REPARAR 10 HP
                                <div style="color: #f59e0b; font-size: 0.8rem; margin-top: 2px;">Coste: ${repair10Cost} CR</div>
                            </button>

                            <button id="btn-repair-full" style="padding: 12px; background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onclick="window.game.ui.portUI.repairShip(${missingHealth}, ${repairFullCost})">
                                REPARACIÓN COMPLETA
                                <div style="color: #f59e0b; font-size: 0.8rem; margin-top: 2px;">Coste: ${repairFullCost} CR</div>
                            </button>
                        </div>
                    `}
                </div>

                <!-- MODULES / COMPONENTS SECTION -->
                <div>
                    <h3 style="font-family: 'Orbitron', sans-serif; color: #00f0ff; margin-bottom: 12px; font-size: 1rem; letter-spacing: 1px;">
                        📦 COMPONENTES Y MEJORAS DE ASTILLERO
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
                        ${modules.length === 0 ? '<p style="color: #888;">No hay componentes en catálogo.</p>' : modules.map(m => `
                            <div class="module-card" style="padding: 14px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <h4 style="color: #38bdf8; margin: 0 0 4px 0; font-size: 0.95rem;">${m.name}</h4>
                                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0 0 10px 0;">${m.description}</p>
                                </div>
                                <div>
                                    <p style="color: #f59e0b; font-weight: bold; margin: 0 0 8px 0; font-size: 0.9rem;">${m.cost} CR</p>
                                    <button style="width: 100%; padding: 6px; background: var(--primary); color: #000; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;" onclick="alert('Componente adquirido')">COMPRAR</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        this.uiManager.createModal('ASTILLERO Y TALLER DE CASCO', content);
    }

    repairShip(amount, cost) {
        const state = this.game.state;
        const ship = state.ship;

        if (ship.health >= ship.maxHealth) {
            this.uiManager.hud.showNotification('¡El casco ya está al 100% de su capacidad!', 'info');
            return;
        }

        if (state.credits < cost) {
            this.uiManager.hud.showNotification(`¡Créditos insuficientes! Se requieren ${cost} CR.`, 'error');
            return;
        }

        // Apply repair & deduct credits
        state.credits -= cost;
        ship.health = Math.min(ship.maxHealth, ship.health + amount);
        state.saveGame();
        state.notify();

        this.uiManager.hud.showNotification(`🔧 Casco reparado en +${amount} HP por ${cost} CR.`, 'success');
        this.renderShipyard(); // Refresh modal UI
    }

    renderTavern() {
        const crew = this.game.state.port.crew || [];
        const content = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; width: 100%; max-height: 70vh; overflow-y: auto; padding-right: 5px;">
                ${crew.map(c => {
                    const primarySkill = this.game.state.getRolePrimarySkill(c.role);
                    const primaryLevel = c.skills[primarySkill]?.level || 1;
                    const avatarUrl = window.getCrewAvatarURL ? window.getCrewAvatarURL(c) : '';
                    const roleColor = this.getCrewColor(c.role);

                    return `
                    <div class="module-card" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <img src="${avatarUrl}" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${roleColor}; background: #030712; flex-shrink: 0; box-shadow: 0 0 10px ${roleColor};" />
                                <div style="overflow: hidden;">
                                    <h4 style="color: var(--secondary); margin: 0 0 2px 0; font-size: 0.95rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${c.name}</h4>
                                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">${c.species} • ${c.gender} • ${c.age}a</p>
                                </div>
                            </div>
                            
                            <div style="color: #ffffff; font-weight: 700; font-size: 0.88rem; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                                ${c.role} <span style="color: var(--primary); font-size: 0.78rem; font-weight: normal;">(Lvl ${primaryLevel})</span>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; font-size: 0.78rem;">
                                <div>
                                    <span style="color: #64748b;">Salud:</span>
                                    <span style="color: var(--success); font-weight: bold;"> ${c.health}/${c.maxHealth}</span>
                                </div>
                                <div>
                                    <span style="color: #64748b;">Moral:</span>
                                    <span style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'}; font-weight: bold;"> ${c.morale}/100</span>
                                </div>
                            </div>

                            <div style="font-size: 0.72rem; color: #94a3b8; margin: 8px 0; line-height: 1.4;">
                                ${Object.entries(c.skills).map(([skill, data]) =>
                                    `<span style="display:inline-block; margin-right:6px;">${skill.charAt(0).toUpperCase() + skill.slice(1)}: <b style="color:#fff;">${data.level}</b></span>`
                                ).join('')}
                            </div>
                        </div>

                        <div>
                            <div style="color: var(--warning); font-weight: 800; font-size: 1.1rem; text-align: right; margin: 10px 0 6px 0;">${c.cost} CR</div>
                            <button style="width: 100%; font-size: 0.85rem; padding: 8px;" data-crew-id="${c.id}">CONTRATAR</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
        this.uiManager.createModal('TABERNA', content);

        // Add event listeners for hire buttons
        const hireButtons = document.querySelectorAll('[data-crew-id]');
        hireButtons.forEach(btn => {
            btn.onclick = () => {
                const crewId = parseInt(btn.dataset.crewId);
                const result = this.game.state.hireCrew(crewId);
                if (result.success) {
                    this.uiManager.hud.showNotification(result.message, 'success');
                    this.renderTavern(); // Refresh tavern
                } else {
                    this.uiManager.hud.showNotification(result.message, 'error');
                }
            };
        });
    }

    renderContracts() {
        const contracts = this.game.state.port.contracts || [];
        const content = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${contracts.map(c => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--warning); margin-bottom: 5px;">${c.title || "Misión Espacial"} (Dif: ${c.difficulty})</h4>
                            <p>${c.description}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 5px;">${c.reward} CR</p>
                            <button style="font-size: 0.8rem; padding: 5px 15px;" onclick="alert('Contract Accepted!')">ACEPTAR</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        this.uiManager.createModal('CONTRATOS', content);
    }

    renderMarket() {
        const state = this.game.state;
        const planet = state.currentPlanet;

        if (!planet || !planet.market) {
            this.uiManager.hud.showNotification('¡No hay mercado disponible en esta ubicación!', 'error');
            return;
        }

        const marketItems = Array.isArray(planet.market)
            ? planet.market
            : (planet.market.commodities || planet.market.items || []);

        const cargoUsed = state.getCargoUsed ? state.getCargoUsed() : (state.ship.cargo.items ? state.ship.cargo.items.reduce((a, b) => a + (b.quantity || 1), 0) : 0);
        const cargoCapacity = state.ship.cargo.capacity || 20;

        const content = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <!-- Market Column -->
                <div>
                    <h3 style="color: var(--secondary); margin-bottom: 10px;">PRODUCTOS EN EL MERCADO</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
                        ${marketItems.length === 0 ? '<p style="color: #888;">No hay productos a la venta.</p>' : marketItems.map(item => {
                            const commodity = (window.Economy && window.Economy.getCommodity) ? window.Economy.getCommodity(item.id) : null;
                            const name = commodity?.name || item.name || item.id.toUpperCase();
                            const price = item.price || commodity?.basePrice || 10;
                            const quantity = item.stock !== undefined ? item.stock : (item.quantity || 0);

                            return `
                                <div style="background: rgba(255,255,255,0.05); padding: 10px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <span style="color: #fff; font-weight: bold;">${name}</span>
                                        <span style="color: #888; font-size: 0.8rem; margin-left: 8px;">(Stock: ${quantity})</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="color: var(--warning); font-weight: bold;">${price} CR</span>
                                        <button style="font-size: 0.75rem; padding: 4px 10px; background: var(--primary); color: #000; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;" onclick="window.game.ui.buyItem('${item.id}', ${price})">COMPRAR</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Cargo Column -->
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 10px;">TU CARGA (${cargoUsed}/${cargoCapacity})</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
                        ${state.ship.cargo.items.length === 0 ? '<p style="color: #666;">Carga vacía</p>' : ''}
                        ${state.ship.cargo.items.map(item => `
                            <div style="background: rgba(0,240,255,0.05); padding: 10px; border: 1px solid rgba(0,240,255,0.2); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="color: #fff; font-weight: bold;">${item.name}</span>
                                    <span style="color: #00f0ff; font-size: 0.8rem; margin-left: 8px;">x${item.quantity}</span>
                                </div>
                                <button style="font-size: 0.75rem; padding: 4px 10px;" onclick="window.game.ui.sellItem('${item.id}', ${item.sellPrice || 10})">VENDER</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        this.uiManager.createModal('MERCADO', content);
    }

    buyItem(commodityId, price) {
        const state = this.game.state;
        const result = state.buyCommodity(commodityId, 1);

        if (result.success) {
            this.uiManager.hud.showNotification(result.message, 'success');
            this.renderMarket(); // Refresh
        } else {
            this.uiManager.hud.showNotification(result.message, 'error');
        }
    }

    sellItem(commodityId, price) {
        const state = this.game.state;
        const result = state.sellCommodity(commodityId, 1);

        if (result.success) {
            this.uiManager.hud.showNotification(result.message, 'success');
            this.renderMarket(); // Refresh
        } else {
            this.uiManager.hud.showNotification(result.message, 'error');
        }
    }
}
