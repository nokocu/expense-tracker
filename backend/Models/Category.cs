using System.ComponentModel.DataAnnotations;

namespace NoMoney.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(7)] // hex color code
        public string Color { get; set; } = string.Empty;
        
        public bool IsDefault { get; set; } = false;
        
        public int UserId { get; set; } = 1; // hardcoded for demo
        
        // navigation properties
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
