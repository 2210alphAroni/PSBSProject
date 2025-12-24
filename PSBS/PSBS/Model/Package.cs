namespace PSBS.Model
{
    public class Package
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Numeric values (easy calculations)
        public int CoverageDurationHours { get; set; }
        public int MaxEditedPhotos { get; set; }

        // Availability (not selection)
        public bool RawFilesAvailable { get; set; }

        public decimal BasePrice { get; set; }

        // Navigation (Add-ons relationship)
        public List<AddOn> AddOns { get; set; } = new();
    }
}
