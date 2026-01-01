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
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            using var con = _context.CreateConnection();

            // ✅ USER EXISTS CHECK
            var userExists = await con.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM UsersRegistration WHERE Id = @Id",
                new { Id = booking.UserId });

            if (userExists == 0)
                return BadRequest("Invalid UserId. User does not exist.");

            // ✅ PHOTOGRAPHER EXISTS CHECK
            var photographerExists = await con.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM UsersRegistration WHERE Id = @Id",
                new { Id = booking.PhotographerId });

            if (photographerExists == 0)
                return BadRequest("Invalid PhotographerId. Photographer does not exist.");

            var sql = @"
            INSERT INTO Bookings
            (
                UserId,
                PhotographerId,
                PackageId,
                EventCategory,
                EventDate,
                EventLocation,
                Notes,
                PackageName,
                CoverageDurationHours,
                EditedPhotos,
                RawFilesAvailable,
                Price,
                BookingStatus,
                PaymentStatus,
                CreatedAt
            )
            VALUES
            (
                @UserId,
                @PhotographerId,
                @PackageId,
                @EventCategory,
                @EventDate,
                @EventLocation,
                @Notes,
                @PackageName,
                @CoverageDurationHours,
                @EditedPhotos,
                @RawFilesAvailable,
                @Price,
                'Pending',
                'Unpaid',
                GETDATE()
            );
        ";

            await con.ExecuteAsync(sql, booking);

            return Ok(new { message = "Booking created successfully" });
        }


        /* ================= USER BOOKINGS ================= */
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBookings(int userId)
        {
            var sql = @"
                SELECT *
                FROM Bookings
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC
            ";

            using var con = _context.CreateConnection();
            var bookings = await con.QueryAsync<Booking>(sql, new { UserId = userId });

            return Ok(bookings);
        }

        /* ================= ADMIN ALL BOOKINGS ================= */
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var sql = @"
                SELECT *
                FROM Bookings
                ORDER BY CreatedAt DESC
            ";

            using var con = _context.CreateConnection();
            var bookings = await con.QueryAsync<Booking>(sql);

            return Ok(bookings);
        }
    }
}
