import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { Expense, CreateExpenseRequest } from '../../models/expense.model';

@Component({
  selector: 'app-stat-daily',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stat-daily.component.html',
  styleUrls: ['./stat-daily.component.css']
})
export class StatDailyComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  selectedDate: Date = new Date();
  private subscription = new Subscription();
  
  // add expense mode
  isAddingExpense: boolean = false;
  newExpense = {
    description: '',
    categoryId: 1,
    amount: 0
  };

  private categoryColors: { [key: string]: string } = {
    'food': '#ff4444',
    'entertainment': '#44ff44',
    'transport': '#ffff44',
    'healthcare': '#4444ff',
    'rent': '#ff44ff',
    'shopping': '#ff8844'
  };

  // all possible categories - will be loaded from API
  allCategories: { id: number; name: string; color: string }[] = [
    { id: 1, name: 'food', color: '#ff4444' },
    { id: 2, name: 'transport', color: '#ffff44' },
    { id: 3, name: 'entertainment', color: '#44ff44' },
    { id: 4, name: 'healthcare', color: '#4444ff' },
    { id: 5, name: 'shopping', color: '#ff8844' },
    { id: 6, name: 'rent', color: '#ff44ff' }
  ];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadCurrentDayData();
    this.loadCategories();
    
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

  private loadCategories(): void {
    this.subscription.add(
      this.expenseService.getCategories().subscribe({
        next: (categories) => {
          // update categories with API data
          this.allCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color
          }));
        },
        error: (error) => {
          console.error('error loading categories:', error);
          // keep default categories as fallback
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

  addExpense(): void {
    this.isAddingExpense = true;
    // reset form
    this.newExpense = {
      description: '',
      categoryId: 1,
      amount: 0
    };
  }

  cancelAddExpense(): void {
    this.isAddingExpense = false;
  }

  saveExpense(): void {
    // validate form
    if (!this.newExpense.description?.trim()) {
      console.error('Description is required');
      return;
    }
    
    if (!this.newExpense.amount || this.newExpense.amount <= 0) {
      console.error('Amount must be greater than 0');
      return;
    }
    
    if (!this.newExpense.categoryId) {
      console.error('Category is required');
      return;
    }

    // create expense request with properly formatted date
    const expenseRequest: CreateExpenseRequest = {
      amount: this.newExpense.amount,
      description: this.newExpense.description.trim(),
      categoryId: this.newExpense.categoryId,
      date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate(), 12, 0, 0) // Set to noon to avoid timezone issues
    };


    // call service to save expense to database
    this.subscription.add(
      this.expenseService.createExpense(expenseRequest).subscribe({
        next: (savedExpense) => {
          
          // reset form and exit add mode
          this.isAddingExpense = false;
          
          // reload expenses to get fresh data from database
          this.loadExpensesForDate(this.selectedDate);
        },
        error: (error) => {
          console.error('Error saving expense:', error);
          
          // still exit add mode but show error
          alert('Failed to save expense. Please try again.');
        }
      })
    );
  }
}
