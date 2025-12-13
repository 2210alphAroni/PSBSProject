using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using MailKit.Security;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // ✅ REGISTRATION EMAIL
    public async Task SendRegistrationEmail(string toEmail, string fullName, string role)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("Photography Booking", smtpSettings["UserName"]));
        email.To.Add(new MailboxAddress(fullName, toEmail));
        email.Subject = "Registration Successful";

        email.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Welcome {fullName}!</h2>
                <p>Your account has been successfully created.</p>
                <p><b>Registered As:</b> {role}</p>
                <p>Thank you for joining our Photography Service Booking System.</p>
                <br>
                <p>Regards,<br>PSBS Team</p>
            "
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            smtpSettings["Host"],
            int.Parse(smtpSettings["Port"]),
            SecureSocketOptions.StartTls
        );

        await smtp.AuthenticateAsync(
            smtpSettings["UserName"],
            smtpSettings["Password"]
        );

        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    // ✅ RESET PASSWORD EMAIL
    public async Task SendResetPasswordEmail(string toEmail, string fullName, string resetLink)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("PSBS Support", smtpSettings["UserName"]));
        email.To.Add(new MailboxAddress(fullName, toEmail));
        email.Subject = "Reset Your Password";

        email.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Hello {fullName},</h2>
                <p>You requested to reset your password.</p>
                <p>
                  <a href='{resetLink}' 
                     style='padding:10px 20px;background:#6a11cb;color:white;
                     text-decoration:none;border-radius:6px;'>
                     Reset Password
                  </a>
                </p>
                <p>This link is valid for 15 minutes.</p>
                <br>
                <p>Regards,<br>PSBS Team</p>
            "
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            smtpSettings["Host"],
            int.Parse(smtpSettings["Port"]),
            SecureSocketOptions.StartTls
        );

        await smtp.AuthenticateAsync(
            smtpSettings["UserName"],
            smtpSettings["Password"]
        );

        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
