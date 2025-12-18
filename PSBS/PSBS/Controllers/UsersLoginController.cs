using Dapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PSBS.Context;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PSBS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersLoginController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly IConfiguration _config;

        public UsersLoginController(DapperContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ================= NORMAL LOGIN =================
        [HttpPost("auth")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request");

            using var connection = _context.CreateConnection();

            var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT Id, FullName, Email, RegisterAS
                  FROM UsersRegistration
                  WHERE (Email = @Value OR UserName = @Value)
                  AND Password = @Password",
                new
                {
                    Value = request.EmailOrUserName,
                    request.Password
                });

            if (user == null)
                return Unauthorized(new { error = "Invalid email/username or password" });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.RegisterAS
                }
            });
        }

        // ================= GOOGLE LOGIN =================
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Token))
                return BadRequest(new { error = "Google token missing" });

            GoogleJsonWebSignature.Payload payload;

            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[]
                    {
                        "501889184170-hvi2lbi392aonfl8iqihudbr9hqc2ldg.apps.googleusercontent.com"
                    }
                };

                payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token, settings);
            }
            catch
            {
                return Unauthorized(new { error = "Invalid Google token" });
            }

            using var connection = _context.CreateConnection();

            var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT Id, FullName, Email, RegisterAS
                  FROM UsersRegistration
                  WHERE Email = @Email",
                new { Email = payload.Email });

            if (user == null)
            {
                var newId = await connection.ExecuteScalarAsync<int>(
                    @"INSERT INTO UsersRegistration (FullName, Email, RegisterAS)
                      VALUES (@FullName, @Email, 'Client');
                      SELECT CAST(SCOPE_IDENTITY() AS INT);",
                    new
                    {
                        FullName = payload.Name,
                        Email = payload.Email
                    });

                user = new
                {
                    Id = newId,
                    FullName = payload.Name,
                    Email = payload.Email,
                    RegisterAS = "Client"
                };
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.RegisterAS
                }
            });
        }

        // ================= JWT TOKEN =================
        private string GenerateJwtToken(dynamic user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.RegisterAS)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(_config["Jwt:DurationInMinutes"])
                ),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // ================= DTOs =================
    public class LoginRequest
    {
        public string EmailOrUserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleLoginDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
