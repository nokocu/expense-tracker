import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-stat-daily',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-daily.component.html',
  styleUrls: ['./stat-daily.component.css']
})
export class StatDailyComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  selectedDate: Date = new Date();
  private subscription = new Subscription();

  private categoryColors: { [key: string]: string } = {
    'food': '#ff4444',
    'entertainment': '#44ff44',
    'transport': '#ffff44',
    'healthcare': '#4444ff',
    'rent': '#ff44ff',
    'shopping': '#ff8844'
  };

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadCurrentDayData();
    
    // subscribe to date changes
    this.subscription.add(
      this.expenseService.selectedDate$.subscribe(date => {
        this.selectedDate = date;
        this.loadExpensesForDate(date);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCurrentDayData(): void {
    const today = new Date();
    this.selectedDate = today;
    this.loadExpensesForDate(today);
  }

  private loadExpensesForDate(date: Date): void {
    this.subscription.add(
      this.expenseService.getExpensesByDate(date).subscribe({
        next: (expenses) => {
          this.expenses = expenses;
        },
        error: (error) => {
          console.error('error loading daily expenses:', error);
          // fallback to demo data for current day
          if (this.isToday(date)) {
            this.expenses = [
              {
                id: 1,
                amount: 25.50,
                description: 'lunch at bistro',
                categoryId: 1,
                categoryName: 'food',
                date: date,
                userId: 1
              },
              {
                id: 2,
                amount: 8.00,
                description: 'bus ticket',
                categoryId: 3,
                categoryName: 'transport',
                date: date,
                userId: 1
              },
              {
                id: 3,
                amount: 45.00,
                description: 'cinema tickets',
                categoryId: 2,
                categoryName: 'entertainment',
                date: date,
                userId: 1
              }
            ];
          } else {
            this.expenses = [];
          }
        }
      })
    );
  }

  getCategoryColor(categoryName: string): string {
    return this.categoryColors[categoryName.toLowerCase()] || '#ffffff';
  }

  getDailyTotal(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
