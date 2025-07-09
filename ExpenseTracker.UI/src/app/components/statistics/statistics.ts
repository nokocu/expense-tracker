import { Component, OnInit, ElementRef, AfterViewInit, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';
import { CategoryService } from '../../services/category';
import { CurrencyService } from '../../services/currency';
import { Expense, Category } from '../../models/expense.model';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// GSAP for animations
import { gsap } from 'gsap';

interface CategoryStats {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

interface MonthlyStats {
  totalExpenses: number;
  averageDaily: number;
  categoriesCount: number;
  topCategory: CategoryStats | null;
}

@Component({
  selector: 'app-statistics',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() monthDate: Date | null = null;
  monthlyStats = signal<MonthlyStats>({
    totalExpenses: 0,
    averageDaily: 0,
    categoriesCount: 0,
    topCategory: null
  });
  
  categoryStats = signal<CategoryStats[]>([]);
  isLoading = signal(true);
  
  // Helper method for getting current month/year text
  getCurrentMonthYear(): string {
    const date = this.monthDate || new Date();
    return date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }
  
  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    public currencyService: CurrencyService,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    this.loadStatistics();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['monthDate'] && !changes['monthDate'].firstChange) {
      this.loadStatistics();
    }
  }
  
  ngAfterViewInit() {
    // Initial load animation
    this.animateEntrance();
  }
  
  private animateEntrance() {
    const cards = this.elementRef.nativeElement.querySelectorAll('.stat-card');
    const progressBars = this.elementRef.nativeElement.querySelectorAll('.category-progress');
    
    gsap.fromTo(cards, 
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out" 
      }
    );
    
    // Animate progress bars filling up
    gsap.fromTo(progressBars,
      { width: '0%' },
      { 
        width: (index, element) => element.getAttribute('data-width') + '%',
        duration: 1.2,
        delay: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }
  
  private animateCounters() {
    const counterElements = this.elementRef.nativeElement.querySelectorAll('.counter-value');
    const currencyService = this.currencyService;
    
    counterElements.forEach((element: HTMLElement) => {
      const finalValue = parseFloat(element.getAttribute('data-value') || '0');
      const isCurrency = element.hasAttribute('data-currency');
      
      gsap.fromTo(element, 
        { innerHTML: '0' },
        {
          innerHTML: finalValue,
          duration: 1.5,
          ease: "power2.out",
          snap: { innerHTML: isCurrency ? 0.01 : 1 },
          onUpdate: function() {
            const currentValue = parseFloat((this as any)['targets']()[0].innerHTML);
            if (isCurrency) {
              element.innerHTML = currencyService.formatAmount(currentValue);
            } else {
              element.innerHTML = Math.floor(currentValue).toString();
            }
          }
        }
      );
    });
  }
  
  loadStatistics() {
    const date = this.monthDate || new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Load expenses for current month
    this.expenseService.getExpenses(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ).subscribe({
      next: (expenses) => {
        this.categoryService.getCategories().subscribe({
          next: (categories) => {
            this.calculateStatistics(expenses, categories);
            this.isLoading.set(false);
            
            // Trigger counter animations after data loads
            setTimeout(() => {
              this.animateCounters();
            }, 100);
          },
          error: (err) => {
            console.error('Error loading categories:', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
        this.isLoading.set(false);
      }
    });
  }
  
  private calculateStatistics(expenses: Expense[], categories: Category[]) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysInMonth = new Date().getDate(); // Current day of month
    const averageDaily = totalExpenses / daysInMonth;
    
    // Calculate category statistics
    const categoryMap = new Map<number, CategoryStats>();
    
    categories.forEach(category => {
      categoryMap.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        totalAmount: 0,
        percentage: 0,
        transactionCount: 0
      });
    });
    
    expenses.forEach(expense => {
      const stat = categoryMap.get(expense.categoryId);
      if (stat) {
        stat.totalAmount += expense.amount;
        stat.transactionCount++;
      }
    });
    
    // Calculate percentages and filter out empty categories
    const categoryStatsArray: CategoryStats[] = Array.from(categoryMap.values())
      .filter(stat => stat.totalAmount > 0)
      .map(stat => ({
        ...stat,
        percentage: totalExpenses > 0 ? (stat.totalAmount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    const topCategory = categoryStatsArray.length > 0 ? categoryStatsArray[0] : null;
    
    this.monthlyStats.set({
      totalExpenses,
      averageDaily,
      categoriesCount: categoryStatsArray.length,
      topCategory
    });
    
    this.categoryStats.set(categoryStatsArray);
  }
}
