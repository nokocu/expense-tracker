using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;
using ExpenseTracker.API.DTOs;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseDbContext _context;
        
        public ExpensesController(ExpenseDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Expenses.Include(e => e.Category).AsQueryable();
            
            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate.Value);
                
            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate.Value);
            
            var expenses = await query
                .OrderByDescending(e => e.Date)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Description = e.Description,
                    Amount = e.Amount,
                    Date = e.Date,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    CategoryColor = e.Category.Color
                })
                .ToListAsync();
                
            return Ok(expenses);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id);
                
            if (expense == null)
                return NotFound();
                
            var expenseDto = new ExpenseDto
            {
                Id = expense.Id,
                Description = expense.Description,
                Amount = expense.Amount,
                Date = expense.Date,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name,
                CategoryColor = expense.Category.Color
            };
            
            return Ok(expenseDto);
        }
        
        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto createDto)
        {
            var expense = new Expense
            {
                Description = createDto.Description,
                Amount = createDto.Amount,
                Date = createDto.Date,
                CategoryId = createDto.CategoryId,
                UserId = createDto.UserId
            };
            
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            
            // reload with category
            await _context.Entry(expense)
                .Reference(e => e.Category)
                .LoadAsync();
                
            var expenseDto = new ExpenseDto
            {
                Id = expense.Id,
                Description = expense.Description,
                Amount = expense.Amount,
                Date = expense.Date,
                CategoryId = expense.CategoryId,
                CategoryName = expense.Category.Name,
                CategoryColor = expense.Category.Color
            };
            
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expenseDto);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, CreateExpenseDto updateDto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound();
                
            expense.Description = updateDto.Description;
            expense.Amount = updateDto.Amount;
            expense.Date = updateDto.Date;
            expense.CategoryId = updateDto.CategoryId;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
                return NotFound();
                
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
