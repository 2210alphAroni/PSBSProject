using System;
namespace PSBS.Model
{
    public class PhotographerPortfolio
    {
        public int Id { get; set; }
        public int PhotographerId { get; set; }
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? ImageName { get; set; }
        public string? ImageUrl { get; set; }
    }
}
