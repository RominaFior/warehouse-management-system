import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './product-list/product-list.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductsService } from './services/products.service';
import { InventoryService } from './services/inventory.service';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    InventoryListComponent,
    NavigationMenuComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [ProductsService, InventoryService],
  bootstrap: [AppComponent],
})
export class AppModule {}
