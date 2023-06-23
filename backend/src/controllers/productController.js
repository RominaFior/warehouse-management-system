const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadDirectory = path.join(__dirname, '..', '..', 'uploads');

class ProductController {
  constructor(productRepository, inventoryRepository) {
    this.productRepository = productRepository;
    this.inventoryRepository = inventoryRepository;
  }

  /**
   * Retrieves all products and their availability from the inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllProducts(req, res) {
    const availableProducts = this.productRepository.getAllProductsWithAvailability();
    res.json(availableProducts);
  }


  /**
   * Sells a product and updates the inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sellProduct(req, res) {
    const productName = req.params.name;
    const quantity = parseInt(req.params.quantity);
  
    try {
      this.productRepository.sellProduct(productName, quantity);
      res.json({ message: 'Product sold successfully' }); 
    } catch (error) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: 'Product not found' }); 
      } else {
        res.status(400).json({ error: 'Invalid quantity' }); 
      }
    }
  }


  /**
   * Uploads the inventory from a JSON file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadInventory(req, res) {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const filePath = path.join(uploadDirectory, req.file.filename);
    const inventoryData = fs.readFileSync(filePath, 'utf8');
    let inventory;

    try {
      inventory = JSON.parse(inventoryData).inventory;
    } catch (error) {
      console.log('Invalid inventory file format');
      return res.status(400).send('Invalid inventory file format');
    }

    inventory = inventory.map((item) => ({
      ...item,
      stock: parseInt(item.stock),
    }));

    try {
      this.inventoryRepository.saveInventory(inventory);
      res.json('Inventory uploaded and updated successfully');
    } catch (error) {
      res.status(500).send('Error occurred while updating inventory');
    }

    fs.unlinkSync(filePath);
  }


  /**
   * Uploads the products from a JSON file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadProducts(req, res) {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const filePath = path.join(uploadDirectory, req.file.filename);
    const productsData = fs.readFileSync(filePath, 'utf8');
    let products;

    try {
      const parsedData = JSON.parse(productsData);
      products = parsedData.products.map((product) => ({
        ...product,
        price: parseFloat(product.price),
      }));
    } catch (error) {
      console.log('Invalid products file format');
      return res.status(400).send('Invalid products file format');
    }

    this.productRepository.setProducts(products);
    res.json(products);
  }


  /**
   * Updates the inventory with new stock quantities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateInventory(req, res) {
    const inventory = req.body;

    try {
      this.inventoryRepository.updateInventory(inventory);
      res.json('Inventory updated successfully');
    } catch (error) {
      res.status(500).send('Error occurred while updating inventory');
    }
  }


  /**
   * Retrieves the current inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInventory(req, res) {
    const inventory = this.inventoryRepository.getInventory();
    res.json(inventory);
  }


  /**
   * Deletes an inventory item by art_id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteInventoryItem(req, res) {
    const { art_id, quantity } = req.params;

    try {
      this.inventoryRepository.deleteInventoryItem(art_id, quantity);
      res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }
}

module.exports = ProductController;
