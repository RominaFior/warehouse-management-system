import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from './models';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`)
  }

  uploadProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/products`, formData);
  }

  sellProduct(name: string, quantity: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${name}/${quantity}`);
  }
}
