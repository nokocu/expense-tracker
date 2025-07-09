using Microsoft.EntityFrameworkCore;
using NoMoney.Api.Data;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Services
{
    public class StatisticsService
    {
        private readonly NoMoneyDbContext _context;

        public StatisticsService(NoMoneyDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyStatsDto> GetMonthlyStatsAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);
            var daysInMonth = DateTime.DaysInMonth(year, month);

            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.Date >= startDate && e.Date < endDate)
                .ToListAsync();

            var totalSpent = expenses.Sum(e => e.Amount);
            var dailyAverage = totalSpent / daysInMonth;

            var expensesByCategory = expenses
                .GroupBy(e => new { e.CategoryId, e.Category.Name, e.Category.Color })
                .Select(g => new CategoryExpenseDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryColor = g.Key.Color,
                    TotalAmount = g.Sum(e => e.Amount),
                    Percentage = totalSpent > 0 ? (g.Sum(e => e.Amount) / totalSpent) * 100 : 0
                })
                .OrderByDescending(c => c.TotalAmount)
                .ToList();

            return new MonthlyStatsDto
            {
                TotalSpent = totalSpent,
                DailyAverage = dailyAverage,
                ExpensesByCategory = expensesByCategory
            };
        }

        public async Task<List<DailyExpenseDto>> GetDailyExpensesAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.Date >= startDate && e.Date < endDate)
                .ToListAsync();

            var dailyExpenses = expenses
                .GroupBy(e => e.Date.Date)
                .Select(g => new DailyExpenseDto
                {
                    Date = g.Key,
                    TotalAmount = g.Sum(e => e.Amount),
                    Expenses = g.Select(e => new ExpenseDto
                    {
                        Id = e.Id,
                        Amount = e.Amount,
                        Description = e.Description,
                        CategoryId = e.CategoryId,
                        CategoryName = e.Category.Name,
                        Date = e.Date,
                        UserId = e.UserId
                    }).ToList()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return dailyExpenses;
        }
    }
}
