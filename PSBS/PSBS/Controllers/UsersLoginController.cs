using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersLoginController : ControllerBase
    {
        private readonly DapperContext _context;

        public UsersLoginController(DapperContext context)
        {
            _context = context;
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
    }

    public class LoginRequest
    {
        public string emailOruserName { get; set; }
        public string Password { get; set; }
    }

}
