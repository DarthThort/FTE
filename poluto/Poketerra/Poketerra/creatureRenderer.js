// ==========================================
// CREATURE RENDERER - Pixel Art Style
// ==========================================

class CreatureRenderer {
    constructor() {
        this.pixelSize = 2; // Pixel scaling for retro look
    }

    // Render a creature on the canvas based on its genetics
    renderCreature(ctx, creature, x, y, scale = 1) {
        const traits = creature.expressedTraits;
        const size = this.getSizeFromTrait(traits.bodySize) * scale;

        ctx.save();
        ctx.translate(x, y);

        // Apply transparency for camouflaged creatures
        if (creature.stats.camouflage > 0) {
            ctx.globalAlpha = 1 - (creature.stats.camouflage * 0.3);
        }

        // Draw body
        this.drawBody(ctx, traits, size);

        // Draw tail
        this.drawTail(ctx, traits, size);

        // Draw claws
        this.drawClaws(ctx, traits, size);

        // Draw head
        this.drawHead(ctx, traits, size);

        // Draw teeth
        this.drawTeeth(ctx, traits, size);

        // Draw eyes
        this.drawEyes(ctx, size, creature.isWild);

        // Draw status indicators if captured
        if (!creature.isWild) {
            this.drawStatusBar(ctx, creature, size);
        }

        ctx.restore();
    }

    // Get size multiplier from trait
    getSizeFromTrait(sizeType) {
        switch (sizeType) {
            case 'large': return 28;
            case 'medium': return 22;
            case 'small': return 16;
            default: return 22;
        }
    }

    // Draw creature body
    drawBody(ctx, traits, size) {
        const color = traits.colorValue;

        // Body shape (oval)
        ctx.fillStyle = color;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Add texture pattern for mimetic
        if (traits.colorType === 'mimetic') {
            ctx.fillStyle = this.darkenColor(color, 0.2);
            for (let i = 0; i < 5; i++) {
                const px = (Math.random() - 0.5) * size;
                const py = (Math.random() - 0.5) * size * 0.6;
                ctx.fillRect(px, py, 3, 3);
            }
        }
    }

    // Draw tail based on trait
    drawTail(ctx, traits, size) {
        const color = traits.colorValue;
        ctx.fillStyle = this.darkenColor(color, 0.2);
        ctx.strokeStyle = this.darkenColor(color, 0.4);
        ctx.lineWidth = 2;

        ctx.beginPath();
        switch (traits.tail) {
            case 'long':
                // Long curved tail
                ctx.moveTo(-size * 0.8, 0);
                ctx.quadraticCurveTo(-size * 1.2, size * 0.5, -size * 1.5, size * 0.8);
                ctx.lineTo(-size * 1.4, size * 0.7);
                ctx.quadraticCurveTo(-size * 1.1, size * 0.4, -size * 0.8, -0.1);
                break;
            case 'medium':
                // Medium tail
                ctx.moveTo(-size * 0.8, 0);
                ctx.lineTo(-size * 1.2, size * 0.4);
                ctx.lineTo(-size * 1.1, size * 0.3);
                ctx.lineTo(-size * 0.8, -0.1);
                break;
            case 'short':
                // Short stub tail
                ctx.arc(-size * 0.8, 0, size * 0.2, 0, Math.PI * 2);
                break;
        }
        ctx.fill();
        ctx.stroke();
    }

    // Draw claws based on trait
    drawClaws(ctx, traits, size) {
        const color = this.darkenColor(traits.colorValue, 0.4);
        ctx.fillStyle = color;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 1;

        // Front claws
        const clawY = size * 0.4;

        switch (traits.claws) {
            case 'sharp':
                // Sharp pointed claws
                this.drawSharpClaw(ctx, size * 0.3, clawY, size * 0.15);
                this.drawSharpClaw(ctx, size * 0.5, clawY, size * 0.15);
                break;
            case 'hooked':
                // Hooked claws
                this.drawHookedClaw(ctx, size * 0.3, clawY, size * 0.12);
                this.drawHookedClaw(ctx, size * 0.5, clawY, size * 0.12);
                break;
            case 'blunt':
                // Blunt round paws
                ctx.beginPath();
                ctx.arc(size * 0.3, clawY, size * 0.1, 0, Math.PI * 2);
                ctx.arc(size * 0.5, clawY, size * 0.1, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    drawSharpClaw(ctx, x, y, length) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length * 0.3, y + length);
        ctx.lineTo(x - length * 0.3, y + length);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawHookedClaw(ctx, x, y, length) {
        ctx.beginPath();
        ctx.arc(x, y + length * 0.5, length * 0.6, -Math.PI * 0.3, Math.PI * 0.8);
        ctx.stroke();
    }

    // Draw head
    drawHead(ctx, traits, size) {
        const color = traits.colorValue;
        ctx.fillStyle = color;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 2;

        // Head circle
        ctx.beginPath();
        ctx.arc(size * 0.7, -size * 0.1, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.beginPath();
        ctx.moveTo(size * 0.5, -size * 0.4);
        ctx.lineTo(size * 0.4, -size * 0.7);
        ctx.lineTo(size * 0.6, -size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(size * 0.9, -size * 0.4);
        ctx.lineTo(size, -size * 0.7);
        ctx.lineTo(size * 0.8, -size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Draw teeth based on trait
    drawTeeth(ctx, traits, size) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;

        const mouthX = size * 0.9;
        const mouthY = size * 0.1;

        switch (traits.teeth) {
            case 'fangs':
                // Large fangs
                ctx.beginPath();
                ctx.moveTo(mouthX - 3, mouthY);
                ctx.lineTo(mouthX - 5, mouthY + 8);
                ctx.lineTo(mouthX - 1, mouthY + 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(mouthX + 3, mouthY);
                ctx.lineTo(mouthX + 5, mouthY + 8);
                ctx.lineTo(mouthX + 1, mouthY + 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'normal':
                // Normal small teeth
                ctx.fillRect(mouthX - 2, mouthY + 2, 2, 4);
                ctx.fillRect(mouthX + 1, mouthY + 2, 2, 4);
                break;
            case 'small':
                // Tiny teeth
                ctx.fillRect(mouthX - 1, mouthY + 2, 1, 2);
                ctx.fillRect(mouthX + 1, mouthY + 2, 1, 2);
                break;
        }
    }

    // Draw eyes
    drawEyes(ctx, size, isWild) {
        const eyeX1 = size * 0.6;
        const eyeX2 = size * 0.8;
        const eyeY = -size * 0.15;
        const eyeSize = size * 0.1;

        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = isWild ? '#ff4444' : '#333333';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw health/hunger status bars
    drawStatusBar(ctx, creature, size) {
        const barWidth = size * 2;
        const barHeight = 4;
        const barY = -size - 12;

        // Health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = '#ee6055';
        ctx.fillRect(-barWidth / 2, barY, barWidth * (creature.health / 100), barHeight);

        // Hunger bar
        ctx.fillStyle = '#333';
        ctx.fillRect(-barWidth / 2, barY + 6, barWidth, barHeight);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(-barWidth / 2, barY + 6, barWidth * (creature.hunger / 100), barHeight);
    }

    // Helper: Darken a hex color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.floor((num >> 16) * (1 - percent));
        const g = Math.floor(((num >> 8) & 0x00FF) * (1 - percent));
        const b = Math.floor((num & 0x0000FF) * (1 - percent));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
}

// Export renderer instance
const creatureRenderer = new CreatureRenderer();
