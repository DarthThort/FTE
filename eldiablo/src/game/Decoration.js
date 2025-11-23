class Decoration {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.blocking = true; // Todas las decoraciones bloquean el paso
    }

    draw(renderer, cameraX, cameraY) {
        const pos = renderer.isoToScreen(this.x, this.y, cameraX, cameraY);
        const ctx = renderer.ctx;
        const tw = renderer.tileWidth;
        const th = renderer.tileHeight;

        ctx.save();

        switch (this.type) {
            case 'crate':
                this.drawCrateIso(ctx, pos, tw, th);
                break;
            case 'console':
                this.drawConsoleIso(ctx, pos, tw, th);
                break;
            case 'container':
                this.drawContainerIso(ctx, pos, tw, th);
                break;
            case 'pillar':
                this.drawPillarIso(ctx, pos, tw, th);
                break;
            case 'terminal':
                this.drawTerminalIso(ctx, pos, tw, th);
                break;
        }

        ctx.restore();
    }

    drawCrateIso(ctx, pos, tw, th) {
        // Caja metálica isométrica
        const h = th * 1.5; // Altura de la caja

        // Cara superior (rombo isométrico)
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h);
        ctx.lineTo(pos.x + tw, pos.y - h + th);
        ctx.lineTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x - tw, pos.y - h + th);
        ctx.closePath();
        ctx.fill();

        // Borde superior
        ctx.strokeStyle = '#4a5a6a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cara derecha
        ctx.fillStyle = '#2a3a4a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x + tw, pos.y - h + th);
        ctx.lineTo(pos.x + tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.closePath();
        ctx.fill();

        // Cara izquierda
        ctx.fillStyle = '#1a2a3a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x - tw, pos.y - h + th);
        ctx.lineTo(pos.x - tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.closePath();
        ctx.fill();

        // Símbolo de advertencia en la cara superior
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠', pos.x, pos.y - h + th);
    }

    drawConsoleIso(ctx, pos, tw, th) {
        // Consola de control isométrica
        const h = th * 1.2;

        // Base - cara superior
        ctx.fillStyle = '#2a3545';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h);
        ctx.lineTo(pos.x + tw * 0.8, pos.y - h + th * 0.8);
        ctx.lineTo(pos.x, pos.y - h + th * 1.6);
        ctx.lineTo(pos.x - tw * 0.8, pos.y - h + th * 0.8);
        ctx.closePath();
        ctx.fill();

        // Cara derecha
        ctx.fillStyle = '#1a2535';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 1.6);
        ctx.lineTo(pos.x + tw * 0.8, pos.y - h + th * 0.8);
        ctx.lineTo(pos.x + tw * 0.8, pos.y + th * 0.8);
        ctx.lineTo(pos.x, pos.y + th * 1.6);
        ctx.closePath();
        ctx.fill();

        // Pantalla holográfica
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(pos.x - 25, pos.y - h, 50, 30);

        ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffcc';
        ctx.fillRect(pos.x - 25, pos.y - h, 50, 30);
        ctx.shadowBlur = 0;

        // Botones
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#ff3366' : '#00ff88';
            ctx.fillRect(pos.x - 20 + i * 20, pos.y - h + 35, 12, 8);
        }
    }

    drawContainerIso(ctx, pos, tw, th) {
        // Contenedor grande isométrico
        const h = th * 2;

        // Cara superior
        ctx.fillStyle = '#3a4555';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h);
        ctx.lineTo(pos.x + tw, pos.y - h + th);
        ctx.lineTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x - tw, pos.y - h + th);
        ctx.closePath();
        ctx.fill();

        // Cara derecha
        const gradient1 = ctx.createLinearGradient(pos.x, pos.y - h, pos.x + tw, pos.y);
        gradient1.addColorStop(0, '#2a3545');
        gradient1.addColorStop(1, '#1a2535');
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x + tw, pos.y - h + th);
        ctx.lineTo(pos.x + tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.closePath();
        ctx.fill();

        // Cara izquierda
        const gradient2 = ctx.createLinearGradient(pos.x, pos.y - h, pos.x - tw, pos.y);
        gradient2.addColorStop(0, '#1a2535');
        gradient2.addColorStop(1, '#0a1525');
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 2);
        ctx.lineTo(pos.x - tw, pos.y - h + th);
        ctx.lineTo(pos.x - tw, pos.y + th);
        ctx.lineTo(pos.x, pos.y + th * 2);
        ctx.closePath();
        ctx.fill();

        // Panel de acceso
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
        ctx.fillRect(pos.x + 20, pos.y - 10, 15, 20);
        ctx.shadowBlur = 0;
    }

    drawPillarIso(ctx, pos, tw, th) {
        // Pilar estructural isométrico
        const h = th * 2.5;
        const w = tw * 0.4;

        // Cara superior
        ctx.fillStyle = '#4a5a6a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h);
        ctx.lineTo(pos.x + w, pos.y - h + th * 0.4);
        ctx.lineTo(pos.x, pos.y - h + th * 0.8);
        ctx.lineTo(pos.x - w, pos.y - h + th * 0.4);
        ctx.closePath();
        ctx.fill();

        // Cara derecha
        const gradient1 = ctx.createLinearGradient(pos.x, pos.y - h, pos.x + w, pos.y);
        gradient1.addColorStop(0, '#3a4a5a');
        gradient1.addColorStop(0.5, '#2a3a4a');
        gradient1.addColorStop(1, '#1a2a3a');
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 0.8);
        ctx.lineTo(pos.x + w, pos.y - h + th * 0.4);
        ctx.lineTo(pos.x + w, pos.y + th * 0.4);
        ctx.lineTo(pos.x, pos.y + th * 0.8);
        ctx.closePath();
        ctx.fill();

        // Cara izquierda
        const gradient2 = ctx.createLinearGradient(pos.x, pos.y - h, pos.x - w, pos.y);
        gradient2.addColorStop(0, '#2a3a4a');
        gradient2.addColorStop(0.5, '#1a2a3a');
        gradient2.addColorStop(1, '#0a1a2a');
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 0.8);
        ctx.lineTo(pos.x - w, pos.y - h + th * 0.4);
        ctx.lineTo(pos.x - w, pos.y + th * 0.4);
        ctx.lineTo(pos.x, pos.y + th * 0.8);
        ctx.closePath();
        ctx.fill();

        // Luces indicadoras
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#00ff88' : '#ff3366';
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(pos.x - 5, pos.y - h + 20 + i * 30, 10, 6);
            ctx.shadowBlur = 0;
        }
    }

    drawTerminalIso(ctx, pos, tw, th) {
        // Terminal de pared isométrico
        const h = th * 1.3;
        const w = tw * 0.6;

        // Cara superior
        ctx.fillStyle = '#2a3a4a';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h);
        ctx.lineTo(pos.x + w, pos.y - h + th * 0.6);
        ctx.lineTo(pos.x, pos.y - h + th * 1.2);
        ctx.lineTo(pos.x - w, pos.y - h + th * 0.6);
        ctx.closePath();
        ctx.fill();

        // Cara frontal
        ctx.fillStyle = '#1a2535';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - h + th * 1.2);
        ctx.lineTo(pos.x + w, pos.y - h + th * 0.6);
        ctx.lineTo(pos.x + w, pos.y + th * 0.6);
        ctx.lineTo(pos.x, pos.y + th * 1.2);
        ctx.closePath();
        ctx.fill();

        // Pantalla
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(0, 255, 150, ${pulse})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ff96';
        ctx.fillRect(pos.x - 20, pos.y - h + 15, 40, 25);
        ctx.shadowBlur = 0;

        // Líneas de texto simuladas
        ctx.fillStyle = '#003322';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(pos.x - 15, pos.y - h + 20 + i * 7, 30, 2);
        }
    }

    static getRandomType() {
        const types = ['crate', 'console', 'container', 'pillar', 'terminal'];
        return types[Math.floor(Math.random() * types.length)];
    }
}
