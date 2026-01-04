namespace PSBS.Model
{
    public class ReviewRating
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PhotographerId { get; set; }
        public int BookingId { get; set; }
        public int Rating { get; set; }
        public string? ReviewComment { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
