using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using Dapper;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhotographerDashboardController : ControllerBase
    {

        private readonly DapperContext _context;

        public PhotographerDashboardController(DapperContext context)
        {
            _context = context;
        }

        // Dashboard stats by photographer
        [HttpGet("dashboard-stats/{photographerId}")]
        public async Task<IActionResult> GetDashboardStats(int photographerId)
        {
            using var con = _context.CreateConnection();

            var sql = @"
            SELECT
    COUNT(*) AS TotalBookings,

    SUM(
        CASE 
            WHEN BookingStatus = 'Pending' THEN 1 
            ELSE 0 
        END
    ) AS PendingBookings,

    ISNULL(
        SUM(
            CASE
                WHEN PaymentStatus IN ('InProgress', 'Paid')
                     AND BookingStatus = 'Confirmed'
                THEN Price
                ELSE 0
            END
        ), 
    0) AS TotalEarnings

FROM Bookings
WHERE PhotographerId = @PhotographerId;

        ";

            var stats = await con.QueryFirstAsync(sql, new { PhotographerId = photographerId });

            return Ok(stats);
        }


        // RECENT BOOKINGS BY PHOTOGRAPHER
        [HttpGet("recent-bookings/{photographerId}")]
        public async Task<IActionResult> GetRecentBookings(int photographerId)
        {
            using var con = _context.CreateConnection();

            var sql = @"
            SELECT TOP 5
                b.Id,
                u.FullName AS ClientName,
                b.EventDate,
                b.PackageName,
                b.BookingStatus AS Status
            FROM Bookings b
            INNER JOIN UsersRegistration u ON b.UserId = u.Id
            WHERE b.PhotographerId = @PhotographerId
            ORDER BY b.CreatedAt DESC
        ";

            var bookings = await con.QueryAsync(sql, new { PhotographerId = photographerId });
            return Ok(bookings);
        }


        // RECENT Activities BY PHOTOGRAPHER
        [HttpGet("recent-activity/{photographerId}")]
        public async Task<IActionResult> GetRecentActivity(int photographerId)
        {
            if (photographerId <= 0)
                return BadRequest("Invalid photographer id");

            using var con = _context.CreateConnection();

            // ✅ Today range (server time)
            var today = DateTime.Today;          // 00:00 today
            var tomorrow = today.AddDays(1);     // 00:00 next day

            var sql = @"
        SELECT TOP 5
            Message,
            ActivityType,
            CreatedAt
        FROM RecentActivities
        WHERE PhotographerId = @PhotographerId
          AND CreatedAt >= @Today
          AND CreatedAt < @Tomorrow
        ORDER BY CreatedAt DESC
    ";

            var activities = await con.QueryAsync(sql, new
            {
                PhotographerId = photographerId,
                Today = today,
                Tomorrow = tomorrow
            });

            return Ok(activities);
        }

    }
}
