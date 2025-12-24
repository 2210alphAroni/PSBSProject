using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController : ControllerBase
    {
        private readonly DapperContext _context;

        public PackagesController(DapperContext context)
        {
            _context = context;
        }

        // ✅ GET ALL PACKAGES WITH ADD-ONS
        [HttpGet]
        public async Task<IActionResult> GetPackages()
        {
            var sql = @"
                SELECT
                    p.id,
                    p.package_name AS Name,
                    p.description,
                    p.coverage_duration_hours AS CoverageDurationHours,
                    p.max_edited_photos AS MaxEditedPhotos,
                    p.raw_files_available AS RawFilesAvailable,
                    p.base_price AS BasePrice,

                    a.id AS AddOnId,
                    a.addon_name AS Name,
                    a.addon_price AS Price
                FROM Packages p
                LEFT JOIN PackageAddOns pa ON p.id = pa.package_id
                LEFT JOIN AddOns a ON pa.addon_id = a.id
                ORDER BY p.id;
            ";

            var packageDict = new Dictionary<int, Package>();

            var packages = await _context.CreateConnection()
                .QueryAsync<Package, AddOn, Package>(
                    sql,
                    (pkg, addon) =>
                    {
                        if (!packageDict.TryGetValue(pkg.Id, out var current))
                        {
                            current = pkg;
                            current.AddOns = new List<AddOn>();
                            packageDict.Add(current.Id, current);
                        }

                        if (addon != null && addon.Id != 0)
                        {
                            current.AddOns.Add(addon);
                        }

                        return current;
                    },
                    splitOn: "AddOnId"
                );

            return Ok(packageDict.Values);
        }

        // ✅ ADD PACKAGE (without add-ons for now)
        [HttpPost]
        public async Task<IActionResult> AddPackage(Package package)
        {
            var sql = @"
                INSERT INTO Packages
                (package_name, description, coverage_duration_hours, max_edited_photos, raw_files_available, base_price)
                VALUES
                (@Name, @Description, @CoverageDurationHours, @MaxEditedPhotos, @RawFilesAvailable, @BasePrice);
            ";

            await _context.CreateConnection().ExecuteAsync(sql, package);
            return Ok("Package added successfully");
        }

        // ✅ UPDATE PACKAGE
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(int id, Package package)
        {
            var sql = @"
                UPDATE Packages SET
                    package_name = @Name,
                    description = @Description,
                    coverage_duration_hours = @CoverageDurationHours,
                    max_edited_photos = @MaxEditedPhotos,
                    raw_files_available = @RawFilesAvailable,
                    base_price = @BasePrice
                WHERE id = @Id;
            ";

            package.Id = id;
            await _context.CreateConnection().ExecuteAsync(sql, package);

            return Ok("Package updated successfully");
        }

        // ✅ DELETE PACKAGE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var sql = "DELETE FROM Packages WHERE id = @Id";
            await _context.CreateConnection().ExecuteAsync(sql, new { Id = id });

            return Ok("Package deleted successfully");
        }
    }
}
