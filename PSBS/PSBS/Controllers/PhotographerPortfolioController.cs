using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;

namespace PSBS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PhotographerPortfolioController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly IWebHostEnvironment _env;

        public PhotographerPortfolioController(DapperContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ===============================
        // GET ALL (Photographer Dashboard)
        // ===============================
        [HttpGet]
        public async Task<IActionResult> GetAll(int photographerId)
        {
            var sql = @"SELECT *
                FROM PhotographerPortfolio
                WHERE IsActive = 1
                AND PhotographerId = @PhotographerId
                ORDER BY CreatedAt DESC";

            using var con = _context.CreateConnection();
            var data = await con.QueryAsync(sql, new { PhotographerId = photographerId });
            return Ok(data);
        }

        // ===============================
        // GET BY CATEGORY (FRONTEND ONLY)
        // ===============================
        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var sql = @"SELECT * FROM PhotographerPortfolio
                        WHERE IsActive = 1
                        AND IsApproved = 1
                        AND Category = @Category
                        ORDER BY CreatedAt DESC";

            using var con = _context.CreateConnection();
            var data = await con.QueryAsync(sql, new { Category = category });
            return Ok(data);
        }


        // GET BY PHOTOGRAPHER + CATEGORY
        // (INDIVIDUAL PORTFOLIO PAGE)
        // ===============================
        [HttpGet("by-photographer")]
                public async Task<IActionResult> GetByPhotographer(
            int photographerId,
            string category)
                {
                    var sql = @"
                SELECT *
                FROM PhotographerPortfolio
                WHERE IsActive = 1
                AND IsApproved = 1
                AND PhotographerId = @PhotographerId
                AND Category = @Category
                ORDER BY CreatedAt DESC";

                    using var con = _context.CreateConnection();
                    var data = await con.QueryAsync(sql, new
                    {
                        PhotographerId = photographerId,
                        Category = category
                    });

                    return Ok(data);
                }

        // ===============================
        // CREATE (UPLOAD → PENDING)
        // ===============================
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] PhotographerPortfolioCreateDto model)
        {
            // ✅ CATEGORY VALIDATION (SECURITY)
            string[] allowedCategories =
            {
                "Wedding",
                "Reception",
                "Birthday",
                "Corporate",
                "Pre-wedding",
                "Baby",
                "Product",
                "Fashion"
            };

            if (!allowedCategories.Any(c =>
                c.Equals(model.Category, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest("Invalid category selected");
            }

            // ✅ IMAGE SAVE
            var folder = Path.Combine(_env.WebRootPath!, "uploads/portfolio");
            Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(model.Image!.FileName);
            var path = Path.Combine(folder, fileName);

            using var fs = new FileStream(path, FileMode.Create);
            await model.Image.CopyToAsync(fs);

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/portfolio/{fileName}";

            // ✅ INSERT AS PENDING (IsApproved = 0)
            var sql = @"INSERT INTO PhotographerPortfolio
                        (
                            PhotographerId,
                            Title,
                            Category,
                            Description,
                            ImageName,
                            ImageUrl,
                            IsActive,
                            IsApproved
                        )
                        VALUES
                        (
                            @PhotographerId,
                            @Title,
                            @Category,
                            @Description,
                            @ImageName,
                            @ImageUrl,
                            1,
                            0
                        )";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new
            {
                PhotographerId = model.photographerId,
                model.Title,
                model.Category,
                model.Description,
                ImageName = fileName,
                ImageUrl = imageUrl
            });

            return Ok(new { message = "Uploaded successfully. Waiting for admin approval." });
        }

        // ===============================
        // UPDATE (Photographer)
        // ===============================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] PhotographerPortfolioUpdateDto model)
        {
            var sql = @"UPDATE PhotographerPortfolio
                        SET Title=@Title,
                            Category=@Category,
                            Description=@Description,
                            IsApproved = 0
                        WHERE Id=@Id";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new
            {
                Id = id,
                model.Title,
                model.Category,
                model.Description
            });

            return Ok(new { message = "Updated. Needs re-approval." });
        }

        // ===============================
        // DELETE (SOFT)
        // ===============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sql = @"UPDATE PhotographerPortfolio
                        SET IsActive = 0
                        WHERE Id = @Id";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new { Id = id });

            return Ok();
        }

        // ===============================
        // ADMIN: GET PENDING
        // ===============================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var sql = @"SELECT * FROM PhotographerPortfolio
                        WHERE IsActive = 1
                        AND IsApproved = 0
                        ORDER BY CreatedAt DESC";

            using var con = _context.CreateConnection();
            var data = await con.QueryAsync(sql);
            return Ok(data);
        }

        // ===============================
        // ADMIN: APPROVE
        // ===============================
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var sql = @"UPDATE PhotographerPortfolio
                        SET IsApproved = 1
                        WHERE Id = @Id";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new { Id = id });
            return Ok();
        }

        // ===============================
        // ADMIN: REJECT
        // ===============================
        [HttpPut("reject/{id}")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RejectReason))
                return BadRequest("Reject reason required");

            var sql = @"UPDATE PhotographerPortfolio
                SET 
                    IsApproved = -1,
                    RejectReason = @RejectReason,
                    UpdatedAt = GETDATE()
                WHERE Id = @Id
                AND IsActive = 1";

            using var con = _context.CreateConnection();
            var rows = await con.ExecuteAsync(sql, new
            {
                Id = id,
                RejectReason = dto.RejectReason
            });

            if (rows == 0)
                return NotFound("Portfolio not found");

            return Ok(new { message = "Portfolio rejected" });
        }
    }

    // ===============================
    // DTOs
    // ===============================
    public class PhotographerPortfolioUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

    public class PhotographerPortfolioCreateDto
    {
        public int photographerId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

    public class RejectDto
    {
        public string? RejectReason { get; set; }
    }

}
