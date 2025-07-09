import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import { CategoryService } from '../../services/category';
import { CurrencyService } from '../../services/currency';
import { Expense, Category, DayExpense } from '../../models/expense.model';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarComponent implements OnInit {
  currentDate = signal(new Date());
  calendarDays = signal<DayExpense[]>([]);
  categories = signal<Category[]>([]);
  selectedDate = signal<Date | null>(null);
  
  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    public currencyService: CurrencyService
  ) {}
  
  ngOnInit() {
    // set today as the default selected date
    const today = new Date();
    this.selectedDate.set(today);
    
    this.loadCategories();
    this.loadCalendarData();
  }
  
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('error loading categories:', err)
    });
  }
  
  loadCalendarData() {
    const currentMonth = this.currentDate();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // get expenses for the month
    this.expenseService.getExpenses(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ).subscribe({
      next: (expenses) => this.generateCalendar(expenses),
      error: (err) => console.error('error loading expenses:', err)
    });
  }
  
  generateCalendar(expenses: Expense[]) {
    const currentMonth = this.currentDate();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const days: DayExpense[] = [];
    
    // get the day of week for the first day of the month
    const firstDayOfWeek = startOfMonth.getDay();
    
    // calculate how many days from previous month to show
    // we want Monday to be first so adjust for that
    const mondayAdjustment = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // add previous months trailing days
    for (let i = mondayAdjustment - 1; i >= 0; i--) {
      const date = new Date(startOfMonth);
      date.setDate(date.getDate() - (i + 1));
      
      const dayExpenses = expenses.filter(e => 
        new Date(e.date).toDateString() === date.toDateString()
      );
      
      days.push(this.createDayExpense(date, dayExpenses, true));
    }
    
    // add current months days
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayExpenses = expenses.filter(e => 
        new Date(e.date).toDateString() === date.toDateString()
      );
      
      days.push(this.createDayExpense(date, dayExpenses, false));
    }
    
    // add next months leading days to complete the grid 
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      const dayExpenses = expenses.filter(e => 
        new Date(e.date).toDateString() === date.toDateString()
      );
      
      days.push(this.createDayExpense(date, dayExpenses, true));
    }
    
    this.calendarDays.set(days);
  }
  
  private createDayExpense(date: Date, dayExpenses: Expense[], isOtherMonth: boolean): DayExpense {
    // calculate category totals for the day
    const categoryTotals: { [categoryId: number]: { amount: number; color: string; name: string } } = {};
    let totalAmount = 0;
    
    dayExpenses.forEach(expense => {
      totalAmount += expense.amount;
      if (!categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] = {
          amount: 0,
          color: expense.categoryColor,
          name: expense.categoryName
        };
      }
      categoryTotals[expense.categoryId].amount += expense.amount;
    });
    
    return {
      date,
      totalAmount,
      expenses: dayExpenses,
      categoryTotals,
      isOtherMonth
    };
  }
  
  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.loadCalendarData();
    this.selectTodayIfInCurrentMonth();
  }
  
  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.loadCalendarData();
    this.selectTodayIfInCurrentMonth();
  }
  
  selectDay(day: DayExpense) {
    this.selectedDate.set(day.date);
  }
  
  getMonthName(): string {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  getCategoryBars(day: DayExpense): Array<{color: string, width: number, name: string}> {
    if (day.totalAmount === 0) return [];
    
    return Object.values(day.categoryTotals).map(cat => ({
      color: cat.color,
      width: (cat.amount / day.totalAmount) * 100,
      name: cat.name
    }));
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private selectTodayIfInCurrentMonth() {
    const today = new Date();
    const currentMonth = this.currentDate();
    
    // check if today is in the currently displayed month
    if (today.getFullYear() === currentMonth.getFullYear() && 
        today.getMonth() === currentMonth.getMonth()) {
      this.selectedDate.set(today);
    } else {
      // If today is not in current month, clear selection or keep current
      // this.selectedDate.set(null);
    }
  }
}
