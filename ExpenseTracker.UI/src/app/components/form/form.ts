import { Component, OnInit, signal, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense';
import { CategoryService } from '../../services/category';
import { CurrencyService } from '../../services/currency';
import { CreateExpense, Category } from '../../models/expense.model';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// GSAP for animations
import { gsap } from 'gsap';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class FormComponent implements OnInit, AfterViewInit {
  categories = signal<Category[]>([]);
  
  expense: CreateExpense = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    categoryId: 1,
    userId: 1
  };
  
  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    public currencyService: CurrencyService,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    this.loadCategories();
  }

  ngAfterViewInit() {
    // GSAP animation on component load
    gsap.fromTo(
      this.elementRef.nativeElement.querySelector('mat-card'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }
  
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => this.categories.set(categories),
      error: (err: any) => console.error('error loading categories:', err)
    });
  }
  
  onSubmit() {
    if (this.expense.description && this.expense.amount > 0) {
      this.expenseService.createExpense(this.expense).subscribe({
        next: () => {
          // reset form
          this.expense = {
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            categoryId: 1,
            userId: 1
          };
          
          // emit event to reload calendar
          window.location.reload();
        },
        error: (err: any) => console.error('error creating expense:', err)
      });
    }
  }
}
