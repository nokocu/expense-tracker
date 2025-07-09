import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasExpenses: boolean;
  expenses: Expense[];
  date: Date;
}

@Component({
  selector: 'app-cal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cal.component.html',
  styleUrls: ['./cal.component.css']
})
export class CalComponent implements OnInit, OnDestroy {
  @Output() daySelected = new EventEmitter<Date>();

  currentDate = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  expenses: Expense[] = [];
  private subscription = new Subscription();
  
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    // subscribe to selected date changes from the service
    this.subscription.add(
      this.expenseService.selectedDate$.subscribe(date => {
        this.selectedDate = date;
        this.loadExpenses();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadExpenses() {
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data.map(expense => ({
          ...expense,
          date: new Date(expense.date) // Convert string to Date object
        }));
        this.generateCalendar();
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.generateCalendar(); // Generate calendar even if expenses fail to load
      }
    });
  }

  generateCalendar() {
    this.calendarDays = [];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    
    // first day of current month
    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = firstDay.getDay();
    
    // last day of current month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // previous month details
    const prevMonth = new Date(year, month, 0); // This gives us the last day of the previous month
    const prevMonthDays = prevMonth.getDate();
    
    // add previous month overflow days (calculate correctly)
    // we want to show previous month days leading up to the 1st of current month
    const daysFromPrevMonth = firstDayWeekday;
    
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      
      this.calendarDays.push({
        day: day,
        isCurrentMonth: false,
        isToday: false,
        hasExpenses: this.hasExpensesOnDate(date),
        expenses: this.getExpensesForDate(date),
        date: date
      });
    }
    
    // add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isSameDate(date, today);
      
      this.calendarDays.push({
        day: day,
        isCurrentMonth: true,
        isToday: isToday,
        hasExpenses: this.hasExpensesOnDate(date),
        expenses: this.getExpensesForDate(date),
        date: date
      });
    }
    
    // add next month overflow days to complete the grid (42 cells = 6 weeks)
    const remainingCells = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      
      this.calendarDays.push({
        day: day,
        isCurrentMonth: false,
        isToday: false,
        hasExpenses: this.hasExpensesOnDate(date),
        expenses: this.getExpensesForDate(date),
        date: date
      });
    }
    
  }

  hasExpensesOnDate(date: Date): boolean {
    return this.expenses.some(expense => this.isSameDate(expense.date, date));
  }

  getExpensesForDate(date: Date): Expense[] {
    return this.expenses.filter(expense => this.isSameDate(expense.date, date));
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  selectDay(calendarDay: CalendarDay) {
    this.selectedDate = calendarDay.date;
    

    this.expenseService.setSelectedDate(calendarDay.date); // Set the date in the service
    this.daySelected.emit(calendarDay.date);
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  getTotalExpensesForDay(calendarDay: CalendarDay): number {
    return calendarDay.expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}
