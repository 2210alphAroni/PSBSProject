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
            using var connection = _context.CreateConnection();

            // Prevent duplicate review per booking
            var existsSql = "SELECT COUNT(1) FROM ReviewRatings WHERE BookingId = @BookingId";
            var exists = await connection.ExecuteScalarAsync<int>(existsSql, new { review.BookingId });

            if (exists > 0)
                return BadRequest("Review already submitted for this booking");

            var sql = @"
                INSERT INTO ReviewRatings
                (UserId, PhotographerId, BookingId, Rating, ReviewComment)
                VALUES
                (@UserId, @PhotographerId, @BookingId, @Rating, @ReviewComment)
            ";

            await connection.ExecuteAsync(sql, review);

            return Ok(new { message = "Review submitted successfully" });
        }

        // ================= GET REVIEWS BY PHOTOGRAPHER =================
        [HttpGet("photographer/{photographerId}")]
        public async Task<IActionResult> GetReviewsByPhotographer(int photographerId)
        {
            var sql = @"
                SELECT r.*, u.FullName
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
                    ISNULL(AVG(CAST(Rating AS FLOAT)),0) AS AverageRating,
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

        // ================= CHECK ALREADY REVIEWED =================
        [HttpGet("exists/{bookingId}")]
        public async Task<IActionResult> ReviewExists(int bookingId)
        {
            var sql = "SELECT COUNT(1) FROM ReviewRatings WHERE BookingId = @BookingId";

            using var connection = _context.CreateConnection();
            var exists = await connection.ExecuteScalarAsync<int>(sql, new { BookingId = bookingId });

            return Ok(exists > 0);
        }

        // ================= ADMIN: APPROVE REVIEW =================
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveReview(int id)
        {
            var sql = @"
                UPDATE ReviewRatings
                SET IsApproved = 1,
                    UpdatedAt = GETDATE()
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
                SET IsDeleted = 1,
                    UpdatedAt = GETDATE()
                WHERE Id = @Id
            ";

            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(sql, new { Id = id });

            return Ok(new { message = "Review deleted" });
        }
    }
}
