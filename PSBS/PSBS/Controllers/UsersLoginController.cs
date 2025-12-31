using Dapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
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
                @"SELECT 
                    Id,
                    FullName,
                    UserName,
                    Email,
                    Phone,
                    Gender,
                    CreatedAt,
                    RegisterAS
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

            // ⭐ PhotographerId বের করা
            int? photographerId = null;
            if (user.RegisterAS == "Photographer")
            {
                photographerId = await connection.ExecuteScalarAsync<int?>(
                    "SELECT PhotographerId FROM Photographers WHERE UserId = @UserId",
                    new { UserId = user.Id }
                );
            }

            var token = GenerateJwtToken(user, photographerId);

            return Ok(new
            {
                token,
                photographerId,
                user = new
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    UserName = user.UserName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Gender = user.Gender,
                    CreatedAt = user.CreatedAt,
                    RegisterAS = user.RegisterAS
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
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token);
            }
            catch
            {
                return Unauthorized(new { error = "Invalid Google token" });
            }

            using var connection = _context.CreateConnection();

            var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT 
                    Id,
                    FullName,
                    UserName,
                    Email,
                    Phone,
                    Gender,
                    CreatedAt,
                    RegisterAS
                FROM UsersRegistration
                WHERE Email = @Email",
                new { Email = payload.Email });

            if (user == null)
            {
                var newId = await connection.ExecuteScalarAsync<int>(
                    @"INSERT INTO UsersRegistration 
                      (FullName, Email, UserName, RegisterAS, CreatedAt)
                      VALUES 
                      (@FullName, @Email, @UserName, 'Client', GETDATE());
                      SELECT CAST(SCOPE_IDENTITY() AS INT);",
                    new
                    {
                        FullName = payload.Name,
                        Email = payload.Email,
                        UserName = payload.Email.Split('@')[0]
                    });

                user = new
                {
                    Id = newId,
                    FullName = payload.Name,
                    Email = payload.Email,
                    RegisterAS = "Client"
                };
            }

            int? photographerId = null;
            if (user.RegisterAS == "Photographer")
            {
                photographerId = await connection.ExecuteScalarAsync<int?>(
                    "SELECT PhotographerId FROM Photographers WHERE UserId = @UserId",
                    new { UserId = user.Id }
                );
            }

            var token = GenerateJwtToken(user, photographerId);

            return Ok(new
            {
                token,
                photographerId,
                user = new
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    RegisterAS = user.RegisterAS
                }
            });
        }

        // ================= JWT TOKEN =================
        private string GenerateJwtToken(dynamic user, int? photographerId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.RegisterAS ?? "Client")
            };

            if (!string.IsNullOrEmpty((string?)user.Email))
                claims.Add(new Claim(ClaimTypes.Email, user.Email));

            // ⭐ Photographer হলে PhotographerId token এ যাবে
            if (user.RegisterAS == "Photographer" && photographerId != null)
            {
                claims.Add(new Claim("PhotographerId", photographerId.ToString()));
            }

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

        [Authorize]
        [HttpDelete("delete-my-account")]
        public async Task<IActionResult> DeleteMyAccount()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token");

            int userId = int.Parse(userIdClaim);

            using var connection = _context.CreateConnection();

            var rows = await connection.ExecuteAsync(
                "DELETE FROM UsersRegistration WHERE Id = @UserId",
                new { UserId = userId }
            );

            if (rows == 0)
                return BadRequest("User not found");

            return Ok("Account deleted successfully");
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
