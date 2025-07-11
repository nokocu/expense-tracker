import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/expense.model';

export interface CreateCategoryRequest {
  name: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'http://localhost:5000/api/categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: number, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.getCategories().subscribe({
      next: (categories) => {
        this.categoriesSubject.next(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // get current categories value synchronously
  getCurrentCategories(): Category[] {
    return this.categoriesSubject.value;
  }
}