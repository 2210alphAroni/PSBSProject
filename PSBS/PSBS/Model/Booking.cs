namespace PSBS.Model
{
    public class Booking
    {
        public int Id { get; set; }

        // Foreign Keys
        public int UserId { get; set; }
        public int PhotographerId { get; set; }
        public int PackageId { get; set; }

        // Event Details
        public DateTime EventDate { get; set; }

        public DateTime? EventStartTime { get; set; }
        public DateTime? EventEndTime { get; set; }
        public string EventLocation { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Package Snapshot (for history)
        public string PackageName { get; set; } = string.Empty;
        public int CoverageDurationHours { get; set; }
        public int EditedPhotos { get; set; }
        public bool RawFilesAvailable { get; set; }
        public decimal Price { get; set; }

        // Status
        public string BookingStatus { get; set; } = "Pending";
        public string PaymentStatus { get; set; } = "Unpaid";

        // Audit
        public DateTime CreatedAt { get; set; }
    }
}
