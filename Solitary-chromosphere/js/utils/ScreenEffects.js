/**
 * ScreenEffects - Visual effects for combat impact
 */

class ScreenEffects {
    constructor() {
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }

    /**
     * Trigger screen shake
     * @param {number} intensity - Shake magnitude in pixels
     * @param {number} duration - Shake duration in seconds
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Update shake effect
     */
    update(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;

            // Random offset based on intensity
            const progress = 1 - (this.shakeDuration / this.shakeDuration + dt);
            const currentIntensity = this.shakeIntensity * (1 - progress); // Decay

            this.shakeOffset.x = (Math.random() - 0.5) * 2 * currentIntensity;
            this.shakeOffset.y = (Math.random() - 0.5) * 2 * currentIntensity;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }
    }

    /**
     * Get current shake offset
     */
    getOffset() {
        return this.shakeOffset;
    }

    /**
     * Check if currently shaking
     */
    isShaking() {
        return this.shakeDuration > 0;
    }
}
