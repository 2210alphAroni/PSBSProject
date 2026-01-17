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

        // ================= GET ALL PACKAGES =================
        [HttpGet]
        public async Task<IActionResult> GetPackages()
        {
            var sql = @"
        SELECT
            id,
            package_name AS PackageName,
            description,
            coverage_duration_hours AS CoverageDurationHours,
            max_edited_photos AS MaxEditedPhotos,
            raw_files_available AS RawFilesAvailable,
            base_price AS BasePrice
        FROM Packages
        ORDER BY id;
    ";

            using var connection = _context.CreateConnection();

            var packages = await connection.QueryAsync<Package>(sql);

            return Ok(packages);
        }

        // new get method using id 
        // ================= GET PACKAGE BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPackageById(int id)
        {
            var sql = @"
        SELECT
            id,
            package_name AS PackageName,
            description,
            coverage_duration_hours AS CoverageDurationHours,
            max_edited_photos AS MaxEditedPhotos,
            raw_files_available AS RawFilesAvailable,
            base_price AS BasePrice
        FROM Packages
        WHERE id = @Id;
    ";

            using var connection = _context.CreateConnection();
            var package = await connection.QueryFirstOrDefaultAsync<Package>(sql, new { Id = id });

            if (package == null)
                return NotFound("Package not found");

            return Ok(package);
        }

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
