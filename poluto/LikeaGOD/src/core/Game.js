import { TimeSystem } from './TimeSystem.js';
import { EventBus } from './EventBus.js';
import { World } from '../world/World.js';
import { UI } from '../ui/UI.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.eventBus = new EventBus();
        this.timeSystem = new TimeSystem(this.eventBus);
        this.world = new World(this.width, this.height, this.eventBus);
        this.ui = new UI(this.eventBus);

        this.setupGodPowers();

        this.lastTime = 0;
        this.isRunning = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let closest = null;
        let minDist = 20;

        this.world.entities.forEach(entity => {
            if (entity.isDead) return;
            const dx = entity.x - x;
            const dy = entity.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                closest = entity;
            }
        });

        if (closest) {
            this.eventBus.emit('entitySelected', closest);
        } else {
            this.eventBus.emit('entityDeselected');
        }
    }

    setupGodPowers() {
        this.eventBus.on('timeControl', (scale) => {
            if (scale === 0) {
                this.timeSystem.pause();
            } else {
                this.timeSystem.resume();
                this.timeSystem.setSpeed(scale);
            }
        });

        this.eventBus.on('godPower', (data) => {
            this.world.handleGodPower(data);
        });
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
        console.log('Game Started');
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        this.timeSystem.update(deltaTime);

        // Solo actualizar el mundo si no está pausado
        // Aplicar la escala de tiempo al movimiento
        if (!this.timeSystem.isPaused) {
            const scaledDelta = deltaTime * this.timeSystem.timeScale;
            this.world.update(scaledDelta);
        }

        const stats = this.world.getStats();
        this.eventBus.emit('statsUpdate', stats);
    }

    render() {
        // Resetear matriz de transformación para asegurar limpieza total
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Limpiar canvas completamente
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Resetear propiedades
        this.ctx.globalAlpha = 1.0;

        // Fondo
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.world.render(this.ctx);
    }
}
