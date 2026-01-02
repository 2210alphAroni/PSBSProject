using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;

[Route("api/[controller]")]
[ApiController]
public class UsersPasswordController : ControllerBase
{
    private readonly DapperContext _context;
    private readonly EmailService _emailService;

    public UsersPasswordController(DapperContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 1️⃣ FORGOT PASSWORD
    [HttpPost("forgot")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        using var connection = _context.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT * FROM UsersRegistration WHERE Email = @Email",
            new { request.Email });

        if (user == null)
            return BadRequest(new { error = "Email not found" });

        string token = Guid.NewGuid().ToString();
        DateTime expiry = DateTime.Now.AddMinutes(15);

        await connection.ExecuteAsync(
            @"UPDATE UsersRegistration 
              SET ResetToken = @Token, ResetTokenExpiry = @Expiry 
              WHERE Email = @Email",
            new { Token = token, Expiry = expiry, request.Email });

        string resetLink = $"http://localhost:4200/reset-password?token={token}";

        await _emailService.SendResetPasswordEmail(
            user.Email,
            user.FullName,
            resetLink
        );

        return Ok(new { message = "Reset link sent to your email." });
    }

    // 2️⃣ RESET PASSWORD
    [HttpPost("reset")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        using var connection = _context.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            @"SELECT * FROM UsersRegistration 
              WHERE ResetToken = @Token 
              AND ResetTokenExpiry > GETDATE()",
            new { request.Token });

        if (user == null)
            return BadRequest(new { error = "Invalid or expired token" });

        await connection.ExecuteAsync(
            @"UPDATE UsersRegistration 
              SET Password = @Password, ConfirmPassword = @Password,
                  ResetToken = NULL, ResetTokenExpiry = NULL
              WHERE Id = @Id",
            new { Password = request.NewPassword, Id = user.Id });

        return Ok(new { message = "Password reset successful" });
    }

    // 3️⃣ CHANGE PASSWORD (LOGGED-IN USER)
    [HttpPost("change")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        using var connection = _context.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            @"SELECT * FROM UsersRegistration 
          WHERE Id = @UserId AND Password = @CurrentPassword",
            new
            {
                request.UserId,
                request.CurrentPassword
            });

        if (user == null)
            return BadRequest(new { error = "Current password is incorrect" });

        await connection.ExecuteAsync(
            @"UPDATE UsersRegistration
          SET Password = @NewPassword,
              ConfirmPassword = @NewPassword
          WHERE Id = @UserId",
            new
            {
                request.NewPassword,
                request.UserId
            });

        return Ok(new { message = "Password changed successfully" });
    }

}

public class ForgotPasswordRequest
{
    public string? Email { get; set; }
}

public class ResetPasswordRequest
{
    public string? Token { get; set; }
    public string? NewPassword { get; set; }
}

public class ChangePasswordRequest
{
    public int UserId { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

