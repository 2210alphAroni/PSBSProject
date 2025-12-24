namespace PSBS.Model
{
    public class Package
    {
        public int Id { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CoverageDurationHours { get; set; }
        public int MaxEditedPhotos { get; set; }
        public bool RawFilesAvailable { get; set; }
        public decimal BasePrice { get; set; }
        public List<AddOn> AddOns { get; set; } = new();
    }

}
