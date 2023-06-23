const AvailabilityCalculator = require('../utils/availabilityCalculator');

class InventoryRepository {
    constructor(inventoryFilePath, fs) {
        this.inventoryFilePath = inventoryFilePath;
        this.fs = fs;
        this.productRepository = null;
    }


    /**
     * Sets the product repository for the inventory repository
     * @param {Object} productRepository - The product repository instance
     */
    setProductRepository(productRepository) {
        this.productRepository = productRepository;
    }

    setFileSystem(fs) {
        this.fs = fs;
    }


    /**
     * Retrieves the inventory data
     * @returns {Array} - Array of inventory items
     */
    getInventory() {
        const data = this.fs.readFileSync(this.inventoryFilePath, 'utf8');
        const { inventory } = JSON.parse(data);

        const inventoryWithNumericStock = inventory.map((item) => ({
            ...item,
            stock: parseInt(item.stock, 10),
        }));

        return inventoryWithNumericStock;
    }


    /**
     * Saves the inventory data
     * @param {Array} newInventory - Array of inventory items
     */
    saveInventory(newInventory) {
        const existingInventory = this.getInventory();

        for (const newItem of newInventory) {
            const existingItemIndex = existingInventory.findIndex((item) => item.art_id === newItem.art_id);

            if (existingItemIndex !== -1) {
                existingInventory[existingItemIndex].stock += parseInt(newItem.stock);
            } else {
                existingInventory.push(newItem);
            }
        }

        const updatedInventory = { inventory: existingInventory };
        const jsonData = JSON.stringify(updatedInventory, null, 2);
        this.fs.writeFileSync(this.inventoryFilePath, jsonData);

        this.productRepository.updateAvailability(existingInventory);
    }


    /**
     * Updates the inventory with new inventory data
     * @param {Array} newInventory - Array of inventory items
     */
    saveInventoryDelete(newInventory) {
        const updatedInventory = { inventory: newInventory };
        const jsonData = JSON.stringify(updatedInventory, null, 2);
        this.fs.writeFileSync(this.inventoryFilePath, jsonData);
    }


    /**
     * Updates the inventory for a sold product
     * @param {Object} product - Product to sell
     * @param {number} quantity - Quantity to sell
     * @throws {Error} - If there is not enough inventory for the product
     */
    updateInventory(product, quantity) {
        const inventory = this.getInventory();
        const updatedInventory = JSON.parse(JSON.stringify(inventory));

        for (const article of product.contain_articles) {
            const { art_id, amount_of } = article;
            const inventoryArticle = updatedInventory.find((item) => item.art_id === art_id);

            if (inventoryArticle) {
                const updatedStock = parseInt(inventoryArticle.stock, 10) - amount_of * quantity;
                inventoryArticle.stock = updatedStock.toString();
            }
        }

        const updatedData = { inventory: updatedInventory };
        const jsonData = JSON.stringify(updatedData, null, 2);
        this.fs.writeFileSync(this.inventoryFilePath, jsonData);
    }


    /**
     * Deletes an inventory item by art_id and quantity
     * @param {string} art_id - ID of the inventory item to delete
     * @param {number} quantity - Quantity of the inventory item to delete
     */
    deleteInventoryItem(art_id, quantity) {
        const filePath = this.inventoryFilePath;
        const data = this.fs.readFileSync(filePath, 'utf8');
        let { inventory } = JSON.parse(data);

        const updatedInventory = inventory.map((item) => {
            if (item.art_id === art_id) {
                const updatedStock = item.stock - quantity;
                return { ...item, stock: updatedStock >= 0 ? updatedStock : 0 };
            }
            return item;
        });

        const updatedData = JSON.stringify({ inventory: updatedInventory }, null, 2);
        this.fs.writeFileSync(filePath, updatedData);

        const products = this.productRepository.getProducts();
        this.updateProductValues(products, updatedInventory);
    }



    /**
     * Updates the product values based on the inventory using the AvailabilityCalculator
     * @param {Array} products - Array of all products
     * @param {Array} inventory - Array of inventory items
     */

    updateProductValues(products, inventory) {
        const availableProducts = AvailabilityCalculator.calculateAvailability(products, inventory);

        for (const product of availableProducts) {
            const { name, availableQuantity } = product;
            const productIndex = products.findIndex((p) => p.name === name);

            if (productIndex !== -1) {
                products[productIndex].availableQuantity = availableQuantity;
            }
        }

        this.productRepository.cachedAvailability = JSON.parse(JSON.stringify(availableProducts));
    }
}

module.exports = InventoryRepository;
