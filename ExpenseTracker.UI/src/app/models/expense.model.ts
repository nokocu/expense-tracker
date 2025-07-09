export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
}

export interface CreateExpense {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  userId: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface DayExpense {
  date: Date;
  totalAmount: number;
  expenses: Expense[];
  categoryTotals: { [categoryId: number]: { amount: number; color: string; name: string } };
  isOtherMonth?: boolean;
}
