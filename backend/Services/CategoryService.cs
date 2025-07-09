using Microsoft.EntityFrameworkCore;
using NoMoney.Api.Data;
using NoMoney.Api.Models;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Services
{
    public class CategoryService
    {
        private readonly NoMoneyDbContext _context;

        public CategoryService(NoMoneyDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Color = c.Color,
                    IsDefault = c.IsDefault,
                    UserId = c.UserId
                })
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Color = category.Color,
                IsDefault = category.IsDefault,
                UserId = category.UserId
            };
        }

        public async Task SeedDefaultCategoriesAsync()
        {
            if (await _context.Categories.AnyAsync()) return;

            var defaultCategories = new List<Category>
            {
                new Category { Name = "food", Color = "#ff4444", IsDefault = true, UserId = 1 },
                new Category { Name = "entertainment", Color = "#44ff44", IsDefault = true, UserId = 1 },
                new Category { Name = "transport", Color = "#ffff44", IsDefault = true, UserId = 1 },
                new Category { Name = "healthcare", Color = "#4444ff", IsDefault = true, UserId = 1 },
                new Category { Name = "rent", Color = "#ff44ff", IsDefault = true, UserId = 1 },
                new Category { Name = "shopping", Color = "#ff8844", IsDefault = true, UserId = 1 }
            };

            _context.Categories.AddRange(defaultCategories);
            await _context.SaveChangesAsync();
        }
    }
}
