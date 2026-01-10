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

    /* ================= REGISTRATION EMAIL ================= */
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
                <br>
                <p>Regards,<br>PSBS Team</p>
            "
        };

        await Send(email);
    }

    /* ================= RESET PASSWORD EMAIL ================= */
    public async Task SendResetPasswordEmail(string toEmail, string fullName, string resetLink)
    {
        var email = new MimeMessage();
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        email.From.Add(new MailboxAddress("PSBS Support", smtpSettings["UserName"]));
        email.To.Add(new MailboxAddress(fullName, toEmail));
        email.Subject = "Reset Your Password";

        email.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Hello {fullName},</h2>
                <p>You requested to reset your password.</p>
                <a href='{resetLink}'
                   style='padding:10px 20px;background:#6a11cb;color:white;
                   text-decoration:none;border-radius:6px;'>
                   Reset Password
                </a>
                <p>This link is valid for 15 minutes.</p>
                <br>
                <p>Regards,<br>PSBS Team</p>
            "
        };

        await Send(email);
    }

    /* ================= COMMON EMAIL (BOOKING, PAYMENT ETC.) ================= */
    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string receiverName = "")
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("PSBS Notifications", smtpSettings["UserName"]));
        email.To.Add(new MailboxAddress(receiverName, toEmail));
        email.Subject = subject;

        email.Body = new TextPart("html")
        {
            Text = htmlBody
        };

        await Send(email);
    }

    /* ================= PRIVATE SMTP SENDER ================= */
    private async Task Send(MimeMessage email)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

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
