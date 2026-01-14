using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PSBS.Context;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// Add services to the Bkashhhh.
builder.Services.AddHttpClient<PSBS.Services.BKashService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// =========================
// ADD SERVICES
// =========================

builder.Services.AddControllers()
    .AddNewtonsoftJson();

builder.Services.AddEndpointsApiExplorer();

// =========================
// SWAGGER + JWT
// =========================

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PSBS API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// =========================
// DEPENDENCY INJECTION
// =========================

builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddSignalR();

//Bkashshsss
builder.Services.AddScoped<PSBS.Services.IBKashService,
    PSBS.Services.BKashService>();


// =========================
// CORS
// =========================

builder.Services.AddCors(options =>
{
    options.AddPolicy("SpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// =========================
// JWT CONFIG
// =========================

var jwtSection = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSection["Key"]
    ?? throw new Exception("JWT Key missing");

var jwtIssuer = jwtSection["Issuer"]
    ?? throw new Exception("JWT Issuer missing");

var jwtAudience = jwtSection["Audience"]
    ?? throw new Exception("JWT Audience missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
});

// =========================
// BUILD APP
// =========================

var app = builder.Build();

// =========================
// ENSURE wwwroot EXISTS
// =========================

if (string.IsNullOrEmpty(builder.Environment.WebRootPath))
{
    builder.Environment.WebRootPath =
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
}

// =========================
// MIDDLEWARE PIPELINE
// =========================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PSBS API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// =========================
// 🔥 STATIC FILES (THIS FIXES IMAGE LOADING)
// =========================

// Serve wwwroot normally
app.UseStaticFiles();

// Explicitly serve /uploads/*
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")
    ),
    RequestPath = "/uploads"
});

// =========================
// CORS + AUTH
// =========================

app.UseCors("SpecificOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
