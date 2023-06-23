import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css'],
})
export class InventoryListComponent implements OnInit {
  constructor(private inventoryService: InventoryService) {}

  inventory$!: Observable<any>;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  showSuccessMessageDeleted: boolean = false;

  ngOnInit(): void {
    this.loadInventory();
  }

  /**
   * Load the inventory from the server.
   */
  loadInventory(): void {
    this.inventory$ = this.inventoryService.getInventory();
  }

  /**
   * Delete an inventory item by article ID and quantity.
   * @param artId The ID of the article to delete.
   * @param quantity The quantity of the article to delete.
   */
  deleteItem(artId: string, quantity: number): void {
    this.inventoryService.deleteInventoryItem(artId, quantity).subscribe({
      next: (response) => {
        console.log(response, 'Item has been deleted');
        this.loadInventory();
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
   * Upload an inventory file and handle the response.
   * @param event The file upload event.
   */
  uploadInventory(event: any): void {
    const file = event.target.files[0];
    this.inventoryService.uploadInventory(file).subscribe({
      next: (response) => {
        console.log('Inventory uploaded successfully');
        this.loadInventory();
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 4000);
      },
      error: (error) => {
        console.log('Error uploading inventory', error);
        this.showErrorMessage = true;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 4000);
      },
    });
  }
}
