using System.ComponentModel.DataAnnotations;

namespace PSBS.Model
{
    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Subject { get; set; }

        [Required]
        public string? Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    
}
}
