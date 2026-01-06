using Microsoft.AspNetCore.Mvc;
using MimeKit.Encodings;

namespace PSBS.Model
{
    public class UserVM
    {
        public IFormFile image { get; set; }
        public int userId { get; set; }
    }
}
