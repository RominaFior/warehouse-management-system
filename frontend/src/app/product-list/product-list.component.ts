import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  constructor(private productService: ProductsService) {}
  products$!: Observable<any[]>;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  showSuccessMessageDeleted: boolean = false;

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products from the server.
   */
  loadProducts(): void {
    this.products$ = this.productService.getAllProducts();
  }

  /**
   * Delete a product by name and quantity.
   * @param name The name of the product to delete.
   * @param quantity The quantity of the product to delete.
   */
  deleteProduct(name: string, quantity: number): void {
    this.productService.sellProduct(name, quantity).subscribe({
      next: (response) => {
        console.log(response, 'Product has been deleted');
        this.loadProducts();
        this.showSuccessMessageDeleted = true;
        setTimeout(() => {
          this.showSuccessMessageDeleted = false;
        }, 4000);
      },
      error: (error) => {
        console.log('An error occurred', error.message);
      },
    });
  }

  /**
   * Upload a file and handle the response.
   * @param event The file upload event.
   */
  uploadFile(event: any): void {
    const file = event.target.files[0];
    this.productService.uploadProducts(file).subscribe({
      next: (response) => {
        console.log('Products uploaded successfully');
        this.loadProducts();
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 4000);
      },
      error: (error) => {
        console.log('Error uploading products', error);
        this.showErrorMessage = true;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 4000);
      },
    });
  }
}
