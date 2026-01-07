using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewRatingController : ControllerBase
    {
        private readonly DapperContext _context;

        public ReviewRatingController(DapperContext context)
        {
            _context = context;
        }

        // ================= ADD REVIEW =================
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewRating review)
        {
            try
            {
                if (review == null)
                    return BadRequest(new { message = "Review data is null" });

                if (review.UserId <= 0)
                    return BadRequest(new { message = "Invalid UserId" });

                if (review.PhotographerId <= 0)
                    return BadRequest(new { message = "Invalid PhotographerId" });

                if (review.Rating < 1 || review.Rating > 5)
                    return BadRequest(new { message = "Rating must be between 1 and 5" });

                var sql = @"
            INSERT INTO ReviewRatings
            (UserId, PhotographerId, Rating, ReviewComment, IsApproved, IsDeleted, CreatedAt)
            VALUES
            (@UserId, @PhotographerId, @Rating, @ReviewComment, 1, 0, GETDATE())
        ";

                using var connection = _context.CreateConnection();
                await connection.ExecuteAsync(sql, review);

                return Ok(new { message = "Review submitted successfully" });
            }
            catch (Exception ex)
            {
                // 🔥 THIS WILL SHOW REAL ERROR
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ================= GET REVIEWS BY PHOTOGRAPHER =================
        [HttpGet("photographer/{photographerId}")]
        public async Task<IActionResult> GetReviewsByPhotographer(int photographerId)
        {
            var sql = @"
                SELECT r.Id, r.Rating, r.ReviewComment, r.CreatedAt, u.FullName
                FROM ReviewRatings r
                JOIN UsersRegistration u ON r.UserId = u.Id
                WHERE r.PhotographerId = @PhotographerId
                  AND r.IsApproved = 1
                  AND r.IsDeleted = 0
                ORDER BY r.CreatedAt DESC
            ";

            using var connection = _context.CreateConnection();
            var reviews = await connection.QueryAsync(sql, new { PhotographerId = photographerId });

            return Ok(reviews);
        }

        // ================= GET AVERAGE RATING =================
        [HttpGet("average/{photographerId}")]
        public async Task<IActionResult> GetAverageRating(int photographerId)
        {
            var sql = @"
                SELECT 
                    ISNULL(AVG(CAST(Rating AS FLOAT)), 0) AS AverageRating,
                    COUNT(*) AS TotalReviews
                FROM ReviewRatings
                WHERE PhotographerId = @PhotographerId
                  AND IsApproved = 1
                  AND IsDeleted = 0
            ";

            using var connection = _context.CreateConnection();
            var data = await connection.QueryFirstAsync(sql, new { PhotographerId = photographerId });

            return Ok(data);
        }

        // ================= ADMIN: APPROVE REVIEW =================
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveReview(int id)
        {
            var sql = @"
                UPDATE ReviewRatings
                SET IsApproved = 1
                WHERE Id = @Id
            ";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { Id = id });

            return Ok(new { message = "Review approved" });
        }

        // ================= ADMIN: DELETE REVIEW =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var sql = @"
                UPDATE ReviewRatings
                SET IsDeleted = 1
                WHERE Id = @Id
            ";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { Id = id });

            return Ok(new { message = "Review deleted" });
        }
    }
}
