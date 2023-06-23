const fs = require('fs');
const ProductController = require('../../src/controllers/productController');

describe('ProductController', () => {
    let productRepository;
    let inventoryRepository;
    let productController;
    let req;
    let res;

    beforeEach(() => {
        req = {};
        res = {
            json: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        productRepository = {
            getAllProductsWithAvailability: jest.fn(),
            sellProduct: jest.fn(),
            setProducts: jest.fn(),
        };

        inventoryRepository = {
            saveInventory: jest.fn(),
            updateInventory: jest.fn(),
            getInventory: jest.fn(),
            deleteInventoryItem: jest.fn(),
        };
        productController = new ProductController(productRepository, inventoryRepository);
        productController.fs = fs;
    });

    describe('getAllProducts', () => {
        test('should retrieve all products with availability', () => {
            const availableProducts = [
                { name: 'Product 1', availableQuantity: 10, price: 20 },
                { name: 'Product 2', availableQuantity: 5, price: 10 },
            ];
            productRepository.getAllProductsWithAvailability.mockReturnValue(availableProducts);

            productController.getAllProducts(req, res);

            expect(productRepository.getAllProductsWithAvailability).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(availableProducts);
        });
    });

    describe('sellProduct', () => {
        test('should sell a product and respond with success message', () => {
            const req = { params: { name: 'Product 1', quantity: '5' } };
            const res = { send: jest.fn() };
            const productRepository = { sellProduct: jest.fn() };

            const productController = new ProductController(productRepository);
            productController.sellProduct(req, res);

            expect(productRepository.sellProduct).toHaveBeenCalledWith('Product 1', 5);
            expect(res.json).toHaveBeenCalledWith('Product sold successfully');
        });

        test('should respond with error message if product is not found', () => {
            const req = { params: { name: 'Nonexistent Product', quantity: '5' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const productRepository = {
                sellProduct: jest.fn().mockImplementation(() => {
                    throw new Error('Product not found');
                }),
            };

            const productController = new ProductController(productRepository);
            productController.sellProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith('Product not found');
        });

        test('should respond with error message if quantity is invalid', () => {
            const req = { params: { name: 'Product 1', quantity: 'invalid' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const productRepository = {
                sellProduct: jest.fn().mockImplementation(() => {
                    throw new Error('Invalid quantity');
                }),
            };

            const productController = new ProductController(productRepository);
            productController.sellProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith('Invalid quantity');
        });
    });


    describe('uploadProducts', () => {
        test('should upload products and respond with the uploaded products', () => {
            const uploadedProducts = [
                { name: 'Product 1', price: 10 },
                { name: 'Product 2', price: 20 },
            ];
            req.file = { filename: 'products.json' };
            const readFileMock = jest.spyOn(productController.fs, 'readFileSync').mockReturnValue(JSON.stringify({ products: uploadedProducts }));

            productController.uploadProducts(req, res);

            expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining('products.json'), 'utf8');
            expect(productRepository.setProducts).toHaveBeenCalledWith(uploadedProducts);
            expect(res.json).toHaveBeenCalledWith(uploadedProducts);
        });

        test('should respond with error message if no file is uploaded', () => {
            productController.uploadProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith('No file uploaded');
        });

        test('should respond with error message if the products file has invalid format', () => {
            req.file = { filename: 'products.json' };
            const readFileMock = jest.spyOn(productController.fs, 'readFileSync').mockReturnValue('invalid JSON');

            productController.uploadProducts(req, res);

            expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining('products.json'), 'utf8');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith('Invalid products file format');
        });
    });

    describe('uploadInventory', () => {
        test('should respond with error message if no file is uploaded', () => {
            req.file = undefined;

            productController.uploadInventory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith('No file uploaded');
        });
    });

    describe('updateInventory', () => {
        test('should update the inventory and respond with success message', () => {
            const updatedInventory = [
                { art_id: '1', name: 'Article 1', stock: '10' },
                { art_id: '2', name: 'Article 2', stock: '20' },
            ];
            req.body = updatedInventory;

            productController.updateInventory(req, res);

            expect(inventoryRepository.updateInventory).toHaveBeenCalledWith(updatedInventory);
            expect(res.json).toHaveBeenCalledWith('Inventory updated successfully');
        });
    });

    describe('getInventory', () => {
        test('should retrieve the current inventory', () => {
            const currentInventory = [
                { art_id: '1', name: 'Article 1', stock: '10' },
                { art_id: '2', name: 'Article 2', stock: '20' },
            ];
            inventoryRepository.getInventory.mockReturnValue(currentInventory);

            productController.getInventory(req, res);

            expect(inventoryRepository.getInventory).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(currentInventory);
        });
    });

    describe('deleteInventoryItem', () => {
        test('should delete an inventory item and respond with success message', () => {
            req.params = { art_id: '1', quantity: '5' };

            productController.deleteInventoryItem(req, res);

            expect(inventoryRepository.deleteInventoryItem).toHaveBeenCalledWith('1', '5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Inventory item deleted successfully' });
        });

        test('should respond with error message if an error occurs while deleting inventory item', () => {
            req.params = { art_id: '1', quantity: '5' };
            inventoryRepository.deleteInventoryItem.mockImplementation(() => {
                throw new Error('Failed to delete inventory item');
            });

            productController.deleteInventoryItem(req, res);

            expect(inventoryRepository.deleteInventoryItem).toHaveBeenCalledWith('1', '5');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete inventory item' });
        });
    });
});
