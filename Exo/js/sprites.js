// =============================================================================
// SPRITES.JS - Procedural Sprite Generation System (Paper Doll Style)
// =============================================================================

class SpriteGenerator {
    constructor() {
        this.cache = new Map();
        this.spriteSize = 48; // Increased resolution for better details
    }

    // Generate a sprite for a creature based on its genes
    getCreatureSprite(creature) {
        // Safety check
        if (!creature || !creature.phenotype || !creature.dna || !creature.dna.genes) {
            return this.createFallbackSprite();
        }

        const key = this.getSpriteKey(creature);

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const sprite = this.generateSprite(creature);
        this.cache.set(key, sprite);
        return sprite;
    }

    getSpriteKey(creature) {
        // Create unique key based on ALL visual genes
        const g = creature.dna.genes;
        // Round genes to reduce cache fragmentation while keeping visual distinctness
        const k = (val) => (val || 0).toFixed(1);

        return `s${k(g.size_gene)}_c${k(g.color_r)}${k(g.color_g)}${k(g.color_b)}_` +
            `l${k(g.limb_type)}_sk${k(g.skin_type)}_d${k(g.diet_type)}_` +
            `v${k(g.vision_range)}_h${k(g.hearing_range)}_` +
            `a${k(g.aggression)}_t${k(g.toxicity)}_b${k(g.bioluminescence)}_` +
            `f${k(g.fire_gland)}_i${k(g.ice_breath)}_p${k(g.poison_spit)}`;
    }

    createFallbackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.spriteSize * 2;
        canvas.height = this.spriteSize * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(this.spriteSize, this.spriteSize, this.spriteSize / 3, 0, Math.PI * 2);
        ctx.fill();
        return canvas;
    }

    generateSprite(creature) {
        const canvas = document.createElement('canvas');
        const size = this.spriteSize;
        canvas.width = size * 2;
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');

        // Center coordinates
        const cx = size;
        const cy = size;

        const genes = creature.dna.genes;
        const scale = 0.5 + (genes.size_gene || 0.5); // 0.5 to 1.5 scale

        // Base colors
        const r = Math.floor((genes.color_r || 0.5) * 255);
        const g = Math.floor((genes.color_g || 0.5) * 255);
        const b = Math.floor((genes.color_b || 0.5) * 255);
        const baseColor = `rgb(${r},${g},${b})`;
        const darkColor = `rgb(${Math.floor(r * 0.7)},${Math.floor(g * 0.7)},${Math.floor(b * 0.7)})`;
        const lr = Math.min(255, Math.floor(r * 1.3));
        const lg = Math.min(255, Math.floor(g * 1.3));
        const lb = Math.min(255, Math.floor(b * 1.3));
        const lightColor = `rgb(${lr},${lg},${lb})`;

        // Body dimensions
        let bodyWidth = 24 * scale;
        let bodyHeight = 16 * scale;

        // Adjust body shape based on diet/type
        if (genes.diet_type > 0.7) { // Carnivore - leaner
            bodyHeight *= 0.8;
            bodyWidth *= 1.1;
        } else if (genes.diet_type < 0.3) { // Herbivore - rounder
            bodyHeight *= 1.2;
            bodyWidth *= 0.9;
        }

        // --- LAYERED RENDERING (PAPER DOLL) ---

        // 1. Auras / Elemental Effects (Back)
        this.drawAura(ctx, cx, cy, bodyWidth, genes);

        // 2. Tail (Back)
        this.drawTail(ctx, cx, cy, bodyWidth, bodyHeight, baseColor, darkColor, genes);

        // 3. Limbs (Far side / Back)
        this.drawLimbs(ctx, cx, cy, bodyWidth, bodyHeight, darkColor, genes, true);

        // 4. Wings (Back wing)
        if (genes.limb_type > 0.6) {
            this.drawWing(ctx, cx, cy, bodyWidth, baseColor, genes, true);
        }

        // 5. Body Base
        this.drawBody(ctx, cx, cy, bodyWidth, bodyHeight, baseColor, darkColor, lightColor, genes);

        // 6. Skin Texture / Patterns
        this.drawSkinPattern(ctx, cx, cy, bodyWidth, bodyHeight, darkColor, lightColor, genes);

        // 7. Head & Neck
        this.drawHead(ctx, cx, cy, bodyWidth, bodyHeight, baseColor, darkColor, genes);

        // 8. Limbs (Near side / Front)
        this.drawLimbs(ctx, cx, cy, bodyWidth, bodyHeight, baseColor, genes, false);

        // 9. Wings (Front wing)
        if (genes.limb_type > 0.6) {
            this.drawWing(ctx, cx, cy, bodyWidth, baseColor, genes, false);
        }

        // 10. Accessories (Spikes, Horns, Fins)
        this.drawAccessories(ctx, cx, cy, bodyWidth, bodyHeight, genes);

        // 11. Bioluminescence / Eyes Glow
        this.drawGlows(ctx, cx, cy, bodyWidth, bodyHeight, genes);

        return canvas;
    }

    drawBody(ctx, x, y, w, h, base, dark, light, genes) {
        ctx.fillStyle = base;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Morph body shape based on limb_type (aquatic vs terrestrial)
        if (genes.limb_type < 0.3) {
            // Aquatic - Fusiform
            ctx.ellipse(x, y, w / 1.8, h / 2.2, 0, 0, Math.PI * 2);
        } else {
            // Terrestrial/Aerial - Oval/Bean
            ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Shading
        const grad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
        grad.addColorStop(0, 'rgba(255,255,255,0.2)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.fill();
    }

    drawSkinPattern(ctx, x, y, w, h, dark, light, genes) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
        ctx.clip();

        const skin = genes.skin_type || 0.5;
        const camo = genes.camouflage || 0;

        if (skin < 0.3) {
            // Scales (Dots/Arcs)
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            for (let i = 0; i < 10; i++) {
                const px = x - w / 2 + Math.random() * w;
                const py = y - h / 2 + Math.random() * h;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (skin > 0.7) {
            // Fur (Noise/Lines)
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 15; i++) {
                const px = x - w / 2 + Math.random() * w;
                const py = y - h / 2 + Math.random() * h;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + 4, py + 2);
                ctx.stroke();
            }
        }

        // Camouflage (Stripes/Spots)
        if (camo > 0.4) {
            ctx.fillStyle = dark;
            ctx.globalAlpha = 0.3;
            if (camo > 0.7) {
                // Stripes
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.ellipse(x - w / 3 + i * (w / 4), y - h / 3, 3, h / 1.5, 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Spots
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(x - w / 2 + Math.random() * w, y - h / 2 + Math.random() * h, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1.0;
        }
        ctx.restore();
    }

    drawHead(ctx, x, y, w, h, base, dark, genes) {
        // Head position relative to body
        const headSize = w * 0.4;
        const neckLen = (genes.diet_type < 0.3) ? 4 : 8; // Herbivores shorter neck
        const headX = x + w / 2 + neckLen;
        const headY = y - h / 3;

        // Neck
        ctx.strokeStyle = base;
        ctx.lineWidth = headSize * 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w / 3, y);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Head Shape
        ctx.fillStyle = base;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        if (genes.diet_type > 0.7) {
            // Carnivore - Angular/Jaw
            ctx.moveTo(headX - headSize / 2, headY - headSize / 3);
            ctx.lineTo(headX + headSize / 2, headY); // Snout tip
            ctx.lineTo(headX - headSize / 3, headY + headSize / 2); // Jaw
            ctx.closePath();
        } else {
            // Herbivore/Omnivore - Rounder
            ctx.arc(headX, headY, headSize / 2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Eyes
        const eyeSize = 2 + (genes.vision_range || 0) * 3;
        const eyeX = headX + 2;
        const eyeY = headY - 3;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        if (genes.diet_type > 0.7) {
            // Slit pupil
            ctx.ellipse(eyeX, eyeY, 1, eyeSize / 1.5, 0, 0, Math.PI * 2);
        } else {
            // Round pupil
            ctx.arc(eyeX, eyeY, eyeSize / 2.5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Ears / Antennae
        if (genes.hearing_range > 0.6) {
            ctx.fillStyle = base;
            ctx.strokeStyle = dark;
            ctx.beginPath();
            ctx.moveTo(headX - 4, headY - 5);
            ctx.lineTo(headX - 8, headY - 12); // Ear tip
            ctx.lineTo(headX, headY - 6);
            ctx.fill();
            ctx.stroke();
        }
    }

    drawLimbs(ctx, x, y, w, h, color, genes, isBack) {
        const type = genes.limb_type || 0.5;
        const legW = 4;
        const legH = 8 + (genes.speed || 0) * 6;
        const offset = isBack ? -2 : 0; // Parallax offset

        ctx.fillStyle = color;

        if (type < 0.3) {
            // AQUATIC - Fins
            const finX = x;
            const finY = y + h / 2;
            ctx.beginPath();
            ctx.moveTo(finX, finY);
            ctx.lineTo(finX - 5, finY + 8);
            ctx.lineTo(finX + 5, finY + 8);
            ctx.fill();
        } else if (type > 0.6) {
            // AERIAL - Bird legs (small)
            const lx1 = x - w / 3 + offset;
            const lx2 = x + w / 3 + offset;
            const ly = y + h / 2 - 2;

            // Leg 1
            ctx.fillRect(lx1, ly, 2, 6);
            // Leg 2
            ctx.fillRect(lx2, ly, 2, 6);
        } else {
            // TERRESTRIAL - Legs
            const lx1 = x - w / 3 + offset;
            const lx2 = x + w / 3 + offset;
            const ly = y + h / 3;

            // Thighs
            ctx.beginPath();
            ctx.ellipse(lx1, ly, 4, 6, 0.2, 0, Math.PI * 2);
            ctx.ellipse(lx2, ly, 4, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // Calves
            ctx.fillRect(lx1 - 1, ly + 4, 3, legH);
            ctx.fillRect(lx2 - 1, ly + 4, 3, legH);
        }
    }

    drawTail(ctx, x, y, w, h, base, dark, genes) {
        const type = genes.limb_type || 0.5;
        const tailX = x - w / 2;
        const tailY = y;

        ctx.fillStyle = base;
        ctx.strokeStyle = dark;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY - 4);

        if (type < 0.3) {
            // Fish tail
            ctx.lineTo(tailX - 12, tailY - 8);
            ctx.lineTo(tailX - 12, tailY + 8);
            ctx.lineTo(tailX, tailY + 4);
        } else if (type > 0.6) {
            // Bird tail (Feathers)
            ctx.lineTo(tailX - 10, tailY - 6);
            ctx.lineTo(tailX - 14, tailY);
            ctx.lineTo(tailX - 10, tailY + 6);
            ctx.lineTo(tailX, tailY + 4);
        } else {
            // Lizard/Mammal tail
            const len = 10 + (genes.speed || 0) * 10;
            ctx.quadraticCurveTo(tailX - len, tailY + 5, tailX - len - 5, tailY - 2);
            ctx.lineTo(tailX, tailY + 4);
        }

        ctx.fill();
        ctx.stroke();
    }

    drawWing(ctx, x, y, w, color, genes, isBack) {
        const wingSize = w * 1.2;
        const wx = x - w / 4;
        const wy = y - w / 3;

        ctx.fillStyle = isBack ? color.replace('rgb', 'rgba').replace(')', ',0.7)') : color;
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';

        ctx.beginPath();
        ctx.moveTo(wx, wy + 5);
        ctx.quadraticCurveTo(wx + wingSize / 2, wy - wingSize / 2, wx + wingSize, wy);
        ctx.quadraticCurveTo(wx + wingSize / 2, wy + wingSize / 3, wx, wy + 5);
        ctx.fill();
        ctx.stroke();
    }

    drawAccessories(ctx, x, y, w, h, genes) {
        // Spikes / Horns
        if ((genes.aggression || 0) > 0.6) {
            // Back spikes
            ctx.fillStyle = '#555';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x - w / 3 + i * 8, y - h / 2);
                ctx.lineTo(x - w / 3 + i * 8 + 4, y - h / 2 - 6);
                ctx.lineTo(x - w / 3 + i * 8 + 8, y - h / 2);
                ctx.fill();
            }
        }

        // Toxic Spikes
        if ((genes.toxicity || 0) > 0.5) {
            ctx.fillStyle = '#a0f';
            ctx.beginPath();
            ctx.moveTo(x, y - h / 2);
            ctx.lineTo(x + 4, y - h / 2 - 8);
            ctx.lineTo(x + 8, y - h / 2);
            ctx.fill();
        }
    }

    drawAura(ctx, x, y, w, genes) {
        const radius = w * 1.5;
        let color = null;

        if ((genes.fire_gland || 0) > 0.5) color = 'rgba(255, 100, 0, 0.2)';
        else if ((genes.ice_breath || 0) > 0.5) color = 'rgba(100, 200, 255, 0.2)';
        else if ((genes.poison_spit || 0) > 0.5) color = 'rgba(100, 255, 50, 0.15)';

        if (color) {
            const grad = ctx.createRadialGradient(x, y, w / 2, x, y, radius);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGlows(ctx, x, y, w, h, genes) {
        // Bioluminescence
        if ((genes.bioluminescence || 0) > 0.4) {
            ctx.fillStyle = 'rgba(100, 255, 200, 0.8)';
            // Spots along body
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(x - w / 3 + i * (w / 3), y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Eye glow (Night vision)
        if ((genes.night_vision || 0) > 0.6) {
            // Calculated roughly where eye is
            const headX = x + w / 2 + ((genes.diet_type < 0.3) ? 4 : 8);
            const headY = y - h / 3;
            const eyeX = headX + 2;
            const eyeY = headY - 3;

            ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    clearCache() {
        this.cache.clear();
    }
}
