using Dapper;
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

                // for recent acctivity will show in admin dashboard after registration 
                await connection.ExecuteAsync(
                @"INSERT INTO RecentActivities (Message, ActivityType, FullName)
                 VALUES (@Message, @ActivityType, @FullName)",
                 new
                 {
                     Message = $"New {Users.RegisterAs} registered",
                     ActivityType = "User",
                     FullName = Users.FullName
                 });

                if (string.IsNullOrWhiteSpace(Users.RegisterAs))
                {
                    return BadRequest("User role is required.");
                }


                //  SEND EMAIL
                await _emailService.SendRegistrationEmail(
                Users.Email!,
                Users.FullName!,
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



        // For Add Users
        [HttpPost("add")]
        public async Task<IActionResult> AddUser([FromBody] AddUserDto user)
        {
            if (user == null)
                return BadRequest("Invalid user data.");

            try
            {
                using var connection = _dapperContext.CreateConnection();

                // CHECK DUPLICATE EMAIL
                var emailExists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM UsersRegistration WHERE Email = @Email",
                    new { user.Email });

                if (emailExists > 0)
                    return BadRequest(new { error = "Email already exists." });

                // INSERT USER (ADMIN)
                var query = @"
            INSERT INTO UsersRegistration
            (RegisterAS, FullName, Email, CreatedAT)
            VALUES
            (@RegisterAS, @FullName, @Email, GETDATE());
        ";

                await connection.ExecuteAsync(query, user);

                // INSERT RECENT ACTIVITY
                await connection.ExecuteAsync(
                    @"INSERT INTO RecentActivities (Message, ActivityType, FullName)
              VALUES (@Message, @ActivityType, @FullName)",
                    new
                    {
                        Message = $"Admin added a new {user.RegisterAs}",
                        ActivityType = "User",
                        FullName = user.FullName
                    });

                return Ok(new { message = "User added successfully by admin." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }



        // For update users
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(
    int id,
    [FromBody] UpdateUserDto user
)
        {
            if (user == null)
                return BadRequest("Invalid user data.");

            try
            {
                using var connection = _dapperContext.CreateConnection();

                var rows = await connection.ExecuteAsync(@"
            UPDATE UsersRegistration
            SET 
                FullName = @FullName,
                Email = @Email,
                RegisterAS = @RegisterAS
            WHERE Id = @Id",
                    new
                    {
                        Id = id,
                        user.FullName,
                        user.Email,
                        user.RegisterAs
                    });

                if (rows == 0)
                    return NotFound(new { error = "User not found." });

                return Ok(new { message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }



    // For Delete User
    [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                using var connection = _dapperContext.CreateConnection();

                var rows = await connection.ExecuteAsync(
                    "DELETE FROM UsersRegistration WHERE Id = @Id",
                    new { Id = id });

                if (rows == 0)
                    return NotFound(new { error = "User not found." });

                return Ok(new { message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


    }
}
