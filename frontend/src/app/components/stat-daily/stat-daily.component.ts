import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { TranslationService } from '../../services/translation.service';
import { CategoryService } from '../../services/category.service';
import { Expense, CreateExpenseRequest, Category } from '../../models/expense.model';

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
  currentCurrency: string = 'pln';
  allCategories: Category[] = [];
  private subscription = new Subscription();
  
  // add expense mode
  isAddingExpense: boolean = false;
  newExpense = {
    description: '',
    categoryId: 1,
    amount: 0
  };

  // delete functionality
  hoveredExpenseId: number | null = null;
  deletingExpenseId: number | null = null;
  deleteProgress: number = 0;
  private deleteTimer: any = null;
  private deleteInterval: any = null;

  constructor(
    private expenseService: ExpenseService,
    private currencyService: CurrencyService,
    private translationService: TranslationService,
    private categoryService: CategoryService
  ) {}

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

    // subscribe to currency changes
    this.subscription.add(
      this.currencyService.currency$.subscribe(currency => {
        this.currentCurrency = currency;
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
      this.categoryService.getCategories().subscribe({
        next: (categories: Category[]) => {
          this.allCategories = categories;
        },
        error: (error: any) => {
          console.error('error loading categories:', error);
        }
      })
    );

    // subscribe to category changes
    this.subscription.add(
      this.categoryService.categories$.subscribe((categories: Category[]) => {
        this.allCategories = categories;
      })
    );
  }

  getCategoryColor(categoryName: string): string {
    const category = this.allCategories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    return category?.color || '#ffffff';
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
    // Find entertainment category ID, fallback to first available category
    const entertainmentCategory = this.allCategories.find(cat => cat.name.toLowerCase() === 'entertainment');
    const defaultCategoryId = entertainmentCategory ? entertainmentCategory.id : (this.allCategories.length > 0 ? this.allCategories[0].id : 1);
    
    // reset form with entertainment as default category
    this.newExpense = {
      description: '',
      categoryId: defaultCategoryId,
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
          
          // trigger refresh for all other components
          this.expenseService.refreshData();
        },
        error: (error) => {
          console.error('Error saving expense:', error);
          
          // still exit add mode but show error
          alert('Failed to save expense. Please try again.');
        }
      })
    );
  }

  // delete functionality methods
  onExpenseHover(expense: Expense, isHovering: boolean): void {
    this.hoveredExpenseId = isHovering ? expense.id : null;
  }

  startDeleteTimer(expense: Expense): void {
    if (this.isAddingExpense) return; // dont allow delete while adding expense
    
    this.deletingExpenseId = expense.id;
    this.deleteProgress = 0;
    
    // start progress animation
    this.deleteInterval = setInterval(() => {
      this.deleteProgress += 2; // 50 updates over 1 second (100% / 50 = 2%)
      if (this.deleteProgress >= 100) {
        this.deleteExpense(expense);
      }
    }, 20); // update every 20ms for smooth animation
  }

  cancelDeleteTimer(): void {
    if (this.deleteInterval) {
      clearInterval(this.deleteInterval);
      this.deleteInterval = null;
    }
    this.deletingExpenseId = null;
    this.deleteProgress = 0;
  }

  private deleteExpense(expense: Expense): void {
    this.cancelDeleteTimer();
    
    this.subscription.add(
      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => {
          // remove expense from local array
          this.expenses = this.expenses.filter(e => e.id !== expense.id);
          console.log('Expense deleted successfully');
          
          // trigger refresh for all other components
          this.expenseService.refreshData();
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          alert('Failed to delete expense. Please try again.');
        }
      })
    );
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  translateCategoryName(categoryName: string): string {
    const categoryKey = `categories.${categoryName.toLowerCase()}`;
    return this.translationService.translate(categoryKey);
  }

  formatDate(date: Date): string {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const dayName = this.translate(`days.${dayNames[date.getDay()]}`);
    const monthName = this.translate(`months.${monthNames[date.getMonth()]}`);
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  }

  changeTheme(): void {
    // theme changing logic here
  }

  isExpenseFormValid(): boolean {
    return !!(this.newExpense.description?.trim() && this.newExpense.amount && this.newExpense.amount > 0);
  }
}
