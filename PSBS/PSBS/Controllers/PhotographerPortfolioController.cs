using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

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

        // ✅ GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sql = @"SELECT * FROM PhotographerPortfolio
                    WHERE IsActive = 1
                    ORDER BY CreatedAt DESC";

            using var con = _context.CreateConnection();
            var data = await con.QueryAsync(sql);
            return Ok(data);
        }

        // ✅ GET BY CATEGORY
        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var sql = @"SELECT * FROM PhotographerPortfolio
                    WHERE IsActive = 1
                    AND Category = @Category
                    ORDER BY CreatedAt DESC";

            using var con = _context.CreateConnection();
            var data = await con.QueryAsync(sql, new { Category = category });
            return Ok(data);
        }

        // ✅ CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] PhotographerPortfolioCreateDto model)
        {
            var folder = Path.Combine(_env.WebRootPath!, "uploads/portfolio");
            Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(model.Image!.FileName);
            var path = Path.Combine(folder, fileName);

            using var fs = new FileStream(path, FileMode.Create);
            await model.Image.CopyToAsync(fs);

            var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/portfolio/{fileName}";

            var sql = @"INSERT INTO PhotographerPortfolio
                    (PhotographerId, Title, Category, Description, ImageName, ImageUrl, IsActive)
                    VALUES (1,@Title,@Category,@Description,@ImageName,@ImageUrl,1)";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new
            {
                model.Title,
                model.Category,
                model.Description,
                ImageName = fileName,
                ImageUrl = imageUrl
            });

            return Ok();
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] PhotographerPortfolioUpdateDto model)
        {
            var sql = @"UPDATE PhotographerPortfolio
                    SET Title=@Title, Category=@Category, Description=@Description
                    WHERE Id=@Id";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new
            {
                Id = id,
                model.Title,
                model.Category,
                model.Description
            });

            return Ok();
        }

        // ✅ DELETE (SOFT)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sql = @"UPDATE PhotographerPortfolio SET IsActive=0 WHERE Id=@Id";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(sql, new { Id = id });

            return Ok();
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
