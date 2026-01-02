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

            // ❗ REQUIRED TIME VALIDATION
            if (booking.EventStartTime == null)
                return BadRequest("Event start time is required.");

            if (booking.CoverageDurationHours <= 0)
                return BadRequest("Invalid package duration.");

            // 🧠 CALCULATE START & END DATETIME
            var startDateTime = booking.EventDate.Date
                                .Add(booking.EventStartTime.Value.TimeOfDay);

            var endDateTime = startDateTime
                                .AddHours(booking.CoverageDurationHours);

            // 🚫 TIME OVERLAP CHECK (CORE LOGIC)
            var conflictSql = @"
        SELECT COUNT(1)
        FROM Bookings
        WHERE PhotographerId = @PhotographerId
        AND BookingStatus != 'Rejected'
        AND EventStartTime < @NewEnd
        AND EventEndTime > @NewStart
    ";

            var conflict = await con.ExecuteScalarAsync<int>(conflictSql, new
            {
                booking.PhotographerId,
                NewStart = startDateTime,
                NewEnd = endDateTime
            });

            if (conflict > 0)
                return Conflict("Photographer is already booked in this time slot.");

            // ✅ INSERT BOOKING
            var sql = @"
        INSERT INTO Bookings
        (
            UserId,
            PhotographerId,
            PackageId,
            EventDate,
            EventStartTime,
            EventEndTime,
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
            @EventDate,
            @EventStartTime,
            @EventEndTime,
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

            booking.EventStartTime = startDateTime;
            booking.EventEndTime = endDateTime;

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


        /* ================= CHECK PHOTOGRAPHER AVAILABILITY ================= */
        [HttpGet("check-availability")]
        public async Task<IActionResult> CheckAvailability(
    int photographerId,
    DateTime eventDate,
    TimeSpan startTime,
    int durationHours)
        {
            using var con = _context.CreateConnection();

            var newStart = eventDate.Date.Add(startTime);
            var newEnd = newStart.AddHours(durationHours);

            var sql = @"
        SELECT COUNT(1)
        FROM Bookings
        WHERE PhotographerId = @PhotographerId
        AND BookingStatus != 'Rejected'
        AND EventStartTime < @NewEnd
        AND EventEndTime > @NewStart
    ";

            var conflict = await con.ExecuteScalarAsync<int>(sql, new
            {
                PhotographerId = photographerId,
                NewStart = newStart,
                NewEnd = newEnd
            });

            return Ok(new
            {
                isAvailable = conflict == 0
            });
        }

    }
}
