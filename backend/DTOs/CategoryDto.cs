namespace NoMoney.Api.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public int UserId { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Color { get; set; }
    }
}
