import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, CreateExpense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:5276/api/expenses'; // updated port
  
  constructor(private http: HttpClient) { }
  
  getExpenses(startDate?: string, endDate?: string): Observable<Expense[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<Expense[]>(this.apiUrl, { params });
  }
  
  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }
  
  createExpense(expense: CreateExpense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }
  
  updateExpense(id: number, expense: CreateExpense): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, expense);
  }
  
  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
