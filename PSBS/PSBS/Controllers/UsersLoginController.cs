using Dapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PSBS.Context;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersLoginController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly IConfiguration _config;


        public UsersLoginController(DapperContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("auth")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using var connection = _context.CreateConnection();

            var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT * FROM UsersRegistration 
              WHERE  (Email = @Value OR UserName = @Value)  
              AND Password = @Password",
                new { Value = request.emailOruserName, request.Password });

            if (user == null)
                return Unauthorized(new { error = "Invalid username/email or password!" });

            return Ok(new { message = "Login successful!", user });
        }

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
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(
                    Convert.ToDouble(_config["Jwt:DurationInMinutes"])
                ),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { "501889184170-hvi2lbi392aonfl8iqihudbr9hqc2ldg.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token, settings);

            // payload.Email, payload.Name
            // check if user exists
            // if not, create user
            // generate JWT

            return Ok(new
            {
                token = "d9F#7@kL2x!M8R0ZpW1sEoYH4TqC6bVJ"
            });
        }

    }

    public class GoogleLoginDto
    {
        public string? Token { get; set; }
    }
}



    public class LoginRequest
    {
        public required string? emailOruserName { get; set; }
        public  required string? Password { get; set; }
    }

