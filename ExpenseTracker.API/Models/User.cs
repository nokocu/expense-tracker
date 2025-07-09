using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
