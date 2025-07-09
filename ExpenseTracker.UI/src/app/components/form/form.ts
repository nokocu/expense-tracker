import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense';
import { CategoryService } from '../../services/category';
import { CurrencyService } from '../../services/currency';
import { CreateExpense, Category } from '../../models/expense.model';

@Component({
  selector: 'app-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class FormComponent implements OnInit {
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
    public currencyService: CurrencyService
  ) {}
  
  ngOnInit() {
    this.loadCategories();
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
