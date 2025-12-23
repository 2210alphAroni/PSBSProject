namespace PSBS.Model
{
    public class Booking
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int PackageId { get; set; }

        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Duration { get; set; }
        public string? EditedPhotos { get; set; }
        public bool RawFiles { get; set; }

        public DateTime EventDate { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }

        public decimal Price { get; set; }

        public string? BookingStatus { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
