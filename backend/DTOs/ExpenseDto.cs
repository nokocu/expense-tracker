namespace NoMoney.Api.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int UserId { get; set; }
    }

    public class CreateExpenseDto
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public DateTime Date { get; set; }
    }

    public class UpdateExpenseDto
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public DateTime Date { get; set; }
    }
}
