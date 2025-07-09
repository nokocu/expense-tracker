namespace NoMoney.Api.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public int UserId { get; set; }
    }

    public class MonthlyStatsDto
    {
        public decimal TotalSpent { get; set; }
        public decimal DailyAverage { get; set; }
        public List<CategoryExpenseDto> ExpensesByCategory { get; set; } = new List<CategoryExpenseDto>();
    }

    public class CategoryExpenseDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryColor { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DailyExpenseDto
    {
        public DateTime Date { get; set; }
        public List<ExpenseDto> Expenses { get; set; } = new List<ExpenseDto>();
        public decimal TotalAmount { get; set; }
    }
}
