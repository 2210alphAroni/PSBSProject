using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersRegistrationController : ControllerBase
    {
        private DapperContext _dapperContext;
        private readonly EmailService _emailService;
        public UsersRegistrationController(DapperContext dapperContext, EmailService emailService)
        {
            _dapperContext = dapperContext;
            _emailService = emailService;
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var Register = await _dapperContext.CreateConnection().QueryAsync("select * from UsersRegistration");
                return Ok(Register);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Error = ex.Message
                });
            }
        }


        [HttpPost("post")]
        public async Task<IActionResult> CreateUser([FromBody] UsersRegistration Users)
        {
            if (Users == null)
                return BadRequest("Invalid user data.");

            try
            {
                using var connection = _dapperContext.CreateConnection();

                // CHECK FOR DUPLICATE EMAIL
                var emailExists = await connection.QuerySingleOrDefaultAsync<int>(
                    "SELECT COUNT(*) FROM UsersRegistration WHERE Email = @Email",
                    new { Users.Email });

                if (emailExists > 0)
                    return BadRequest(new { error = "Email already exists." });


                //  CHECK FOR DUPLICATE PHONE
                var phoneExists = await connection.QuerySingleOrDefaultAsync<int>(
                    "SELECT COUNT(*) FROM UsersRegistration WHERE Phone = @Phone",
                    new { Users.Phone });

                if (phoneExists > 0)
                    return BadRequest(new { error = "Phone number already exists." });


                // CHECK FOR DUPLICATE USERNAME
                var usernameExists = await connection.QuerySingleOrDefaultAsync<int>(
                    "SELECT COUNT(*) FROM UsersRegistration WHERE UserName = @UserName",
                    new { Users.UserName });

                if (usernameExists > 0)
                    return BadRequest(new { error = "Username already exists." });


                // INSERT NEW USER (SAFE)
                var query = @"
            INSERT INTO UsersRegistration
            (RegisterAS, FullName, Email, Phone, UserName, Password, ConfirmPassword, Gender, CreatedAT)
            VALUES
            (@RegisterAS, @FullName, @Email, @Phone, @UserName, @Password, @ConfirmPassword, @Gender, GETDATE());
        ";

                await connection.ExecuteAsync(query, Users);

                // ⭐ SEND EMAIL
                await _emailService.SendRegistrationEmail(
                Users.Email,
                Users.FullName,
                Users.RegisterAs
            );


                return Ok(new { Message = "User created successfully and email notification sent." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "An error occurred while processing your request.",
                    Error = ex.Message
                });
            }
        }


    }
}
