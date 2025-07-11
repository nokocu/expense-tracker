import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { TranslationService } from '../../services/translation.service';
import { CategoryExpense, Category } from '../../models/expense.model';

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
  allCategories: Category[] = []; 
  totalAmount: number = 0;
  currentCurrency: string = 'pln';
  private subscription = new Subscription();

  constructor(
    private expenseService: ExpenseService,
    private currencyService: CurrencyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
    this.loadCurrentMonthData();
    
    // subscribe to date changes
    this.subscription.add(
      this.expenseService.selectedDate$.subscribe(date => {
        this.loadMonthlyStats(date.getFullYear(), date.getMonth() + 1);
      })
    );

    // subscribe to currency changes
    this.subscription.add(
      this.currencyService.currency$.subscribe(currency => {
        this.currentCurrency = currency;
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

  private loadAllCategories(): void {
    this.subscription.add(
      this.expenseService.getCategories().subscribe({
        next: (categories) => {
          this.allCategories = categories;
        },
        error: (error) => {
          console.error('error loading categories:', error);
          this.allCategories = [];
        }
      })
    );
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
          this.categories = [];
          this.totalAmount = 0;
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

    let currentAngle = -Math.PI / 2;

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

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  translateCategoryName(categoryName: string): string {
    const categoryKey = `categories.${categoryName.toLowerCase()}`;
    return this.translationService.translate(categoryKey);
  }

  getDisplayCategories(): CategoryExpense[] {
    // create a map of expense categories by ID for quick lookup
    const expenseMap = new Map(this.categories.map(cat => [cat.categoryId, cat]));
    
    // map all categories and fill with expense data or default to 0
    const result = this.allCategories.map(category => {
      const expenseCategory = expenseMap.get(category.id);
      
      if (expenseCategory) {
        // use expense data if available
        return expenseCategory;
      } else {
        // create category with 0 amount if no expenses
        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          totalAmount: 0,
          percentage: 0
        };
      }
    });
    
    return result;
  }
}
