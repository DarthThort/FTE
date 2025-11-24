export class UI {
    constructor(eventBus) {
        this.eventBus = eventBus;

        this.dayCounter = document.getElementById('day-counter');
        this.yearCounter = document.getElementById('year-counter');
        this.populationStats = document.getElementById('population-stats');

        this.entityInfo = document.getElementById('entity-info');
        this.entityDetails = document.getElementById('entity-details');
        this.selectedEntity = null;

        this.btnRain = document.getElementById('btn-rain');
        this.btnMeteor = document.getElementById('btn-meteor');
        this.btnPause = document.getElementById('btn-pause');
        this.btnPlay = document.getElementById('btn-play');
        this.btnFast = document.getElementById('btn-fast');

        this.setupListeners();
        this.setupSubscriptions();
    }

    setupListeners() {
        this.btnRain.addEventListener('click', () => this.eventBus.emit('godPower', { type: 'RAIN' }));
        this.btnMeteor.addEventListener('click', () => this.eventBus.emit('godPower', { type: 'METEOR' }));

        this.btnPause.addEventListener('click', () => this.eventBus.emit('timeControl', 0));
        this.btnPlay.addEventListener('click', () => this.eventBus.emit('timeControl', 1));
        this.btnFast.addEventListener('click', () => this.eventBus.emit('timeControl', 10));
    }

    setupSubscriptions() {
        this.eventBus.on('dayChanged', (day) => {
            this.dayCounter.textContent = day;
        });

        this.eventBus.on('yearChanged', (year) => {
            this.yearCounter.textContent = year;
        });

        this.eventBus.on('statsUpdate', (stats) => {
            this.updateStats(stats);
        });

        this.eventBus.on('entitySelected', (entity) => {
            this.showEntityInfo(entity);
        });

        this.eventBus.on('entityDeselected', () => {
            this.hideEntityInfo();
        });
    }

    updateStats(stats) {
        this.populationStats.innerHTML = `
            <p>Plantas: ${stats.plants}</p>
            <p>Criaturas: ${stats.creatures}</p>
            <p>Herbívoros: ${stats.herbivores}</p>
            <p>Carnívoros: ${stats.carnivores}</p>
            <p>Omnívoros: ${stats.omnivores}</p>
        `;

        if (this.selectedEntity && !this.selectedEntity.isDead) {
            this.showEntityInfo(this.selectedEntity);
        } else if (this.selectedEntity && this.selectedEntity.isDead) {
            this.hideEntityInfo();
        }
    }

    showEntityInfo(entity) {
        this.selectedEntity = entity;
        this.entityInfo.style.display = 'block';

        if (entity.type === 'plant') {
            this.entityDetails.innerHTML = `
                <p><strong>Tipo:</strong> Planta</p>
                <p><strong>Edad:</strong> ${Math.floor(entity.age / 1000)}s</p>
                <p><strong>Crecimiento:</strong> ${Math.floor(entity.growth)}%</p>
                <p><strong>Días sin comer:</strong> ${entity.daysSinceLastEaten.toFixed(1)}</p>
                <p><strong>Bioma:</strong> ${entity.biomeType}</p>
            `;
        } else if (entity.type === 'creature') {
            const TraitType = {
                ADAPTABILITY: 'Adaptabilidad',
                ATTACK: 'Ataque',
                DEFENSE: 'Defensa',
                SPEED: 'Velocidad',
                CAMOUFLAGE: 'Camuflaje',
                REPRODUCTION: 'Reproducción',
                LEARNING: 'Aprendizaje'
            };

            const dietName = {
                'Herbivore': 'Herbívoro',
                'Carnivore': 'Carnívoro',
                'Omnivore': 'Omnívoro'
            };

            const genderSymbol = entity.gender === 'Male' ? '♂️' : '♀️';

            let traitsHTML = '';
            for (const [key, value] of Object.entries(entity.genetics.traits)) {
                const traitName = TraitType[key] || key;
                const percentage = Math.floor(value * 100);
                traitsHTML += `<span class="trait">${traitName}: ${percentage}%</span>`;
            }

            const stateNames = {
                'WANDER': 'Vagando',
                'SEEK_FOOD': 'Buscando comida',
                'SEEK_MATE': 'Buscando pareja',
                'FLEE': 'Huyendo'
            };

            this.entityDetails.innerHTML = `
                <p><strong>Tipo:</strong> ${dietName[entity.diet]}</p>
                <p><strong>Demografía:</strong></p>
                <p style="font-size: 11px;">♂ Machos: ${(entity.demographics.maleRatio * 100).toFixed(0)}%</p>
                <p style="font-size: 11px;">♀ Hembras: ${((1 - entity.demographics.maleRatio) * 100).toFixed(0)}%</p>
                <p style="font-size: 11px;">💑 Heterosexuales: ${(entity.demographics.heterosexualRatio * 100).toFixed(0)}%</p>
                <p><strong>Población:</strong> ${entity.populationSize} individuos</p>
                <p><strong>Estado:</strong> ${stateNames[entity.state] || entity.state}</p>
                <p><strong>Comidas hoy:</strong> ${entity.mealsToday}/${entity.dailyMealRequirement}</p>
                <p><strong>Días sin comida:</strong> ${entity.daysWithoutFood.toFixed(1)}</p>
                <p><strong>Bioma actual:</strong> ${entity.currentBiome || '?'}</p>
                <p><strong>Biomas adaptados:</strong></p>
                <p style="font-size: 11px;">${entity.adaptedBiomes.join(', ')}</p>
                <p><strong>Rasgos Genéticos:</strong></p>
                ${traitsHTML}
            `;
        }
    }

    hideEntityInfo() {
        this.selectedEntity = null;
        this.entityInfo.style.display = 'none';
    }
}
