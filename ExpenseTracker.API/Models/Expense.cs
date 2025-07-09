using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models
{
    public class Expense
    {
        public int Id { get; set; }
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        
        public Category Category { get; set; } = null!;
        
        public int UserId { get; set; }
        
        public User User { get; set; } = null!;
    }
}
