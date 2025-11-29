// UI.JS - User Interface Management
class UIManager {
    constructor() {
        this.game = null;
        this.epochEl = document.getElementById('epoch');
        this.yearEl = document.getElementById('year');
        this.populationEl = document.getElementById('population');
        this.speciesCountEl = document.getElementById('species-count');
        this.inspectorPanel = document.getElementById('inspector');
        this.creatureIdEl = document.getElementById('creature-id');
        this.creatureAgeEl = document.getElementById('creature-age');
        this.creatureEnergyEl = document.getElementById('creature-energy');
        this.creatureHungerEl = document.getElementById('creature-hunger');
        this.creatureDietEl = document.getElementById('creature-diet');
        this.genomeCanvas = document.getElementById('genome-canvas');
        this.logContent = document.getElementById('log-content');
        this.minimap = document.getElementById('minimap');
        this.gameTime = 0;
        this.selectedCreature = null;
        this.genomeCanvasListenerAdded = false;
        this.genePositions = [];
        this.genealogyBtn = document.getElementById('btn-show-genealogy');
        if (this.genealogyBtn) this.genealogyBtn.addEventListener('click', () => this.showGenealogy());

        // Guardar HTML original del inspector para restaurarlo si es necesario
        this.originalInspectorHTML = this.inspectorPanel.innerHTML;
    }

    setupInspectorElements() {
        // Restaurar HTML original del panel de criatura
        this.inspectorPanel.innerHTML = this.originalInspectorHTML;

        // Re-obtener referencias a los elementos
        this.creatureIdEl = document.getElementById('creature-id');
        this.creatureAgeEl = document.getElementById('creature-age');
        this.creatureEnergyEl = document.getElementById('creature-energy');
        this.creatureHungerEl = document.getElementById('creature-hunger');
        this.creatureDietEl = document.getElementById('creature-diet');
        this.genomeCanvas = document.getElementById('genome-canvas');
        this.genealogyBtn = document.getElementById('btn-show-genealogy');
        if (this.genealogyBtn) this.genealogyBtn.addEventListener('click', () => this.showGenealogy());

        // Resetear flag del listener del canvas
        this.genomeCanvasListenerAdded = false;
    }

    update(gs) {
        this.gameTime = gs.time || 0;
        const y = Math.floor(this.gameTime / 60);
        this.yearEl.textContent = y;
        this.populationEl.textContent = gs.creatures.length;
        this.speciesCountEl.textContent = Math.max(1, Math.floor(gs.creatures.length / 10));
        if (y < 5) this.epochEl.textContent = 'Génesis';
        else if (y < 20) this.epochEl.textContent = 'Paleozoico';
        else if (y < 50) this.epochEl.textContent = 'Mesozoico';
        else this.epochEl.textContent = 'Cenozoico';
        if (gs.dayNightCycle) {
            const ts = gs.dayNightCycle.getTimeString();
            const i = gs.dayNightCycle.isNight() ? '🌙' : '☀️';
            let st = gs.seasonalCycle ? ` ${gs.seasonalCycle.getSeasonEmoji()}` : '';
            this.yearEl.textContent = `${y} (${i} ${ts}${st})`;
        }
        if (this.selectedCreature && !this.selectedCreature.isDead) this.updateInspector(this.selectedCreature);
    }

    selectCreature(c) {
        this.selectedCreature = c;
        this.inspectorPanel.style.display = c ? 'block' : 'none';

        if (c) {
            // Restaurar estructura HTML original del panel de criatura si fue modificada
            if (!document.getElementById('creature-id')) {
                this.setupInspectorElements();
            }
            this.updateInspector(c);
        }
    }

    selectTile(tile) {
        // Cerrar panel de criatura si está abierto
        this.selectedCreature = null;

        // Mostrar panel con info del tile
        this.inspectorPanel.style.display = 'block';

        const plantType = tile.plantDNA.getPlantType();
        const biome = BIOMES[tile.biome];

        this.inspectorPanel.innerHTML = `
            <div class="inspector-header">
                <h3>🌿 Flora: ${biome ? biome.name : tile.biome}</h3>
                <button class="inspector-close" onclick="document.getElementById('inspector').style.display='none'">×</button>
            </div>
            <div class="inspector-content">
                <div class="stat-row">
                    <span>Tipo de Planta:</span>
                    <span>${plantType === 'AQUATIC' ? '🌊 Acuática' : plantType === 'AMPHIBIOUS' ? '🏖️ Anfibia' : '🌳 Terrestre'}</span>
                </div>
                <div class="stat-row">
                    <span>Biomasa:</span>
                    <span>${tile.biomass.toFixed(1)} / ${tile.maxBiomass.toFixed(1)}</span>
                </div>
                <div class="stat-row">
                    <span>Generación:</span>
                    <span>Gen ${tile.plantDNA.generation}</span>
                </div>
                
                <h4>🧬 Genética Vegetal</h4>
                <div class="gene-grid">
                    <div class="gene-bar">
                        <span>💧 Necesidad de Agua</span>
                        <div class="bar"><div class="bar-fill" style="width: ${tile.plantDNA.genes.water_need * 100}%"></div></div>
                        <span>${(tile.plantDNA.genes.water_need * 100).toFixed(0)}%</span>
                    </div>
                    <div class="gene-bar">
                        <span>🔥 Tolerancia al Calor</span>
                        <div class="bar"><div class="bar-fill" style="width: ${tile.plantDNA.genes.heat_tolerance * 100}%"></div></div>
                        <span>${(tile.plantDNA.genes.heat_tolerance * 100).toFixed(0)}%</span>
                    </div>
                    <div class="gene-bar">
                        <span>📈 Velocidad de Crecimiento</span>
                        <div class="bar"><div class="bar-fill" style="width: ${tile.plantDNA.genes.growth_speed * 100}%; background: #10b981;"></div></div>
                        <span>${(tile.plantDNA.genes.growth_speed * 100).toFixed(0)}%</span>
                    </div>
                    <div class="gene-bar">
                        <span>☠️ Toxicidad</span>
                        <div class="bar"><div class="bar-fill" style="width: ${tile.plantDNA.genes.toxicity * 100}%; background: #ef4444;"></div></div>
                        <span>${(tile.plantDNA.genes.toxicity * 100).toFixed(0)}%</span>
                    </div>
                    <div class="gene-bar">
                        <span>🛡️ Defensa (Espinas)</span>
                        <div class="bar"><div class="bar-fill" style="width: ${tile.plantDNA.genes.defense * 100}%; background: #f59e0b;"></div></div>
                        <span>${(tile.plantDNA.genes.defense * 100).toFixed(0)}%</span>
                    </div>
                </div>
                
                <h4>🌱 Presión Evolutiva</h4>
                <div class="stat-row">
                    <span>Presión de Pastoreo:</span>
                    <span style="color: ${tile.plantDNA.grazingPressure > 0.7 ? '#ef4444' : tile.plantDNA.grazingPressure > 0.3 ? '#f59e0b' : '#10b981'}">${(tile.plantDNA.grazingPressure * 100).toFixed(0)}%</span>
                </div>
                ${tile.plantDNA.grazingPressure > 0.7 ? '<p style="color: #ef4444; font-size: 0.85rem; margin-top: 8px;">⚠️ Alta presión! La próxima regeneración mutará para defenderse.</p>' : ''}
            </div>
        `;
    }


    updateInspector(c) {
        this.creatureIdEl.textContent = `${c.id.substring(0, 8)} (Gen ${c.generation})`;
        this.creatureAgeEl.textContent = `${c.age.toFixed(1)}s / ${c.phenotype.maxLifespan.toFixed(0)}s (${c.lifeStage})`;
        this.creatureEnergyEl.textContent = `${c.energy.toFixed(0)}%`;
        this.creatureHungerEl.textContent = `${c.hunger.toFixed(0)}%`;
        this.creatureDietEl.textContent = c.dna.getDietType();
        if (c && c.dna) this.renderGenome(c.dna.genes);
    }

    renderGenome(genes) {
        const canvas = this.genomeCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // Internal resolution
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        const names = {
            size_gene: 'Tamaño', color_r: 'Color Rojo', color_g: 'Color Verde', color_b: 'Color Azul',
            limb_type: 'Tipo Extremidad', skin_type: 'Tipo Piel', diet_type: 'Tipo Dieta', metabolism_speed: 'Metabolismo',
            fertility: 'Fertilidad', aggression: 'Agresividad', social_drive: 'Social', fear_threshold: 'Miedo',
            parental_care: 'Cuidado Parental', vision_range: 'Visión', smell_range: 'Olfato', night_vision: 'Visión Nocturna',
            thermal_vision: 'Térmica', echolocation: 'Ecolocación', camouflage: 'Camuflaje', toxicity: 'Toxicidad',
            regeneration: 'Regeneración', fire_gland: 'Fuego', ice_breath: 'Hielo', poison_spit: 'Veneno',
            bioluminescence: 'Bioluminiscencia', repro_mode: 'Modo Reproducción', sex_chromosome: 'Cromosoma Sexual'
        };

        this.genePositions = [];
        const keys = Object.keys(genes);
        const bw = w / keys.length;

        keys.forEach((k, i) => {
            const v = genes[k];
            const xs = i * bw;
            const xe = (i + 1) * bw;
            const px = Math.floor(xs);
            const pw = Math.ceil(xe) - px;
            const bh = h * v;
            const y = h - bh;

            let c = '#888';
            if (k.includes('color')) c = '#a855f7';
            else if (k.includes('diet') || k.includes('metabolism') || k.includes('fertility')) c = '#14b8a6';
            else if (k.includes('social') || k.includes('aggression') || k.includes('fear') || k.includes('parental')) c = '#f97316';
            else if (k.includes('vision') || k.includes('smell') || k.includes('echolocation')) c = '#eab308';
            else if (k.includes('fire') || k.includes('ice') || k.includes('poison')) c = '#ef4444';
            else if (k === 'toxicity' || k === 'regeneration' || k === 'bioluminescence' || k === 'camouflage') c = '#8b5cf6';
            else if (k.includes('limb') || k.includes('skin') || k.includes('size')) c = '#06b6d4';
            else if (k.includes('sex') || k.includes('repro')) c = '#ec4899';

            ctx.fillStyle = c;
            ctx.fillRect(px, y, pw, bh);
            this.genePositions.push({ key: k, name: names[k] || k, value: v });
        });

        if (!this.genomeCanvasListenerAdded) {
            this.genomeCanvasListenerAdded = true;
            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                // Use VISUAL width (r.width) for calculation, not internal width (w)
                const mx = e.clientX - r.left;
                const visualWidth = r.width;

                // Calculate ratio based on visual dimensions
                const ratio = Math.max(0, Math.min(1, mx / visualWidth));

                // Map ratio to index
                const idx = Math.floor(ratio * this.genePositions.length);

                // Safety clamp
                const safeIdx = Math.min(idx, this.genePositions.length - 1);

                const g = this.genePositions[safeIdx];
                if (g) {
                    this.showGeneTooltip(g, e.clientX, e.clientY);
                    canvas.style.cursor = 'help';
                } else {
                    this.hideGeneTooltip();
                    canvas.style.cursor = 'default';
                }
            });
            canvas.addEventListener('mouseleave', () => this.hideGeneTooltip());
        }
    }

    showGeneTooltip(g, mx, my) {
        let t = document.getElementById('gene-tooltip');
        if (!t) {
            t = document.createElement('div');
            t.id = 'gene-tooltip';
            Object.assign(t.style, {
                position: 'fixed', background: 'rgba(26,26,46,0.98)', border: '2px solid #a855f7',
                borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem',
                pointerEvents: 'none', zIndex: '10000', boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
                fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap'
            });
            document.body.appendChild(t);
        }
        t.innerHTML = `<div style="font-weight:700;color:#a855f7;margin-bottom:4px">${g.name}</div><div style="color:#8be9fd;font-weight:500">Valor: ${(g.value * 100).toFixed(1)}%</div>`;
        t.style.display = 'block';
        t.style.left = (mx + 20) + 'px';
        t.style.top = (my + 15) + 'px';
    }

    hideGeneTooltip() {
        const t = document.getElementById('gene-tooltip');
        if (t) t.style.display = 'none';
    }

    logEvent(msg, type = 'event-birth') {
        const e = document.createElement('div');
        e.className = `log-entry ${type}`;
        e.textContent = `[${Math.floor(this.gameTime)}s] ${msg}`;
        this.logContent.insertBefore(e, this.logContent.firstChild);
        while (this.logContent.children.length > 50) this.logContent.removeChild(this.logContent.lastChild);
    }

    showGenealogy() {
        if (this.selectedCreature && window.game && window.game.genealogy) {
            window.game.genealogy.show(this.selectedCreature);
        }
    }

    // Toggle World Info Panel
    toggleWorldInfo() {
        const panel = document.getElementById('world-info-panel');
        if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            if (isHidden && this.game) this.updateWorldInfoPanel();
        }
    }

    updateWorldInfoPanel() {
        if (!this.game) return;

        // Update biomass
        let totalBiomass = 0;
        for (let r = 0; r < this.game.world.rows; r++) {
            for (let c = 0; c < this.game.world.cols; c++) {
                totalBiomass += this.game.world.tiles[r][c].biomass;
            }
        }
        document.getElementById('world-biomass').textContent = Math.floor(totalBiomass);

        // Update pathogens list
        const list = document.getElementById('active-pathogens-list');
        list.innerHTML = '<h4>Patógenos Activos</h4>';
        if (this.game.pathogenManager && this.game.pathogenManager.activePathogens) {
            this.game.pathogenManager.activePathogens.forEach(p => {
                const div = document.createElement('div');
                div.className = 'stat-row';
                div.innerHTML = `<span class="label">${p.name}</span><span class="value">Infectividad: ${(p.transmissibility * 100).toFixed(0)}%</span>`;
                list.appendChild(div);
            });
        }

        // Copy event log to panel
        const sourceLog = document.getElementById('log-content');
        const targetLog = document.getElementById('world-event-log');
        if (sourceLog && targetLog) {
            targetLog.innerHTML = sourceLog.innerHTML;
        }
    }

    // Toggle Evolution Panel
    toggleEvolutionPanel() {
        const panel = document.getElementById('evolution-panel');
        if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'flex' : 'none';

            if (isHidden && this.game && this.game.statisticsManager) {
                this.renderEvolutionCharts();
                this.setupTabListeners();

                // Setup interval to re-render charts while panel is open
                if (this.chartRenderInterval) {
                    clearInterval(this.chartRenderInterval);
                }
                this.chartRenderInterval = setInterval(() => {
                    if (document.getElementById('evolution-panel').style.display !== 'none') {
                        this.renderEvolutionCharts();
                    } else {
                        clearInterval(this.chartRenderInterval);
                        this.chartRenderInterval = null;
                    }
                }, 2000); // Re-render every 2 seconds
            } else {
                // Panel is closing
                if (this.chartRenderInterval) {
                    clearInterval(this.chartRenderInterval);
                    this.chartRenderInterval = null;
                }
            }
        }
    }

    setupTabListeners() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            };
        });

        const closeBtn = document.getElementById('evolution-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('evolution-panel').style.display = 'none';
            };
        }
    }

    renderEvolutionCharts() {
        document.querySelectorAll('.no-data-overlay').forEach(el => el.remove());

        if (!this.game || !this.game.statisticsManager) {
            this.showNoDataMessage('Inicializando sistema de estadísticas...');
            return;
        }

        const history = this.game.statisticsManager.getHistory();
        console.log('[Panel E] Rendering charts. History length:', history.length);

        if (history.length < 2) {
            this.showNoDataMessage('⏳ Recopilando datos evolutivos... Espera unos segundos.');
            return;
        }

        // Remove overlay message if present
        const overlay = document.querySelector('.no-data-overlay');
        if (overlay) overlay.remove();

        console.log('[Panel E] Rendering creature chart...');
        // Render Creatures Chart
        this.renderLineChart(
            document.getElementById('creature-evolution-chart'),
            history,
            'creatures',
            document.getElementById('creature-legend')
        );

        console.log('[Panel E] Rendering plant chart...');
        // Render Plants Chart
        this.renderLineChart(
            document.getElementById('plant-evolution-chart'),
            history,
            'plants',
            document.getElementById('plant-legend')
        );

        console.log('[Panel E] Rendering pathogen stats...');
        // Render Pathogens Stats
        this.renderPathogenStats();
        console.log('[Panel E] Charts rendered successfully');
    }

    showNoDataMessage(message) {
        // Remove any existing message
        const existingMsg = document.querySelector('.no-data-overlay');
        if (existingMsg) existingMsg.remove();

        // Create overlay message without destroying canvas
        const overlay = document.createElement('div');
        overlay.className = 'no-data-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(20,20,40,0.9);color:var(--text-dim);font-size:1.1rem;z-index:10;border-radius:8px;';
        overlay.textContent = message;

        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.style.position = 'relative';
            activeTab.appendChild(overlay);
        }
    }

    renderLineChart(canvas, history, dataKey, legendContainer) {
        console.log(`[renderLineChart] Called for ${dataKey}, canvas:`, canvas, 'history length:', history?.length);

        if (!canvas) {
            console.error('[renderLineChart] Canvas is null!');
            return;
        }

        if (!history || history.length < 2) {
            console.warn('[renderLineChart] Insufficient history data');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[renderLineChart] Could not get 2d context!');
            return;
        }

        // Set canvas dimensions
        const parent = canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;

        console.log(`[renderLineChart] Parent dimensions: ${width}x${height}`);

        canvas.width = width;
        canvas.height = height;

        // Clear canvas - CRITICAL
        ctx.clearRect(0, 0, width, height);

        // Fill background for visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);

        // Collect all species/keys
        const speciesData = {};
        history.forEach(snap => {
            if (snap[dataKey]) {
                Object.entries(snap[dataKey]).forEach(([species, data]) => {
                    if (!speciesData[species]) {
                        speciesData[species] = [];
                    }
                    const count = typeof data === 'object' ? (data.count || 0) : data;
                    speciesData[species].push(count);
                });
            }
        });

        const speciesNames = Object.keys(speciesData);
        console.log(`[renderLineChart] Found ${speciesNames.length} species:`, speciesNames);

        if (speciesNames.length === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '16px Inter';
            ctx.fillText('No data to display', width / 2 - 50, height / 2);
            return;
        }

        // Find max value
        let maxVal = 1;
        Object.values(speciesData).forEach(values => {
            const localMax = Math.max(...values);
            if (localMax > maxVal) maxVal = localMax;
        });

        console.log(`[renderLineChart] Max value: ${maxVal}`);

        // Draw axes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, height - 40);
        ctx.lineTo(width - 20, height - 40);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = 20 + (i / 4) * (height - 60);
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }

        // Clear legend
        if (legendContainer) {
            legendContainer.innerHTML = '';
        }

        // Draw lines for each species
        speciesNames.forEach((species, index) => {
            const hue = (index * 137) % 360;
            const color = `hsl(${hue}, 70%, 60%)`;

            const values = speciesData[species];

            console.log(`[renderLineChart] Drawing ${species} with ${values.length} points, color: ${color}`);

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            values.forEach((val, i) => {
                const x = 50 + (i / (values.length - 1)) * (width - 70);
                const y = (height - 40) - (val / maxVal) * (height - 60);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            ctx.fillStyle = color;
            values.forEach((val, i) => {
                const x = 50 + (i / (values.length - 1)) * (width - 70);
                const y = (height - 40) - (val / maxVal) * (height - 60);
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Add to legend
            if (legendContainer) {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;align-items:center;gap:8px;margin:4px 0;';
                item.innerHTML = `<div style="width:20px;height:3px;background:${color}"></div><span style="color:#fff;font-size:0.9rem">${species}</span>`;
                legendContainer.appendChild(item);
            }
        });

        console.log(`[renderLineChart] Completed rendering ${dataKey}`);
    }

    renderPathogenStats() {
        if (!this.game || !this.game.statisticsManager) return;

        const container = document.getElementById('pathogen-stats-container');
        if (!container) return;

        const stats = this.game.statisticsManager.getPathogenStats();

        container.innerHTML = '';
        if (stats.length === 0) {
            container.innerHTML = '<p>No hay patógenos registrados.</p>';
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.innerHTML = `
            <thead>
                <tr style="border-bottom: 1px solid #666;">
                    <th style="text-align:left; padding:5px;">Nombre</th>
                    <th style="padding:5px;">Infectividad</th>
                    <th style="padding:5px;">Mortalidad</th>
                    <th style="padding:5px;">Infectados</th>
                </tr>
            </thead>
            <tbody>
                ${stats.map(p => `
                    <tr style="background: rgba(255,255,255,0.05);">
                        <td style="padding:5px;">${p.name}</td>
                        <td style="padding:5px; text-align:center;">${(p.infectivity * 100).toFixed(1)}%</td>
                        <td style="padding:5px; text-align:center;">${(p.lethality * 100).toFixed(1)}%</td>
                        <td style="padding:5px; text-align:center;">${p.infectedCount}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(table);
    }
}
