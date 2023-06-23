const express = require('express');
const router = express.Router();

function configureRoutes(productController, upload) {
  router.get('/products', productController.getAllProducts.bind(productController));
  router.get('/inventory', productController.getInventory.bind(productController));
  router.post('/inventory', upload.single('file'), productController.uploadInventory.bind(productController));
  router.post('/products', upload.single('file'), productController.uploadProducts.bind(productController));
  router.delete('/products/:name/:quantity', productController.sellProduct.bind(productController));
  router.delete('/inventory/:art_id/:quantity', productController.deleteInventoryItem.bind(productController));

  return router;
}

module.exports = configureRoutes;
