namespace PSBS.Model
{
    public class UsersRegistration
    {
        public string RegisterAs { get; set; }
        public int Id { get; set; }           
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Gender { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
