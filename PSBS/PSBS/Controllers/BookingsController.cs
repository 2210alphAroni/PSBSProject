using Dapper;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly DapperContext _context;

        public BookingsController(DapperContext context)
        {
            _context = context;
        }

        /* ================= CREATE BOOKING ================= */
        [HttpPost]
        public async Task<IActionResult> CreateBooking(Booking booking)
        {
            var sql = @"
                INSERT INTO Bookings
                (PackageId, Category, Description, Duration, EditedPhotos, RawFiles,
                 EventDate, Location, Notes, Price)
                VALUES
                (@PackageId, @Category, @Description, @Duration, @EditedPhotos, @RawFiles,
                 @EventDate, @Location, @Notes, @Price)";

            await _context.CreateConnection().ExecuteAsync(sql, booking);

            return Ok(new { message = "Booking created successfully" });
        }

        /* ================= USER BOOKINGS ================= */
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBookings(int userId)
        {
            var sql = @"
                SELECT b.*, p.Name AS PackageName
                FROM Bookings b
                JOIN Packages p ON b.PackageId = p.Id
                WHERE b.UserId = @userId
                ORDER BY b.CreatedAt DESC";

            var bookings = await _context.CreateConnection()
                .QueryAsync(sql, new { userId });

            return Ok(bookings);
        }

        /* ================= ADMIN ALL BOOKINGS ================= */
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var sql = @"
                SELECT b.*, p.Name AS PackageName
                FROM Bookings b
                JOIN Packages p ON b.PackageId = p.Id
                ORDER BY b.CreatedAt DESC";

            var bookings = await _context.CreateConnection().QueryAsync(sql);
            return Ok(bookings);
        }
    }
}
