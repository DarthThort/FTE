// =============================================================================
// GENEALOGY.JS - Family Tree Visualization System
// =============================================================================

class GenealogyTree {
    constructor(game) {
        this.game = game;
        this.panel = document.getElementById('genealogy-panel');
        this.canvas = document.getElementById('genealogy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.closeBtn = document.getElementById('genealogy-close');

        // Tree data
        this.rootCreature = null;
        this.treeData = null;

        // Rendering
        this.nodeWidth = 80;
        this.nodeHeight = 60;
        this.levelHeight = 100;
        this.offsetX = 0;
        this.offsetY = 0;

        // Interaction
        this.hoveredNode = null;
        this.selectedNode = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.hide());

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleMouseMove(x, y);
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleClick(x, y);
        });
    }

    show(creature) {
        this.rootCreature = creature;
        this.buildTree();
        this.panel.style.display = 'block';
        this.resizeCanvas();
        this.render();
    }

    hide() {
        this.panel.style.display = 'none';
        this.rootCreature = null;
        this.treeData = null;
    }

    resizeCanvas() {
        this.canvas.width = this.panel.clientWidth - 40;
        this.canvas.height = this.panel.clientHeight - 80;
    }

    buildTree() {
        // Build family tree structure
        this.treeData = {
            creature: this.rootCreature,
            x: 0,
            y: 0,
            parents: [],
            children: []
        };

        // Find parents (if IDs exist in current population or history)
        const allCreatures = [...this.game.creatures, ...this.game.deadCreatures || []];

        if (this.rootCreature.dna.parentAId) {
            const parentA = allCreatures.find(c => c.id === this.rootCreature.dna.parentAId);
            if (parentA) {
                this.treeData.parents.push({
                    creature: parentA,
                    x: 0,
                    y: 0
                });
            }
        }

        if (this.rootCreature.dna.parentBId) {
            const parentB = allCreatures.find(c => c.id === this.rootCreature.dna.parentBId);
            if (parentB) {
                this.treeData.parents.push({
                    creature: parentB,
                    x: 0,
                    y: 0
                });
            }
        }

        // Find children
        const children = allCreatures.filter(c =>
            c.dna.parentAId === this.rootCreature.id ||
            c.dna.parentBId === this.rootCreature.id
        );

        this.treeData.children = children.map(c => ({
            creature: c,
            x: 0,
            y: 0
        }));

        // Calculate positions
        this.calculatePositions();
    }

    calculatePositions() {
        const centerX = this.canvas.width / 2;

        // Root creature at center
        this.treeData.x = centerX;
        this.treeData.y = this.canvas.height / 2;

        // Parents above
        const parentCount = this.treeData.parents.length;
        if (parentCount > 0) {
            const parentSpacing = this.nodeWidth * 2;
            const parentStartX = centerX - ((parentCount - 1) * parentSpacing) / 2;

            this.treeData.parents.forEach((parent, i) => {
                parent.x = parentStartX + i * parentSpacing;
                parent.y = this.treeData.y - this.levelHeight;
            });
        }

        // Children below
        const childCount = this.treeData.children.length;
        if (childCount > 0) {
            const childSpacing = Math.min(this.nodeWidth * 1.5, (this.canvas.width * 0.8) / childCount);
            const childStartX = centerX - ((childCount - 1) * childSpacing) / 2;

            this.treeData.children.forEach((child, i) => {
                child.x = childStartX + i * childSpacing;
                child.y = this.treeData.y + this.levelHeight;
            });
        }
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#0a0a1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections first (behind nodes)
        this.drawConnections();

        // Draw nodes
        this.drawNode(this.treeData, true); // Root is highlighted

        this.treeData.parents.forEach(parent => this.drawNode(parent, false));
        this.treeData.children.forEach(child => this.drawNode(child, false));

        // Draw info panel
        if (this.hoveredNode) {
            this.drawInfoPanel(this.hoveredNode);
        }
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        this.ctx.lineWidth = 2;

        // Lines from root to parents
        this.treeData.parents.forEach(parent => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.treeData.x, this.treeData.y);
            this.ctx.lineTo(parent.x, parent.y + this.nodeHeight);
            this.ctx.stroke();
        });

        // Lines from root to children
        this.treeData.children.forEach(child => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.treeData.x, this.treeData.y + this.nodeHeight);
            this.ctx.lineTo(child.x, child.y);
            this.ctx.stroke();
        });
    }

    drawNode(node, isRoot) {
        const creature = node.creature;
        const x = node.x;
        const y = node.y;

        // Check if hovered
        const isHovered = this.hoveredNode && this.hoveredNode.creature.id === creature.id;

        // Node background
        const isDead = creature.isDead;
        let bgColor = isRoot ? 'rgba(139, 92, 246, 0.3)' : 'rgba(74, 127, 168, 0.2)';
        if (isDead) bgColor = 'rgba(100, 100, 100, 0.2)';
        if (isHovered) bgColor = 'rgba(139, 92, 246, 0.5)';

        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(x - this.nodeWidth / 2, y, this.nodeWidth, this.nodeHeight);

        // Border
        this.ctx.strokeStyle = isRoot ? '#a855f7' : '#4a7fa8';
        if (isDead) this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = isHovered ? 3 : 1;
        this.ctx.strokeRect(x - this.nodeWidth / 2, y, this.nodeWidth, this.nodeHeight);

        // Creature icon (small version)
        const size = 15;
        const iconX = x;
        const iconY = y + 20;

        this.ctx.save();
        this.ctx.translate(iconX, iconY);

        const color = creature.phenotype.color;
        this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size, size * 0.7, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();

        // Text info
        this.ctx.fillStyle = isDead ? '#999' : '#fff';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.textAlign = 'center';

        // ID
        this.ctx.fillText(creature.id.substring(0, 6), x, y + 40);

        // Generation
        this.ctx.fillStyle = '#a855f7';
        this.ctx.fillText(`Gen ${creature.generation}`, x, y + 52);

        // Dead indicator
        if (isDead) {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.fillText('✝', x + this.nodeWidth / 2 - 8, y + 12);
        }
    }

    drawInfoPanel(node) {
        const creature = node.creature;
        const panelWidth = 200;
        const panelHeight = 180;
        const panelX = 10;
        const panelY = 10;

        // Background
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        this.ctx.strokeStyle = '#a855f7';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Content
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Inter, sans-serif';
        this.ctx.textAlign = 'left';

        let textY = panelY + 20;

        this.ctx.fillText(`ID: ${creature.id.substring(0, 8)}`, panelX + 10, textY);
        textY += 20;

        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillStyle = '#ccc';

        this.ctx.fillText(`Gen: ${creature.generation}`, panelX + 10, textY);
        textY += 18;

        this.ctx.fillText(`Dieta: ${creature.dna.getDietType()}`, panelX + 10, textY);
        textY += 18;

        const status = creature.isDead ? `Muerto (${creature.causeOfDeath})` : `${creature.lifeStage}`;
        this.ctx.fillText(`Estado: ${status}`, panelX + 10, textY);
        textY += 18;

        if (!creature.isDead) {
            this.ctx.fillText(`Edad: ${creature.age.toFixed(1)}s`, panelX + 10, textY);
            textY += 18;

            this.ctx.fillText(`Energía: ${creature.energy.toFixed(0)}%`, panelX + 10, textY);
            textY += 18;
        }

        // Top genes
        this.ctx.fillStyle = '#a855f7';
        this.ctx.fillText('Genes Destacados:', panelX + 10, textY);
        textY += 16;

        this.ctx.fillStyle = '#8be9fd';
        this.ctx.font = '11px Inter, sans-serif';

        const topGenes = Object.entries(creature.dna.genes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        topGenes.forEach(([gene, value]) => {
            const geneName = gene.replace(/_/g, ' ');
            this.ctx.fillText(`${geneName}: ${(value * 100).toFixed(0)}%`, panelX + 10, textY);
            textY += 14;
        });
    }

    handleMouseMove(x, y) {
        let found = null;

        // Check all nodes
        const allNodes = [this.treeData, ...this.treeData.parents, ...this.treeData.children];

        for (let node of allNodes) {
            if (x >= node.x - this.nodeWidth / 2 &&
                x <= node.x + this.nodeWidth / 2 &&
                y >= node.y &&
                y <= node.y + this.nodeHeight) {
                found = node;
                break;
            }
        }

        if (found !== this.hoveredNode) {
            this.hoveredNode = found;
            this.canvas.style.cursor = found ? 'pointer' : 'default';
            this.render();
        }
    }

    handleClick(x, y) {
        if (this.hoveredNode && this.hoveredNode !== this.treeData) {
            // Navigate to this creature's tree
            this.show(this.hoveredNode.creature);
        }
    }
}
