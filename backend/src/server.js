const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const configureRoutes = require('./routes');
const ProductController = require('./controllers/productController');
const ProductRepository = require('./repositories/ProductRepository');
const InventoryRepository = require('./repositories/InventoryRepository');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const upload = multer({ dest: uploadDirectory });
const productFilePath = path.join(__dirname, './data/products.json');
const inventoryFilePath = path.join(__dirname, './data/inventory.json');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const inventoryRepository = new InventoryRepository(inventoryFilePath, fs);
const productRepository = new ProductRepository(productFilePath, fs);

inventoryRepository.setProductRepository(productRepository);
productRepository.setInventoryRepository(inventoryRepository);
inventoryRepository.setFileSystem(fs);



const productController = new ProductController(productRepository, inventoryRepository);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', configureRoutes(productController, upload));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
