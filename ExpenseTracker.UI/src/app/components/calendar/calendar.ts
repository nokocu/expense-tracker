import { Component, OnInit, signal, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import { CategoryService } from '../../services/category';
import { CurrencyService } from '../../services/currency';
import { Expense, Category, DayExpense } from '../../models/expense.model';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

// GSAP for animations
import gsap from 'gsap';

@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatToolbarModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @Output() currentMonthChange = new EventEmitter<Date>();
  currentDate = signal(new Date());
  calendarDays = signal<DayExpense[]>([]);
  categories = signal<Category[]>([]);
  selectedDate = signal<Date | null>(null);
  
  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    public currencyService: CurrencyService,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    // set today as the default selected date
    const today = new Date();
    this.selectedDate.set(today);
    this.emitCurrentMonth();
    this.loadCategories();
    this.loadCalendarData();
  }

  ngAfterViewInit() {

    // initial container setup
    const calendarContainer = this.elementRef.nativeElement.querySelector('.calendar-container');
    if (calendarContainer) {
      gsap.set(calendarContainer, { opacity: 1 });
    }
  }
  
  private animateCalendarEntrance() {
    // small delay
    setTimeout(() => {
      const calendarContainer = this.elementRef.nativeElement.querySelector('.calendar-container');
      const calendarDays = this.elementRef.nativeElement.querySelectorAll('.calendar-day');
      
      if (calendarDays && calendarDays.length > 0) {
        gsap.fromTo(calendarDays,
          { opacity: 0, y: 20, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.4, 
            stagger: 0.02, 
            ease: "back.out(1.7)"
          }
        );
      }
    }, 50);
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
    this.animateCalendarEntrance();
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
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentDate.set(newDate);
    this.emitCurrentMonth();
    this.loadCalendarData();
    this.selectTodayIfInCurrentMonth();
  }
  
  nextMonth() {
    const current = this.currentDate();
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentDate.set(newDate);
    this.emitCurrentMonth();
    this.loadCalendarData();
    this.selectTodayIfInCurrentMonth();
  }
  private emitCurrentMonth() {
    this.currentMonthChange.emit(this.currentDate());
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
