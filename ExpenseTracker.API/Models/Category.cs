using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Color { get; set; } = "#808080";
        
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
