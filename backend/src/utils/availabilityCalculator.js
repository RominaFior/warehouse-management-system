class AvailabilityCalculator {
    /**
     * Calculates the availability of products based on the inventory
     * @param {Array} products - Array of products
     * @param {Array} inventory - Array of inventory items
     * @returns {Array} - Array of available products with their availability information
     */
    static calculateAvailability(products, inventory) {
        const availableProducts = products.map((product) => {
            const { contain_articles } = product;

            let available = true;
            let availableQuantity = Infinity;

            for (const article of contain_articles) {
                const { art_id, amount_of } = article;

                const inventoryArticle = inventory.find((item) => item.art_id === art_id);

                if (!inventoryArticle || inventoryArticle.stock < amount_of) {
                    available = false;
                    break;
                }

                const quantity = Math.floor(inventoryArticle.stock / amount_of);
                if (quantity < availableQuantity) {
                    availableQuantity = quantity;
                }
            }

            if (!available) {
                availableQuantity = 0;
            }

            return {
                name: product.name,
                availableQuantity: availableQuantity,
                price: product.price,
            };
        }).filter((product) => product.availableQuantity !== null);

        return availableProducts;
    }
}

module.exports = AvailabilityCalculator;
