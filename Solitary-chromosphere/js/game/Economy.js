// Economy System - Commodity Trading and Market Generation
class Economy {
    // Define all tradeable commodities
    static COMMODITIES = [
        { id: 'food', name: 'Food Rations', basePrice: 10, volume: 1, category: 'Essential', color: '#88cc88', icon: '🍱' },
        { id: 'medical', name: 'Medical Supplies', basePrice: 50, volume: 1, category: 'Essential', color: '#ff8888', icon: '💊' },
        { id: 'electronics', name: 'Electronics', basePrice: 80, volume: 1, category: 'Tech', color: '#88ccff', icon: '💻' },
        { id: 'minerals', name: 'Rare Minerals', basePrice: 120, volume: 2, category: 'Raw', color: '#cc88ff', icon: '💎' },
        { id: 'luxury', name: 'Luxury Goods', basePrice: 200, volume: 1, category: 'Luxury', color: '#ffcc88', icon: '👑' },
        { id: 'parts', name: 'Industrial Parts', basePrice: 60, volume: 2, category: 'Industrial', color: '#aaaaaa', icon: '⚙️' },
        { id: 'weapons', name: 'Weapons', basePrice: 150, volume: 1, category: 'Military', color: '#ff4444', icon: '🔫' },
        { id: 'textiles', name: 'Textiles', basePrice: 30, volume: 1, category: 'Consumer', color: '#ffaaff', icon: '🧵' },
        { id: 'chemicals', name: 'Chemicals', basePrice: 90, volume: 1, category: 'Industrial', color: '#aaff88', icon: '⚗️' },
        { id: 'fuel', name: 'Fuel Cells', basePrice: 5, volume: 1, category: 'Essential', color: '#ffaa44', icon: '⛽' }
    ];

    // Simple hash function for seeded randomness
    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Seeded random number generator
    static seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Get commodity by ID
    static getCommodity(id) {
        return this.COMMODITIES.find(c => c.id === id);
    }

    // Generate market for a specific station
    static generateStationMarket(stationId, systemId) {
        const seed = this.hash(stationId + systemId);
        const market = {
            stationId,
            commodities: [],
            lastUpdated: Date.now()
        };

        this.COMMODITIES.forEach((commodity, index) => {
            const itemSeed = seed + index;

            // Calculate price with system and station variance
            const systemVariance = (this.seededRandom(this.hash(systemId) + index) - 0.5) * 0.4; // ±20%
            const stationVariance = (this.seededRandom(itemSeed) - 0.5) * 0.2; // ±10%
            const totalVariance = 1 + systemVariance + stationVariance;
            const price = Math.round(commodity.basePrice * totalVariance);

            // Generate stock level (between 10 and 100)
            const stockSeed = itemSeed * 7;
            const stock = Math.floor(this.seededRandom(stockSeed) * 90) + 10;

            market.commodities.push({
                id: commodity.id,
                stock: stock,
                price: price,
                trend: this.calculateTrend(itemSeed)
            });
        });

        return market;
    }

    // Calculate price trend indicator
    static calculateTrend(seed) {
        const rand = this.seededRandom(seed * 13);
        if (rand < 0.3) return 'down';
        if (rand > 0.7) return 'up';
        return 'stable';
    }

    // Get trend symbol
    static getTrendSymbol(trend) {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    }

    // Calculate profit/loss for a cargo item
    static calculateProfit(boughtPrice, currentPrice, quantity) {
        return (currentPrice - boughtPrice) * quantity;
    }
}
