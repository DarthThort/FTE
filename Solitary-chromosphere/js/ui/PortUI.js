class PortUI {
    constructor(game, root, uiManager) {
        this.game = game;
        this.root = root;
        this.uiManager = uiManager;
    }

    renderPortUI() {
        this.uiManager.hud.clearUI();
        const container = document.createElement('div');
        container.id = 'port-main-menu';
        container.className = 'screen active';
        container.style.background = 'rgba(0,0,0,0.8)';

        container.innerHTML = `
            <h1>STATION DOCK</h1>
            <div style="display: flex; gap: 20px;">
                <button id="btn-shipyard">SHIPYARD</button>
                <button id="btn-tavern">TAVERN</button>
                <button id="btn-crew">CREW ROSTER</button>
                <button id="btn-contracts">CONTRACTS</button>
                <button id="btn-market" style="border-color: var(--success); color: var(--success);">MARKET</button>
                <button id="btn-undock" style="border-color: var(--warning); color: var(--warning);">UNDOCK</button>
            </div>
        `;

        this.root.appendChild(container);

        document.getElementById('btn-shipyard').onclick = () => this.renderShipyard();
        document.getElementById('btn-tavern').onclick = () => this.renderTavern();
        document.getElementById('btn-crew').onclick = () => this.renderCrewRoster();
        document.getElementById('btn-contracts').onclick = () => this.renderContracts();
        document.getElementById('btn-market').onclick = () => this.renderMarket();
        document.getElementById('btn-undock').onclick = () => {
            this.game.sceneManager.changeScene('SHIP');
        };
    }

    renderShipyard() {
        const ships = this.game.state.port.ships || [];
        const content = `
            <div class="module-grid">
                ${ships.map(ship => `
                    <div class="module-card">
                        <h4 style="color: var(--primary);">${ship.name}</h4>
                        <p style="color: var(--secondary);">${ship.type}</p>
                        <p>${ship.desc}</p>
                        <p>Hull: ${ship.hull} | Slots: ${ship.slots}</p>
                        <button style="margin-top: 10px; width: 100%; font-size: 0.8rem;" onclick="alert('Insufficient Credits!')">Buy ${ship.cost} CR</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.uiManager.createModal('SHIPYARD', content);
    }

    renderTavern() {
        const crew = this.game.state.port.crew || [];
        const content = `
            <div class="module-grid">
                ${crew.map(c => {
            const primarySkill = this.game.state.getRolePrimarySkill(c.role);
            const primaryLevel = c.skills[primarySkill]?.level || 1;

            return `
                    <div class="module-card" style="padding: 15px;">
                        <h4 style="color: var(--secondary); margin-bottom: 5px;">${c.name}</h4>
                        <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 10px;">${c.species} • ${c.gender} • Age ${c.age}</p>
                        <p style="color: #fff; font-weight: bold;">${c.role} • Lvl ${primaryLevel}</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; font-size: 0.8rem;">
                            <div>
                                <span style="color: #888;">Health:</span>
                                <span style="color: var(--success);"> ${c.health}/${c.maxHealth}</span>
                            </div>
                            <div>
                                <span style="color: #888;">Morale:</span>
                                <span style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'};"> ${c.morale}/100</span>
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: #999; margin-bottom: 8px;">
                            ${Object.entries(c.skills).map(([skill, data]) =>
                `${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${data.level}`
            ).join(' • ')}
                        </div>
                        <p class="price">${c.cost} CR</p>
                        <button style="margin-top: 10px; width: 100%; font-size: 0.8rem;" data-crew-id="${c.id}">HIRE</button>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
        this.uiManager.createModal('TAVERN', content);

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
                            <h4 style="color: var(--warning); margin-bottom: 5px;">${c.title} (Diff: ${c.difficulty})</h4>
                            <p>${c.description}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 5px;">${c.reward} CR</p>
                            <button style="font-size: 0.8rem; padding: 5px 15px;" onclick="alert('Contract Accepted!')">ACCEPT</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        this.uiManager.createModal('CONTRACTS', content);
    }

    renderMarket() {
        const state = this.game.state;
        const planet = state.currentPlanet;

        if (!planet || !planet.market) {
            this.uiManager.hud.showNotification('No market available at this location!', 'error');
            return;
        }

        const cargoUsed = state.getCargoUsed();
        const cargoCapacity = state.ship.cargo.capacity;

        const content = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <!-- Market Column -->
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 15px;">COMMODITIES MARKET</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${planet.market.commodities.map(item => {
            const commodity = Economy.getCommodity(item.id);
            const trend = Economy.getTrendSymbol(item.trend);
            const trendColor = item.trend === 'up' ? '#88ff88' : item.trend === 'down' ? '#ff8888' : '#ffaa88';

            return `
                                <div style="background: rgba(255,255,255,0.05); padding: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="font-size: 1.5rem;">${commodity.icon}</span>
                                            <div>
                                                <h4 style="color: ${commodity.color}; margin: 0;">${commodity.name}</h4>
                                                <p style="color: #888; font-size: 0.75rem; margin: 0;">${commodity.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="text-align: right; min-width: 120px;">
                                        <div style="color: var(--primary); font-weight: bold;">
                                            ${item.price} CR <span style="color: ${trendColor};">${trend}</span>
                                        </div>
                                        <div style="color: #888; font-size: 0.75rem;">Stock: ${item.stock}</div>
                                    </div>
                                    <div style="display: flex; gap: 5px; margin-left: 15px;">
                                        <input type="number" min="1" max="${Math.min(item.stock, 10)}" value="1" 
                                               id="qty-${item.id}" 
                                               style="width: 50px; padding: 5px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; text-align: center;">
                                        <button style="padding: 5px 15px; font-size: 0.8rem;" 
                                                onclick="game.ui.buyItem('${item.id}', ${item.price})">BUY</button>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
                
                <!-- Cargo Column -->
                <div>
                    <h3 style="color: var(--success); margin-bottom: 15px;">YOUR CARGO</h3>
                    <div style="background: rgba(0,255,100,0.1); border: 1px solid var(--success); padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Capacity:</span>
                            <span>${cargoUsed}/${cargoCapacity}</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${(cargoUsed / cargoCapacity) * 100}%; height: 100%; background: var(--success); transition: width 0.3s;"></div>
                        </div>
                    </div>
                    
                    ${state.ship.cargo.items.length === 0 ?
                '<p style="color: #888; text-align: center; padding: 20px;">Empty</p>' :
                `<div style="display: flex; flex-direction: column; gap: 8px;">
                            ${state.ship.cargo.items.map(cargoItem => {
                    const commodity = Economy.getCommodity(cargoItem.commodityId);
                    const marketItem = planet.market.commodities.find(m => m.id === cargoItem.commodityId);
                    const currentPrice = marketItem ? marketItem.price : cargoItem.boughtPrice;
                    const profit = Economy.calculateProfit(cargoItem.boughtPrice, currentPrice, cargoItem.quantity);
                    const profitColor = profit >= 0 ? 'var(--success)' : 'var(--danger)';

                    return `
                                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                            <div>
                                                <span style="font-size: 1.2rem;">${commodity.icon}</span>
                                                <strong style="color: ${commodity.color};">${commodity.name}</strong>
                                            </div>
                                            <span style="color: #ccc;">×${cargoItem.quantity}</span>
                                        </div>
                                        <div style="font-size: 0.75rem; color: #888; margin-bottom: 5px;">
                                            Bought: ${cargoItem.boughtPrice} CR → Now: ${currentPrice} CR
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="color: ${profitColor}; font-size: 0.75rem; font-weight: bold;">
                                                ${profit >= 0 ? '+' : ''}${profit} CR
                                            </span>
                                            <button style="padding: 4px 12px; font-size: 0.75rem; background: var(--danger); border-color: var(--danger);" 
                                                    onclick="game.ui.sellItem('${cargoItem.commodityId}', ${currentPrice})">SELL ALL</button>
                                        </div>
                                    </div>
                                `;
                }).join('')}
                        </div>`
            }
                </div>
            </div>
        `;

        this.uiManager.createModal('COMMODITIES MARKET - ' + planet.name.toUpperCase(), content);
    }

    buyItem(commodityId, price) {
        const qtyInput = document.getElementById(`qty-${commodityId}`);
        const quantity = parseInt(qtyInput.value) || 1;

        const result = this.game.state.buyCommodity(commodityId, quantity, price, this.game.state.currentPlanet.id);
        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            this.renderMarket(); // Refresh market
        }
    }

    sellItem(commodityId, price) {
        const cargoItem = this.game.state.ship.cargo.items.find(i => i.commodityId === commodityId);
        if (!cargoItem) return;

        const result = this.game.state.sellCommodity(commodityId, cargoItem.quantity, price);
        this.uiManager.hud.showNotification(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            this.renderMarket(); // Refresh market
        }
    }

    renderCrewRoster() {
        const state = this.game.state;
        const crew = state.ship.crew;

        const content = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                ${crew.map(c => {
            const primarySkill = state.getRolePrimarySkill(c.role);
            const primaryLevel = c.skills[primarySkill]?.level || 1;
            const assignment = state.ship.systems.find(s => s.assignedCrew?.id === c.id);

            return `
                        <div class="crew-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; cursor: pointer;" data-crew-id="${c.id}">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <div>
                                    <h4 style="color: var(--secondary); margin: 0 0 5px 0;">${c.name}</h4>
                                    <p style="color: #aaa; font-size: 0.85rem; margin: 0;">${c.species} • ${c.gender} • Age ${c.age}</p>
                                </div>
                                <span style="color: var(--primary); font-weight: bold; font-size: 1.2rem;">Lvl ${primaryLevel}</span>
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <p style="color: #fff; font-weight: bold; margin-bottom: 5px;">${c.role}</p>
                                ${assignment ? `<p style="color: var(--success); font-size: 0.85rem;">📍 Assigned to ${assignment.name}</p>` : '<p style="color: #888; font-size: 0.85rem;">Idle</p>'}
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-size: 0.85rem;">
                                <div>
                                    <span style="color: #888;">Health:</span>
                                    <span style="color: var(--success);"> ${c.health}/${c.maxHealth}</span>
                                </div>
                                <div>
                                    <span style="color: #888;">Morale:</span>
                                    <span style="color: ${c.morale > 70 ? 'var(--success)' : c.morale > 40 ? 'var(--warning)' : 'var(--danger)'};"> ${c.morale}/100</span>
                                </div>
                            </div>
                            
                            <div style="font-size: 0.75rem; color: #999;">
                                ${Object.entries(c.skills).map(([skill, data]) =>
                `${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${data.level}`
            ).join(' • ')}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        this.uiManager.createModal('CREW ROSTER', content);

        // Add click listeners for crew cards
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
}
