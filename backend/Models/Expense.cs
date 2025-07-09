using System.ComponentModel.DataAnnotations;

namespace NoMoney.Api.Models
{
    public class Expense
    {
        public int Id { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public int CategoryId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public int UserId { get; set; } = 1; // hardcoded for demo
        
        // navigation properties
        public virtual Category Category { get; set; } = null!;
    }
}
