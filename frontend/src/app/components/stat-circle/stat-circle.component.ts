import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { MonthlyStats, CategoryExpense } from '../../models/expense.model';

@Component({
  selector: 'app-stat-circle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-circle.component.html',
  styleUrls: ['./stat-circle.component.css']
})
export class StatCircleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  categories: CategoryExpense[] = [];
  totalAmount: number = 0;
  private subscription = new Subscription();

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadCurrentMonthData();
    
    // subscribe to date changes
    this.subscription.add(
      this.expenseService.selectedDate$.subscribe(date => {
        this.loadMonthlyStats(date.getFullYear(), date.getMonth() + 1);
      })
    );
  }

  ngAfterViewInit(): void {
    // initial chart draw
    this.drawChart();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCurrentMonthData(): void {
    const now = new Date();
    this.loadMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  }

  private loadMonthlyStats(year: number, month: number): void {
    this.subscription.add(
      this.expenseService.getMonthlyStats(year, month).subscribe({
        next: (stats) => {
          this.categories = stats.expensesByCategory;
          this.totalAmount = stats.totalSpent;
          this.drawChart();
        },
        error: (error) => {
          console.error('error loading monthly stats:', error);
          // fallback to demo data
          this.categories = [
            { categoryId: 1, categoryName: 'food', categoryColor: '#ff4444', totalAmount: 450, percentage: 36 },
            { categoryId: 2, categoryName: 'transport', categoryColor: '#ffff44', totalAmount: 200, percentage: 16 },
            { categoryId: 3, categoryName: 'entertainment', categoryColor: '#44ff44', totalAmount: 300, percentage: 24 },
            { categoryId: 4, categoryName: 'healthcare', categoryColor: '#4444ff', totalAmount: 150, percentage: 12 },
            { categoryId: 5, categoryName: 'shopping', categoryColor: '#ff8844', totalAmount: 150.75, percentage: 12 }
          ];
          this.totalAmount = 1250.75;
          this.drawChart();
        }
      })
    );
  }

  private drawChart(): void {
    if (!this.chartCanvas) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 80;
    const innerRadius = 45;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.categories.length === 0) {
      // draw empty circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#364153';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#080c14';
      ctx.fill();
      return;
    }

    let currentAngle = -Math.PI / 2; // start from top

    this.categories.forEach(category => {
      const sliceAngle = (category.percentage / 100) * 2 * Math.PI;
      
      // draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = category.categoryColor;
      ctx.fill();

      currentAngle += sliceAngle;
    });
  }
}
