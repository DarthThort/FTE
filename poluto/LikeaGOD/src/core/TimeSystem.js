export class TimeSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.dayDuration = 5000; // 5 seconds per day
        this.accumulatedTime = 0;
        this.day = 0;
        this.year = 0;
        this.timeScale = 1;
        this.isPaused = false;
    }

    update(deltaTime) {
        if (this.isPaused) return;

        this.accumulatedTime += deltaTime * this.timeScale;

        while (this.accumulatedTime >= this.dayDuration) {
            this.accumulatedTime -= this.dayDuration;
            this.advanceDay();
        }
    }

    advanceDay() {
        this.day++;
        if (this.day % 365 === 0) {
            this.year++;
            this.eventBus.emit('yearChanged', this.year);
        }
        this.eventBus.emit('dayChanged', this.day);
    }

    setSpeed(scale) {
        this.timeScale = scale;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }
}
