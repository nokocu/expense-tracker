using Microsoft.EntityFrameworkCore;
using NoMoney.Api.Models;

namespace NoMoney.Api.Data
{
    public class NoMoneyDbContext : DbContext
    {
        public NoMoneyDbContext(DbContextOptions<NoMoneyDbContext> options) : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // configure expense
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.Property(e => e.Date).HasColumnType("datetime");
                
                // foreign key to category
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Expenses)
                      .HasForeignKey(e => e.CategoryId);
            });

            // configure category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).HasMaxLength(50);
                entity.Property(c => c.Color).HasMaxLength(7);
                entity.HasIndex(c => c.Name).IsUnique();
            });
        }
    }
}
