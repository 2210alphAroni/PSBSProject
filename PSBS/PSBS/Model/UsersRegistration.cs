using System;
using System.ComponentModel.DataAnnotations;

namespace PSBS.Model
{
    public class UsersRegistration
    {
        public int Id { get; set; }

        // Role: Photographer / Client
        [Required(ErrorMessage = "Register As is required.")]
        [StringLength(20, ErrorMessage = "Register As cannot exceed 20 characters.")]
        public string RegisterAs { get; set; }

        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, MinimumLength = 3,
            ErrorMessage = "Full name must be between 3 and 100 characters.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [RegularExpression(@"^\d{10,15}$",
            ErrorMessage = "Phone number must be between 10 and 15 digits.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, MinimumLength = 4,
            ErrorMessage = "Username must be at least 4 characters.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Confirm password is required.")]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Gender is required.")]
        public string Gender { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
