using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Data
{
    public class ExpenseDbContext : DbContext
    {
        public ExpenseDbContext(DbContextOptions<ExpenseDbContext> options) : base(options) { }
        
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // seed default categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Food", Color = "#FF6B6B" },
                new Category { Id = 2, Name = "Transport", Color = "#4ECDC4" },
                new Category { Id = 3, Name = "Entertainment", Color = "#45B7D1" },
                new Category { Id = 4, Name = "Utilities", Color = "#96CEB4" },
                new Category { Id = 5, Name = "Shopping", Color = "#FFEAA7" },
                new Category { Id = 6, Name = "Healthcare", Color = "#DDA0DD" }
            );
            
            // seed default user
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "demo", Email = "demo@example.com" }
            );
        }
    }
}
