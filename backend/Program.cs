using Microsoft.EntityFrameworkCore;
using NoMoney.Api.Data;
using NoMoney.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// add cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// add entity framework
builder.Services.AddDbContext<NoMoneyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// add custom services
builder.Services.AddScoped<ExpenseService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<StatisticsService>();

var app = builder.Build();

// configure the http request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();

// ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NoMoneyDbContext>();
    context.Database.EnsureCreated();
    
    // seed default categories
    var categoryService = scope.ServiceProvider.GetRequiredService<CategoryService>();
    await categoryService.SeedDefaultCategoriesAsync();
}

app.Run();
