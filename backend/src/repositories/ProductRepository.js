const AvailabilityCalculator = require('../utils/availabilityCalculator');

class ProductRepository {
  constructor(productFilePath, fs) {
    this.productFilePath = productFilePath;
    this.fs = fs;
    this.inventoryRepository = null;
    this.products = [];
    this.cachedAvailability = null;
  }


  /**
   * Sets the inventory repository for the product repository
   * @param {Object} inventoryRepository - The inventory repository instance
   */
  setInventoryRepository(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }


  /**
   * Retrieves all products from the file
   * @returns {Array} - Array of products
   */
  getProducts() {
    const filePath = this.productFilePath;
    const data = this.fs.readFileSync(filePath, 'utf8');
    const { products } = JSON.parse(data);
    return products;
  }


  /**
   * Retrieves all products with availability
   * @returns {Array} - Array of products with availability
   */
  getAllProductsWithAvailability() {
    if (this.cachedAvailability) {
      return this.cachedAvailability;
    }

    const products = this.getProducts();
    const inventory = this.inventoryRepository.getInventory();
    const availableProducts = AvailabilityCalculator.calculateAvailability(products, inventory);

    this.cachedAvailability = availableProducts;

    return availableProducts;
  }


  /**
   * Updates the availability of products based on inventory
   * @param {Array} inventory - Array of inventory items
   */
  updateAvailability(inventory) {
    this.cachedAvailability = AvailabilityCalculator.calculateAvailability(this.getProducts(), inventory);
  }


  /**
   * Sets the products with the provided array
   * @param {Array} products - Array of products
   */
  setProducts(products) {
    const inventory = this.inventoryRepository.getInventory();
    let existingProducts = [];
    let existingProductIndex = -1;
    let data = '';

    if (this.fs.existsSync(this.productFilePath)) {
      data = this.fs.readFileSync(this.productFilePath, 'utf8');
      try {
        existingProducts = JSON.parse(data).products;
        existingProductIndex = existingProducts.findIndex((existingProduct) => existingProduct.name === products[0].name);
      } catch (error) {
        console.log('Error parsing products file:', error);
      }
    }

    if (existingProductIndex !== -1) {
      existingProducts[existingProductIndex] = products[0];
    } else {
      existingProducts.push(...products);
    }

    this.cachedAvailability = AvailabilityCalculator.calculateAvailability(existingProducts, inventory);

    const updatedData = JSON.stringify({ products: existingProducts }, null, 2);
    this.fs.writeFileSync(this.productFilePath, updatedData);
  }


  /**
   * Sells a product and updates the inventory and availability
   * @param {string} productName - Name of the product to sell
   * @param {number} quantity - Quantity to sell
   */
  sellProduct(productName, quantity) {
    const products = this.getProducts();
    const inventory = this.inventoryRepository.getInventory();
    const availableProducts = AvailabilityCalculator.calculateAvailability(products, inventory);

    const product = availableProducts.find((product) => product.name === productName);
    if (!product) {
      throw new Error(`Product "${productName}" not found`);
    }

    if (product.availableQuantity < quantity) {
      throw new Error(`Not enough inventory for product "${productName}"`);
    }

    const productData = products.find((p) => p.name === productName);
    const { contain_articles } = productData;

    this.updateInventory(productName, quantity, contain_articles, inventory, products);
    this.inventoryRepository.saveInventoryDelete(inventory);
  }

  /**
   * Updates the inventory based on the sold product
   * @param {string} productName - Name of the product being sold
   * @param {number} quantity - Quantity being sold
   * @param {Array} articles - Array of articles associated with the product
   * @param {Array} inventory - Array of inventory items
   */
  updateInventory(productName, quantity, articles, inventory, products) {
    let recalculateAvailability = false;

    for (const article of articles) {
      const { art_id, amount_of } = article;
      const inventoryArticle = inventory.find((item) => item.art_id === art_id);

      if (!inventoryArticle || inventoryArticle.stock < amount_of * quantity) {
        throw new Error(`Not enough inventory for product "${productName}"`);
      }

      inventoryArticle.stock -= amount_of * quantity;

      const productUsingArticle = products.find(
        (product) => product.contain_articles.some((article) => article.art_id === art_id)
      );
      if (productUsingArticle) {
        const updatedProduct = [products.find((product) => product.name === productUsingArticle.name)];
        const updatedAvailableQuantity = AvailabilityCalculator.calculateAvailability(updatedProduct, inventory);
        if (updatedProduct.availableQuantity !== updatedAvailableQuantity) {
          updatedProduct.availableQuantity = updatedAvailableQuantity;
          recalculateAvailability = true;
        }
      }
    }

    if (recalculateAvailability) {
      const availableProducts = AvailabilityCalculator.calculateAvailability(products, inventory);
      this.cachedAvailability = JSON.parse(JSON.stringify(availableProducts));
    }
  }
}

module.exports = ProductRepository;
