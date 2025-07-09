export interface Expense {
  id: number;
  amount: number;
  description: string;
  categoryId: number;
  categoryName: string;
  date: Date;
  userId: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
  userId: number;
}

export interface MonthlyStats {
  totalSpent: number;
  dailyAverage: number;
  expensesByCategory: CategoryExpense[];
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
}

export interface DailyExpense {
  date: Date;
  expenses: Expense[];
  totalAmount: number;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  categoryId: number;
  date: Date;
}
