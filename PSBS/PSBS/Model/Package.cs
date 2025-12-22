namespace PSBS.Model
{
    public class Package
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Duration { get; set; }
        public string? EditedPhotos { get; set; }
        public bool RawFiles { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public required List<string?> AddOns { get; set; }
    }

}
