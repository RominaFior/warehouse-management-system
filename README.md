# Warehouse Management System

This repository contains the Warehouse Management System project, which consists of a backend and a frontend application.
This project was generated with Angular version 16.0.1. and Node.js v18.13.0

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
Running the Node.js Server
To start the Node.js server, run the following command: `npm run start`

## Running unit tests

To execute the unit tests in the backend, use the following command: `npm run test`

## Test Files

There are two test files available at the root of your project:

`test_inventory.json`: This file contains sample data for testing the inventory functionality.
`test_product.json`: This file contains sample data for testing the product functionality.


## Backend

The backend folder contains the server-side code for the Warehouse Management System.

### Folder Structure

- `src`: Contains the source code files.
  - `controllers`: Contains the controllers for handling product-related operations.
    - `productController.js`: Controller for managing products.
  - `repositories`: Contains the repositories for interacting with the data storage.
    - `ProductRepository.js`: Repository for product-related data operations.
    - `InventoryRepository.js`: Repository for inventory-related data operations.
  - `server.js`: Entry point for the backend server.
- `test`: Contains the test files for the backend.
  - `controllers`: Contains the test cases for the product controller.

### Uploads

The uploads folder is used for storing uploaded files.

## Frontend

The frontend folder contains the client-side code for the Warehouse Management System.

### Folder Structure

- `warehouse-app`: Contains the source code files for the Angular application.
  - `src`: Contains the source code files for the Angular application.
    - `app`: Contains the components and services for the application.
      - `inventory-list`: Component for displaying the inventory list.
      - `navigation-menu`: Component for the navigation menu.
      - `product-list`: Component for displaying the product list.
      - `services`: Contains the services for interacting with the backend API.
        - `inventory.service.ts`: Service for inventory-related API calls.
        - `product.service.ts`: Service for product-related API calls.
      - `app.component.html`: HTML template for the root component.
      - `app.routing.module.ts`: Routing module for the application.
      - `app.module.ts`: Module file for the application.
