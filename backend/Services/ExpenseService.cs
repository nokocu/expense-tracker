using Microsoft.EntityFrameworkCore;
using NoMoney.Api.Data;
using NoMoney.Api.Models;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Services
{
    public class ExpenseService
    {
        private readonly NoMoneyDbContext _context;

        public ExpenseService(NoMoneyDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpenseDto>> GetAllExpensesAsync()
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Amount = e.Amount,
                    Description = e.Description,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    Date = e.Date,
                    UserId = e.UserId
                })
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<List<ExpenseDto>> GetExpensesByDateAsync(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.Date >= startDate && e.Date < endDate)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Amount = e.Amount,
                    Description = e.Description,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    Date = e.Date,
                    UserId = e.UserId
                })
                .OrderBy(e => e.Date)
                .ToListAsync();
        }

        public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null) return null;

            return new ExpenseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name,
                Date = expense.Date,
                UserId = expense.UserId
            };
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto createDto)
        {
            var expense = new Expense
            {
                Amount = createDto.Amount,
                Description = createDto.Description,
                CategoryId = createDto.CategoryId,
                Date = createDto.Date,
                UserId = 1 // hardcoded for demo
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            // reload with category
            await _context.Entry(expense)
                .Reference(e => e.Category)
                .LoadAsync();

            return new ExpenseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name,
                Date = expense.Date,
                UserId = expense.UserId
            };
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto updateDto)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null) return null;

            expense.Amount = updateDto.Amount;
            expense.Description = updateDto.Description;
            expense.CategoryId = updateDto.CategoryId;
            expense.Date = updateDto.Date;

            await _context.SaveChangesAsync();

            // reload category if changed
            await _context.Entry(expense)
                .Reference(e => e.Category)
                .LoadAsync();

            return new ExpenseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name,
                Date = expense.Date,
                UserId = expense.UserId
            };
        }

        public async Task<bool> DeleteExpenseAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
