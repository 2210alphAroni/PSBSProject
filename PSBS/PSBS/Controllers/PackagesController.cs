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

        // ================= GET ALL PACKAGES WITH ADD-ONS =================
        [HttpGet]
        public async Task<IActionResult> GetPackages()
        {
            var sql = @"
                SELECT
                    p.id,
                    p.package_name AS PackageName,
                    p.description,
                    p.coverage_duration_hours AS CoverageDurationHours,
                    p.max_edited_photos AS MaxEditedPhotos,
                    p.raw_files_available AS RawFilesAvailable,
                    p.base_price AS BasePrice,

                    a.id AS AddOnId,
                    a.addon_name AS AddOnName,
                    a.addon_price AS Price
                FROM Packages p
                LEFT JOIN PackageAddOns pa ON p.id = pa.package_id
                LEFT JOIN AddOns a ON pa.addon_id = a.id
                ORDER BY p.id;
            ";

            var packageDict = new Dictionary<int, Package>();

            using var connection = _context.CreateConnection();

            await connection.QueryAsync<Package, AddOn, Package>(
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

        // ================= ADD PACKAGE =================
        // ================= ADD PACKAGE =================
        [HttpPost]
        public async Task<IActionResult> AddPackage([FromBody] Package package)
        {
            var packageSql = @"
        INSERT INTO Packages
        (package_name, description, coverage_duration_hours, max_edited_photos, raw_files_available, base_price)
        VALUES
        (@PackageName, @Description, @CoverageDurationHours, @MaxEditedPhotos, @RawFilesAvailable, @BasePrice);
        SELECT CAST(SCOPE_IDENTITY() as int);
    ";

            using var connection = _context.CreateConnection();

            // 1️⃣ Insert package
            var newId = await connection.QuerySingleAsync<int>(packageSql, package);
            package.Id = newId;

            // 2️⃣ Insert recent activity (NEW)
            var activitySql = @"
            INSERT INTO RecentActivities
            (Message, FullName)
            VALUES
            (@Message, @FullName);
        ";

            await connection.ExecuteAsync(activitySql, new
            {
                Message = $"New package added: {package.PackageName}",
                FullName = "Admin",
                CreatedAt = DateTime.Now
            });

            return Ok(package);
        }



        // ================= UPDATE PACKAGE =================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(int id, [FromBody] Package package)
        {
            var sql = @"
                UPDATE Packages SET
                    package_name = @PackageName,
                    description = @Description,
                    coverage_duration_hours = @CoverageDurationHours,
                    max_edited_photos = @MaxEditedPhotos,
                    raw_files_available = @RawFilesAvailable,
                    base_price = @BasePrice
                WHERE id = @Id;
            ";

            package.Id = id;

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, package);

            return Ok("Package updated successfully");
        }

        // ================= DELETE PACKAGE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var sql = "DELETE FROM Packages WHERE id = @Id";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { Id = id });

            return Ok("Package deleted successfully");
        }
    }
}
