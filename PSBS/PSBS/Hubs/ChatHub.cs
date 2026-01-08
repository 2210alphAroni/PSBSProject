using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message, bool isAdmin)
    {
        // Send original message
        await Clients.All.SendAsync("ReceiveMessage", user, message, isAdmin);

        // Auto reply only for client
        if (!isAdmin)
        {
            var reply = GetAutoReply(message.ToLower());

            await Task.Delay(700); // human-like delay

            await Clients.All.SendAsync(
                "ReceiveMessage",
                "Support Agent",
                reply,
                true
            );
        }
    }

    // -------------------------------------------------
    private string GetAutoReply(string msg)
    {
        // Greetings
        if (msg.Contains("hi") || msg.Contains("hello") || msg.Contains("assalam"))
            return "Hello 👋 Welcome to our Photography Booking Service. How can I help you today?";

        // Booking flow
        if (msg.Contains("booking flow") || msg.Contains("how to book"))
            return "📸 Booking Flow:\n1️⃣ Create account\n2️⃣ Select package\n3️⃣ Choose date & time\n4️⃣ Confirm photographer\n5️⃣ Make payment\n6️⃣ Get invoice & booking confirmation.";

        // Book
        if (msg.Contains("book"))
            return "📸 You can book a service by selecting a package, choosing a date, and completing payment online.";

        // Total packages
        if (msg.Contains("how many package"))
            return "📦 We currently offer 8 photography packages tailored for different events.";

        // Specific packages & price
        if (msg.Contains("wedding"))
            return "💍 Wedding Photography – ৳45,000 (6 hours, up to 200 edited photos, raw files available).";

        if (msg.Contains("reception"))
            return "🎉 Reception Photography – ৳30,000 (4 hours, up to 150 edited photos, raw files available).";

        if (msg.Contains("birthday"))
            return "🎂 Birthday Event – ৳15,000 (3 hours, up to 100 edited photos, raw files not included).";

        if (msg.Contains("corporate"))
            return "🏢 Corporate Event – ৳25,000 (4 hours, up to 120 edited photos, raw files available).";

        if (msg.Contains("pre wedding"))
            return "💑 Pre-wedding Shoot – ৳20,000 (3 hours, up to 120 edited photos, raw files available).";

        if (msg.Contains("baby"))
            return "👶 Baby Shoot – ৳12,000 (2 hours, up to 80 edited photos, raw files not included).";

        if (msg.Contains("product"))
            return "🛍️ Product Photography – ৳10,000 (1 hour, up to 50 edited photos, raw files available).";

        if (msg.Contains("fashion"))
            return "👗 Fashion Photography – ৳28,000 (4 hours, up to 150 edited photos, raw files available).";

        // Packages / price general
        if (msg.Contains("package") || msg.Contains("price"))
            return "💼 Packages: Wedding, Reception, Birthday, Corporate, Pre-wedding, Baby, Product & Fashion Photography. Prices start from ৳10,000.";

        // Client account
        if (msg.Contains("client account") || msg.Contains("create account"))
            return "👤 Client Account: Click Sign Up → Enter name, email, phone & password → Login → Start booking services.";

        // Photographer account
        if (msg.Contains("photographer account") || msg.Contains("photographer signup"))
            return "📷 Photographer Account: Sign up as Photographer → Submit profile & portfolio → Admin approval → Set availability & receive bookings.";

        // Availability
        if (msg.Contains("available") || msg.Contains("date"))
            return "📅 Photographer availability is based on selected date & time. System shows only available slots during booking.";

        // Payment
        if (msg.Contains("payment") || msg.Contains("bkash") || msg.Contains("nagad") || msg.Contains("card"))
            return "💳 Payment Methods: bkash, Nagad & Card. Payment confirmation is instant.";

        // Invoice
        if (msg.Contains("invoice"))
            return "🧾 Invoice includes Invoice ID, Client name, Photographer, Package name, Event date, Price, Discount, Total & Payment status.";

        // Cancel / reschedule
        if (msg.Contains("cancel") || msg.Contains("reschedule"))
            return "🔁 You can cancel or reschedule bookings from booking history (based on admin policy).";

        // Photographer panel
        if (msg.Contains("photographer"))
            return "📷 Photographers can manage profile, upload portfolio, set availability, accept/reject bookings & chat with clients.";

        // Review
        if (msg.Contains("review") || msg.Contains("rating"))
            return "⭐ Clients can submit reviews & ratings after service completion.";

        // Admin
        if (msg.Contains("admin"))
            return "🛠️ Admin manages users, photographers, packages, bookings, payments, discounts & dashboard analytics.";

        // Default
        return "ℹ️ Thank you for your message. You may ask about packages, prices, booking flow, account creation or payment details.";
    }
}
