import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { MonthlyStats } from '../../models/expense.model';

@Component({
  selector: 'app-stat-monthly',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-monthly.component.html',
  styleUrls: ['./stat-monthly.component.css']
})
export class StatMonthlyComponent implements OnInit, OnDestroy {
  monthlyStats: MonthlyStats | null = null;
  currentMonth: string = '';
  currentYear: number = 0;
  private subscription = new Subscription();

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadCurrentMonthData();
    
    // subscribe to date changes
    this.subscription.add(
      this.expenseService.selectedDate$.subscribe(date => {
        this.updateMonthDisplay(date);
        this.loadMonthlyStats(date.getFullYear(), date.getMonth() + 1);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCurrentMonthData(): void {
    const now = new Date();
    this.updateMonthDisplay(now);
    this.loadMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  }

  private updateMonthDisplay(date: Date): void {
    this.currentMonth = date.toLocaleString('default', { month: 'long' }).toLowerCase();
    this.currentYear = date.getFullYear();
  }

  private loadMonthlyStats(year: number, month: number): void {
    this.subscription.add(
      this.expenseService.getMonthlyStats(year, month).subscribe({
        next: (stats) => {
          this.monthlyStats = stats;
        },
        error: (error) => {
          console.error('error loading monthly stats:', error);
          // fallback to demo data
          this.monthlyStats = {
            totalSpent: 1250.75,
            dailyAverage: 40.35,
            expensesByCategory: []
          };
        }
      })
    );
  }
}
