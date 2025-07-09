using Microsoft.AspNetCore.Mvc;
using NoMoney.Api.Services;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseService _expenseService;

        public ExpensesController(ExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        /// <summary>
        /// get all expenses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<ExpenseDto>>> GetExpenses()
        {
            var expenses = await _expenseService.GetAllExpensesAsync();
            return Ok(expenses);
        }

        /// <summary>
        /// get expenses by date
        /// </summary>
        [HttpGet("date/{date}")]
        public async Task<ActionResult<List<ExpenseDto>>> GetExpensesByDate(DateTime date)
        {
            var expenses = await _expenseService.GetExpensesByDateAsync(date);
            return Ok(expenses);
        }

        /// <summary>
        /// get expense by id
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
        {
            var expense = await _expenseService.GetExpenseByIdAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            return Ok(expense);
        }

        /// <summary>
        /// create new expense
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var expense = await _expenseService.CreateExpenseAsync(createDto);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }

        /// <summary>
        /// update expense
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var expense = await _expenseService.UpdateExpenseAsync(id, updateDto);
            if (expense == null)
            {
                return NotFound();
            }

            return Ok(expense);
        }

        /// <summary>
        /// delete expense
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var success = await _expenseService.DeleteExpenseAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
