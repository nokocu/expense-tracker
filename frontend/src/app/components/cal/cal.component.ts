import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { DailyExpense, Expense } from '../../models/expense.model';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  totalAmount: number;
  categories: { [key: string]: number };
}

@Component({
  selector: 'app-cal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cal.component.html',
  styleUrls: ['./cal.component.css']
})
export class CalComponent implements OnInit, OnDestroy {
  calendarDays: CalendarDay[] = [];
  currentMonth: string = '';
  currentYear: number = 0;
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  dailyExpenses: DailyExpense[] = [];
  
  dayHeaders = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
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
    this.selectedDate = new Date();
    this.currentDate = new Date();
    this.updateCalendar();
    this.loadMonthlyExpenses();
    
    // set initial selected date
    this.expenseService.setSelectedDate(this.selectedDate);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.expenseService.setSelectedDate(date);
    this.updateCalendar();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateCalendar();
    this.loadMonthlyExpenses();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateCalendar();
    this.loadMonthlyExpenses();
  }

  private updateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.currentMonth = this.currentDate.toLocaleString('default', { month: 'long' }).toLowerCase();
    this.currentYear = year;

    // get first day of month and adjust for monday start
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const mondayStart = startDay === 0 ? 6 : startDay - 1;

    // get last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // generate calendar days
    this.calendarDays = [];
    
    // previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = mondayStart - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }

    // current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }

    // next month days to fill grid
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    
    // normalize dates for comparison (set time to 00:00:00)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const normalizedSelected = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate());
    
    const dailyExpense = this.dailyExpenses.find(de => {
      const expenseDate = new Date(de.date.getFullYear(), de.date.getMonth(), de.date.getDate());
      return expenseDate.getTime() === normalizedDate.getTime();
    });

    return {
      date: date,
      dayNumber: date.getDate(),
      isCurrentMonth: isCurrentMonth,
      isSelected: normalizedDate.getTime() === normalizedSelected.getTime(),
      isToday: normalizedDate.getTime() === normalizedToday.getTime(),
      totalAmount: dailyExpense?.totalAmount || 0,
      categories: this.calculateCategoryTotals(dailyExpense?.expenses || [])
    };
  }

  private calculateCategoryTotals(expenses: Expense[]): { [key: string]: number } {
    const totals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      totals[expense.categoryName] = (totals[expense.categoryName] || 0) + expense.amount;
    });
    return totals;
  }

  private loadMonthlyExpenses(): void {
    this.subscription.add(
      this.expenseService.getDailyExpenses(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1).subscribe({
        next: (expenses) => {
          // parse dates from string format to Date objects
          this.dailyExpenses = expenses.map(de => ({
            ...de,
            date: new Date(de.date),
            expenses: de.expenses.map(exp => ({
              ...exp,
              date: new Date(exp.date)
            }))
          }));
          this.updateCalendar();
        },
        error: (error) => {
          console.error('error loading daily expenses:', error);
          // fallback to demo data
          this.generateDemoData();
          this.updateCalendar();
        }
      })
    );
  }

  private generateDemoData(): void {
    const today = new Date();
    if (today.getMonth() === this.currentDate.getMonth() && today.getFullYear() === this.currentDate.getFullYear()) {
      this.dailyExpenses = [
        {
          date: today,
          totalAmount: 78.50,
          expenses: [
            { 
              id: 1, 
              amount: 25.50, 
              description: 'lunch', 
              categoryId: 1, 
              categoryName: 'food', 
              date: today, 
              userId: 1 
            },
            { 
              id: 2, 
              amount: 8.00, 
              description: 'bus', 
              categoryId: 3, 
              categoryName: 'transport', 
              date: today, 
              userId: 1 
            },
            { 
              id: 3, 
              amount: 45.00, 
              description: 'cinema', 
              categoryId: 2, 
              categoryName: 'entertainment', 
              date: today, 
              userId: 1 
            }
          ]
        },
        {
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
          totalAmount: 45.20,
          expenses: [
            { 
              id: 4, 
              amount: 35.20, 
              description: 'groceries', 
              categoryId: 1, 
              categoryName: 'food', 
              date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), 
              userId: 1 
            },
            { 
              id: 5, 
              amount: 10.00, 
              description: 'coffee', 
              categoryId: 6, 
              categoryName: 'shopping', 
              date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), 
              userId: 1 
            }
          ]
        },
        {
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
          totalAmount: 120.00,
          expenses: [
            { 
              id: 6, 
              amount: 100.00, 
              description: 'rent payment', 
              categoryId: 5, 
              categoryName: 'rent', 
              date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2), 
              userId: 1 
            },
            { 
              id: 7, 
              amount: 20.00, 
              description: 'pharmacy', 
              categoryId: 4, 
              categoryName: 'healthcare', 
              date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2), 
              userId: 1 
            }
          ]
        }
      ];
    } else {
      this.dailyExpenses = [];
    }
  }

  getDayColor(day: CalendarDay): string {
    if (day.totalAmount === 0) return '#364153';
    
    const categories = Object.keys(day.categories);
    if (categories.length === 0) return '#364153';
    
    // find the category with the highest amount
    const topCategory = categories.reduce((max, cat) => 
      day.categories[cat] > day.categories[max] ? cat : max
    );
    
    return this.categoryColors[topCategory] || '#364153';
  }
}
