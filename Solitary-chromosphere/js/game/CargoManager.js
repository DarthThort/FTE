class CargoManager {
    constructor(gameState) {
        this.state = gameState;
    }

    getCargoUsed() {
        let totalVolume = 0;
        this.state.ship.cargo.items.forEach(item => {
            const commodity = Economy.getCommodity(item.commodityId);
            if (commodity) {
                totalVolume += commodity.volume * item.quantity;
            }
        });
        return totalVolume;
    }

    getCargoValue() {
        let totalValue = 0;
        this.state.ship.cargo.items.forEach(item => {
            totalValue += item.boughtPrice * item.quantity;
        });
        return totalValue;
    }

    buyCommodity(commodityId, quantity, price, stationId) {
        const commodity = Economy.getCommodity(commodityId);
        if (!commodity) {
            return { success: false, message: 'Commodity not found.' };
        }

        // Check cargo space
        const volumeNeeded = commodity.volume * quantity;
        const currentVolume = this.getCargoUsed();
        if (currentVolume + volumeNeeded > this.state.ship.cargo.capacity) {
            return { success: false, message: 'Insufficient cargo space.' };
        }

        // Check credits
        const totalCost = price * quantity;
        if (this.state.credits < totalCost) {
            return { success: false, message: 'Insufficient credits.' };
        }

        // Execute purchase
        this.state.credits -= totalCost;

        // Add to cargo
        const existingItem = this.state.ship.cargo.items.find(i => i.commodityId === commodityId && i.boughtPrice === price);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.state.ship.cargo.items.push({
                commodityId,
                quantity,
                boughtPrice: price,
                boughtAt: stationId
            });
        }

        // Update station market
        const planet = this.state.currentPlanet;
        if (planet && planet.market) {
            const marketItem = planet.market.commodities.find(m => m.id === commodityId);
            if (marketItem) {
                marketItem.stock -= quantity;
            }
        }

        this.state.saveGame();
        this.state.notify();
        return { success: true, message: `Purchased ${quantity}x ${commodity.name} for ${totalCost} CR.` };
    }

    sellCommodity(commodityId, quantity, price) {
        const commodity = Economy.getCommodity(commodityId);
        if (!commodity) {
            return { success: false, message: 'Commodity not found.' };
        }

        // Find cargo item
        const cargoItem = this.state.ship.cargo.items.find(i => i.commodityId === commodityId);
        if (!cargoItem || cargoItem.quantity < quantity) {
            return { success: false, message: 'Insufficient quantity in cargo.' };
        }

        // Execute sale
        const totalValue = price * quantity;
        this.state.credits += totalValue;

        // Remove from cargo
        cargoItem.quantity -= quantity;
        if (cargoItem.quantity === 0) {
            const index = this.state.ship.cargo.items.indexOf(cargoItem);
            this.state.ship.cargo.items.splice(index, 1);
        }

        // Update station market
        const planet = this.state.currentPlanet;
        if (planet && planet.market) {
            const marketItem = planet.market.commodities.find(m => m.id === commodityId);
            if (marketItem) {
                marketItem.stock += quantity;
            }
        }

        const profit = Economy.calculateProfit(cargoItem.boughtPrice, price, quantity);
        const profitStr = profit >= 0 ? `+${profit}` : `${profit}`;

        this.state.saveGame();
        this.state.notify();
        return { success: true, message: `Sold ${quantity}x ${commodity.name} for ${totalValue} CR (${profitStr} CR profit).` };
    }
}
