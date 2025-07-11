using Microsoft.AspNetCore.Mvc;
using NoMoney.Api.Services;
using NoMoney.Api.DTOs;

namespace NoMoney.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// get all categories
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            // Debug logging to see what we're returning
            foreach (var cat in categories)
            {
                Console.WriteLine($"Category: {cat.Name}, IsDefault: {cat.IsDefault}, Id: {cat.Id}");
            }
            return Ok(categories);
        }

        /// <summary>
        /// get category by id
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }

        /// <summary>
        /// create new category
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
        {
            try
            {
                var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// update category
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
        {
            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
                if (category == null)
                {
                    return NotFound();
                }
                return Ok(category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// delete category
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// reset default categories (for debugging)
        /// </summary>
        [HttpPost("reset-defaults")]
        public async Task<ActionResult> ResetDefaultCategories()
        {
            await _categoryService.ResetDefaultCategoriesAsync();
            return Ok(new { message = "Default categories have been reset" });
        }
    }
}
