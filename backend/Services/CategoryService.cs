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

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            // check if category name already exists
            if (await _context.Categories.AnyAsync(c => c.Name.ToLower() == createCategoryDto.Name.ToLower()))
            {
                throw new ArgumentException($"Category with name '{createCategoryDto.Name}' already exists.");
            }

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Color = createCategoryDto.Color,
                IsDefault = false,
                UserId = 1 // for now hardcode to user 1
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Color = category.Color,
                IsDefault = category.IsDefault,
                UserId = category.UserId
            };
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return null;

            // check if trying to change name of default category
            if (category.IsDefault && updateCategoryDto.Name != null && updateCategoryDto.Name != category.Name)
            {
                throw new InvalidOperationException("Cannot change the name of a default category.");
            }

            // check if new name already exists (if name is being changed)
            if (updateCategoryDto.Name != null && updateCategoryDto.Name != category.Name)
            {
                if (await _context.Categories.AnyAsync(c => c.Name.ToLower() == updateCategoryDto.Name.ToLower()))
                {
                    throw new ArgumentException($"Category with name '{updateCategoryDto.Name}' already exists.");
                }
                category.Name = updateCategoryDto.Name;
            }

            if (updateCategoryDto.Color != null)
            {
                category.Color = updateCategoryDto.Color;
            }

            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Color = category.Color,
                IsDefault = category.IsDefault,
                UserId = category.UserId
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;

            // cannot delete default categories
            if (category.IsDefault)
            {
                throw new InvalidOperationException("Cannot delete a default category.");
            }

            // check if category has expenses
            var hasExpenses = await _context.Expenses.AnyAsync(e => e.CategoryId == id);
            if (hasExpenses)
            {
                throw new InvalidOperationException("Cannot delete a category that has expenses.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
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
                new Category { Name = "shopping", Color = "#ff8844", IsDefault = true, UserId = 1 },
                new Category { Name = "other", Color = "#888888", IsDefault = true, UserId = 1 }
            };

            _context.Categories.AddRange(defaultCategories);
            await _context.SaveChangesAsync();
        }

        public async Task ResetDefaultCategoriesAsync()
        {
            // update existing categories to mark them as default if they match the default names
            var defaultNames = new[] { "food", "entertainment", "transport", "healthcare", "rent", "shopping", "other" };
            
            var existingCategories = await _context.Categories.ToListAsync();
            
            foreach (var category in existingCategories)
            {
                if (defaultNames.Contains(category.Name.ToLower()))
                {
                    category.IsDefault = true;
                }
            }
            
            await _context.SaveChangesAsync();
        }
    }
}
