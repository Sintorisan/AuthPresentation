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

builder.Services.AddCors(opt =>
    {
        opt.AddPolicy("Frontend", policy =>
        {
            policy
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin()
            // .WithOrigins("http://localhost:5173")
            // .AllowCredentials()
            ;
        });
    });

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<JwtService>();

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

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.MapBasicAuthEndpoints();
app.MapJwtAuthEndpoints();

app.Run();

