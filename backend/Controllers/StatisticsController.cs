using Microsoft.AspNetCore.Mvc;
using NoMoney.Api.Services;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly StatisticsService _statisticsService;

        public StatisticsController(StatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// get monthly statistics
        /// </summary>
        [HttpGet("monthly/{year}/{month}")]
        public async Task<ActionResult<MonthlyStatsDto>> GetMonthlyStats(int year, int month)
        {
            if (month < 1 || month > 12)
            {
                return BadRequest("month must be between 1 and 12");
            }

            var stats = await _statisticsService.GetMonthlyStatsAsync(year, month);
            return Ok(stats);
        }

        /// <summary>
        /// get daily expenses for a month
        /// </summary>
        [HttpGet("daily/{year}/{month}")]
        public async Task<ActionResult<List<DailyExpenseDto>>> GetDailyExpenses(int year, int month)
        {
            if (month < 1 || month > 12)
            {
                return BadRequest("month must be between 1 and 12");
            }

            var dailyExpenses = await _statisticsService.GetDailyExpensesAsync(year, month);
            return Ok(dailyExpenses);
        }
    }
}
