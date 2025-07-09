import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Expense, Category, MonthlyStats, DailyExpense, CreateExpenseRequest } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:5000/api';
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());
  
  selectedDate$ = this.selectedDateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // date management
  setSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  getSelectedDate(): Date {
    return this.selectedDateSubject.value;
  }

  // expense operations
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
  }

  getExpensesByDate(date: Date): Observable<Expense[]> {
    // use local timezone to format date string to avoid timezone shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/date/${dateStr}`);
  }

  createExpense(expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
  }

  updateExpense(id: number, expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }

  // category operations
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // statistics
  getMonthlyStats(year: number, month: number): Observable<MonthlyStats> {
    return this.http.get<MonthlyStats>(`${this.apiUrl}/statistics/monthly/${year}/${month}`);
  }

  getDailyExpenses(year: number, month: number): Observable<DailyExpense[]> {
    return this.http.get<DailyExpense[]>(`${this.apiUrl}/statistics/daily/${year}/${month}`);
  }

  // trigger data refresh for all components
  refreshData(): void {
    // emit the current date again to trigger all subscriptions
    this.selectedDateSubject.next(this.selectedDateSubject.value);
  }
}
