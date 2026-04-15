using Auth.API.Endpoints;
using Auth.API.Infrastructure.Data;
using Auth.API.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Auth.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<UserDbContext>(opt =>
  opt.UseSqlite("Data Source=app.db")
);

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    db.Database.EnsureCreated();
}

app.MapBasicAuthEndpoints();
app.UseHttpsRedirection();

app.Run();

