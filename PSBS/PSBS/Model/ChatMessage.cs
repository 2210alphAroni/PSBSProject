namespace PSBS.Model
{
    public class ChatMessage
    {
        public string? User { get; set; }   // Client / Admin
        public string? Message { get; set; }
        public bool IsAdmin { get; set; }
    }
}
