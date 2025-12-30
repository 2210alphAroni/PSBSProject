using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotographerPortfolioController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly IWebHostEnvironment _env;

        public PhotographerPortfolioController(
            DapperContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =========================
        // GET : api/PhotographerPortfolio/by-category/{category}
        // =========================
        [HttpGet("by-category/{category}")]
        [Produces("application/json")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var sql = @"SELECT *
                FROM PhotographerPortfolio
                WHERE IsActive = 1
                AND LOWER(LTRIM(RTRIM(Category))) = LOWER(@Category)
                ORDER BY CreatedAt DESC";

            using var connection = _context.CreateConnection();
            var data = await connection.QueryAsync(sql, new
            {
                Category = category
            });

            return Ok(data);
        }


        // =========================
        // POST : api/PhotographerPortfolio
        // =========================
        [HttpPost]
        [Produces("application/json")]
        public async Task<IActionResult> Create(
            [FromForm] PhotographerPortfolioCreateDto model)
        {
            if (model.Image == null || model.Image.Length == 0)
                return BadRequest("Image is required");

            var uploadFolder = Path.Combine(
                _env.WebRootPath!, "uploads", "portfolio");

            Directory.CreateDirectory(uploadFolder);

            var imageName = Guid.NewGuid() + Path.GetExtension(model.Image.FileName);
            var filePath = Path.Combine(uploadFolder, imageName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await model.Image.CopyToAsync(stream);
            }

            var imageUrl =
                $"{Request.Scheme}://{Request.Host}/uploads/portfolio/{imageName}";

            var sql = @"INSERT INTO PhotographerPortfolio
                        (PhotographerId, Title, Category, Description, ImageName, ImageUrl)
                        VALUES
                        (@PhotographerId, @Title, @Category, @Description, @ImageName, @ImageUrl)";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new
            {
                PhotographerId = 1, // TODO: from JWT
                model.Title,
                model.Category,
                model.Description,
                ImageName = imageName,
                ImageUrl = imageUrl
            });

            return Ok(new { message = "Portfolio uploaded successfully" });
        }

        // =========================
        // PUT : api/PhotographerPortfolio/{id}
        // =========================
        [HttpPut("{id}")]
        [Produces("application/json")]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] PhotographerPortfolioUpdateDto model)
        {
            string? imageName = null;
            string? imageUrl = null;

            if (model.Image != null)
            {
                var uploadFolder = Path.Combine(
                    _env.WebRootPath!, "uploads", "portfolio");

                Directory.CreateDirectory(uploadFolder);

                imageName = Guid.NewGuid() + Path.GetExtension(model.Image.FileName);
                var filePath = Path.Combine(uploadFolder, imageName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.Image.CopyToAsync(stream);
                }

                imageUrl =
                    $"{Request.Scheme}://{Request.Host}/uploads/portfolio/{imageName}";
            }

            var sql = @"UPDATE PhotographerPortfolio
                        SET Title = @Title,
                            Category = @Category,
                            Description = @Description,
                            ImageName = ISNULL(@ImageName, ImageName),
                            ImageUrl = ISNULL(@ImageUrl, ImageUrl),
                            UpdatedAt = GETDATE()
                        WHERE Id = @Id";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                model.Title,
                model.Category,
                model.Description,
                ImageName = imageName,
                ImageUrl = imageUrl
            });

            return Ok(new { message = "Portfolio updated successfully" });
        }

        // =========================
        // DELETE : api/PhotographerPortfolio/{id}
        // =========================
        [HttpDelete("{id}")]
        [Produces("application/json")]
        public async Task<IActionResult> Delete(int id)
        {
            var sql = @"UPDATE PhotographerPortfolio
                        SET IsActive = 0,
                            UpdatedAt = GETDATE()
                        WHERE Id = @Id";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { Id = id });

            return Ok(new { message = "Portfolio deleted successfully" });
        }
    }

    public class PhotographerPortfolioUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile Image { get; set; } = null!;
    }

    public class PhotographerPortfolioCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }
}
