import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { TranslationService } from '../../services/translation.service';
import { CategoryService, CreateCategoryRequest, UpdateCategoryRequest } from '../../services/category.service';
import { CategoryExpense, Category } from '../../models/expense.model';

@Component({
  selector: 'app-stat-circle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stat-circle.component.html',
  styleUrls: ['./stat-circle.component.css']
})
export class StatCircleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  categories: CategoryExpense[] = [];
  allCategories: Category[] = []; 
  totalAmount: number = 0;
  currentCurrency: string = 'pln';

  // new category input
  newCategoryName: string = '';

  // delete functionality (exactly like stat-daily)
  hoveredCategoryId: number | null = null;
  deletingCategoryId: number | null = null;
  deleteProgress: number = 0;
  private deleteTimer: any = null;
  private deleteInterval: any = null;
  
  // cache for zero-expense categories to maintain object identity
  private zeroCategoryCache: Map<number, CategoryExpense> = new Map();
  
  private subscription = new Subscription();

  constructor(
    private expenseService: ExpenseService,
    private currencyService: CurrencyService,
    private translationService: TranslationService,
    private categoryService: CategoryService
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
    this.cancelDeleteTimer(); // clean up any running timers (like stat-daily)
  }

  private loadCurrentMonthData(): void {
    const now = new Date();
    this.loadMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  }

  private loadAllCategories(): void {
    this.subscription.add(
      this.categoryService.getCategories().subscribe({
        next: (categories: Category[]) => {
          this.allCategories = categories;
          this.drawChart(); // redraw chart when categories are loaded
        },
        error: (error: any) => {
          console.error('error loading categories:', error);
          this.allCategories = [];
        }
      })
    );

    // subscribe to category changes from the service
    this.subscription.add(
      this.categoryService.categories$.subscribe((categories: Category[]) => {
        this.allCategories = categories;
        // clear cache when categories change to ensure consistency
        this.zeroCategoryCache.clear();
        this.drawChart(); // redraw chart when categories change
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
    const innerRadius = 60;

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
    const gapAngle = 0.06; // larger gap between segments
    const hasMultipleCategories = this.categories.length > 1;

    this.categories.forEach((category, index) => {
      const sliceAngle = (category.percentage / 100) * 2 * Math.PI;
      
      let adjustedSliceAngle = sliceAngle;
      
      // only add gaps if there are multiple categories
      if (hasMultipleCategories) {
        // add gap before each slice
        currentAngle += gapAngle / 2;
        
        // reduce slice angle to account for gaps on both sides
        adjustedSliceAngle = sliceAngle - gapAngle;
      }
      
      // only draw if the adjusted slice is large enough to be visible
      if (adjustedSliceAngle > 0) {
        // draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + adjustedSliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + adjustedSliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = category.categoryColor;
        ctx.fill();
      }

      currentAngle += adjustedSliceAngle;
      
      // only add gap after if there are multiple categories
      if (hasMultipleCategories) {
        currentAngle += gapAngle / 2;
      }
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  translateCategoryName(categoryName: string): string {
    // default category names that should be translated
    const defaultCategoryNames = ['food', 'entertainment', 'transport', 'healthcare', 'rent', 'shopping', 'other'];
    
    // only translate if it's a default category (case insensitive)
    if (defaultCategoryNames.includes(categoryName.toLowerCase())) {
      const categoryKey = `categories.${categoryName.toLowerCase()}`;
      return this.translationService.translate(categoryKey);
    }
    
    // return the original name for user-created categories
    return categoryName;
  }

  getDisplayCategories(): CategoryExpense[] {
    // create a map of expense categories by ID for quick lookup
    const expenseMap = new Map(this.categories.map(cat => [cat.categoryId, cat]));
    
    // map all categories and fill with expense data or default to 0
    const result = this.allCategories.map(category => {
      const expenseCategory = expenseMap.get(category.id);
      
      if (expenseCategory) {
        // use expense data if available - remove from cache since we have real data
        this.zeroCategoryCache.delete(category.id);
        return expenseCategory;
      } else {
        // check cache first for consistent object identity
        let zeroCategory = this.zeroCategoryCache.get(category.id);
        if (!zeroCategory) {
          // create category with 0 amount if no expenses and not in cache
          zeroCategory = {
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            totalAmount: 0,
            percentage: 0
          };
          this.zeroCategoryCache.set(category.id, zeroCategory);
        } else {
          // update cached category with latest data in case color changed
          zeroCategory.categoryName = category.name;
          zeroCategory.categoryColor = category.color;
        }
        return zeroCategory;
      }
    });
    
    // sort by total amount (highest to lowest)
    result.sort((a, b) => b.totalAmount - a.totalAmount);
    
    return result;
  }

  onCategoryColorChange(categoryId: number, color: string): void {
    const updateRequest: UpdateCategoryRequest = { color };
    this.categoryService.updateCategory(categoryId, updateRequest).subscribe({
      next: () => {
        this.categoryService.refreshCategories();
        // force immediate redraw of chart with new color
        this.loadCurrentMonthData();
      },
      error: (error: any) => {
        console.error('Error updating category color:', error);
        alert(error.error?.message || 'Error updating category color');
      }
    });
  }

  onCreateNewCategory(): void {
    // trim whitespace and check if name is not empty
    const trimmedName = this.newCategoryName.trim();
    if (!trimmedName) {
      return; // dont create if empty
    }

    const createRequest: CreateCategoryRequest = {
      name: trimmedName,
      color: '#ffffff' // default white color
    };
    
    this.categoryService.createCategory(createRequest).subscribe({
      next: (newCategory: Category) => {
        this.categoryService.refreshCategories();
        this.newCategoryName = ''; // clear input after successful creation
      },
      error: (error: any) => {
        console.error('Error creating category:', error);
        alert(error.error?.message || 'Error creating category');
      }
    });
  }

  // delete functionality methods (exactly like stat-daily)
  onCategoryHover(category: CategoryExpense, isHovering: boolean): void {
    this.hoveredCategoryId = isHovering ? category.categoryId : null;
  }

  startDeleteTimer(category: CategoryExpense): void {
    
    // dont allow delete for default categories or categories with expenses
    if (!this.canDeleteCategory(category)) {
      return;
    }
    

    this.deletingCategoryId = category.categoryId;
    this.deleteProgress = 0;
    
    // start progress animation
    this.deleteInterval = setInterval(() => {
      this.deleteProgress += 2; // 50 updates over 1 second (100% / 50 = 2%)

      if (this.deleteProgress >= 100) {
        this.deleteCategory(category);
      }
    }, 20); // update every 20ms for smooth animation
  }

  cancelDeleteTimer(): void {
    if (this.deleteInterval) {
      clearInterval(this.deleteInterval);
      this.deleteInterval = null;
    }
    this.deletingCategoryId = null;
    this.deleteProgress = 0;
  }

  private deleteCategory(category: CategoryExpense): void {
    this.cancelDeleteTimer();
    
    this.categoryService.deleteCategory(category.categoryId).subscribe({
      next: () => {
        this.categoryService.refreshCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    });
  }

  canDeleteCategory(category: CategoryExpense): boolean {
    // default category names that should never be deleteable
    const defaultCategoryNames = ['food', 'entertainment', 'transport', 'healthcare', 'rent', 'shopping', 'other'];
    
    // check if its a default category by name (case insensitive)
    const isDefaultCategory = defaultCategoryNames.includes(category.categoryName.toLowerCase());
    
    // category can be deleted if it's NOT a default category AND has no expenses
    return !isDefaultCategory && category.totalAmount === 0;
  }

  getCategoryById(categoryId: number): Category | undefined {
    return this.allCategories.find(c => c.id === categoryId);
  }
}
