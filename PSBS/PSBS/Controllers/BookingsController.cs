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

            // 🚫 TIME OVERLAP CHECK
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

            // ✅ SET FINAL DATETIME
            booking.EventStartTime = startDateTime;
            booking.EventEndTime = endDateTime;

            var photographerName = await con.ExecuteScalarAsync<string>(
            "SELECT FullName FROM UsersRegistration WHERE Id = @Id",
            new { Id = booking.PhotographerId }
        );

            booking.PhotographerName = photographerName;

            // ✅ INSERT BOOKING + RETURN ID
            var sql = @"
                INSERT INTO Bookings
                (
                    UserId,
                    PhotographerId,
                    PhotographerName,
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
                    @PhotographerName,
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

                SELECT CAST(SCOPE_IDENTITY() as int);
            ";

            var bookingId = await con.ExecuteScalarAsync<int>(sql, booking);

            /* ================= NEW PART (SAFE ADDITION) ================= */

            // 🔹 GET USER FULL NAME
            var fullName = await con.ExecuteScalarAsync<string>(
                "SELECT FullName FROM UsersRegistration WHERE Id = @Id",
                new { Id = booking.UserId }
            );

            // 🔹 INSERT RECENT BOOKING ACTIVITY
            var activitySql = @"
                INSERT INTO RecentActivities
                (Message, ActivityType, CreatedAt, FullName, PhotographerId)
                VALUES
                (@Message, @ActivityType, GETDATE(), @FullName, @PhotographerId)
            ";

            await con.ExecuteAsync(activitySql, new
            {
                Message = $"New booking created for {booking.PackageName}",
                ActivityType = "Booking",
                FullName = fullName,
                PhotographerId = booking.PhotographerId
            });

            /* ================= END NEW PART ================= */

            return Ok(new
            {
                id = bookingId,
                message = "Booking created successfully"
            });
        }

        /* ================= UPDATE PAYMENT ================= */
        [HttpPut("payment/{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] PaymentDto dto)
        {
            using var con = _context.CreateConnection();

            var sql = @"
                UPDATE Bookings
                SET PaymentStatus = @PaymentStatus,
                    PaymentMethod = @PaymentMethod,
                    BookingStatus = CASE
                        WHEN @PaymentStatus = 'Paid' THEN 'Confirmed'
                        ELSE BookingStatus
                    END
                WHERE Id = @Id
            ";

            var rows = await con.ExecuteAsync(sql, new
            {
                Id = id,
                PaymentStatus = dto.PaymentStatus,
                PaymentMethod = dto.PaymentMethod
            });

            if (rows == 0)
                return NotFound("Booking not found.");

            return Ok(new
            {
                message = "Payment & booking status updated successfully"
            });
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


        /* ================= PUT : UPDATE BOOKING ================= */
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] Booking booking)
        {
            if (id <= 0)
                return BadRequest("Invalid booking id");

            var sql = @"
                UPDATE Bookings SET
                    BookingStatus = @BookingStatus,
                    PaymentStatus = @PaymentStatus
                WHERE Id = @Id
            ";

            using var connection = _context.CreateConnection();

            var affectedRows = await connection.ExecuteAsync(sql, new
            {
                Id = id,
                booking.BookingStatus,
                booking.PaymentStatus
            });

            if (affectedRows == 0)
                return NotFound("Booking not found");

            return Ok(new { message = "Booking updated successfully" });
        }

        /* ================= DELETE : DELETE BOOKING ================= */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid booking id");

            var sql = "DELETE FROM Bookings WHERE Id = @Id";

            using var connection = _context.CreateConnection();

            var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });

            if (affectedRows == 0)
                return NotFound("Booking not found");

            return Ok(new { message = "Booking deleted successfully" });
        }
    }

    /* ================= PAYMENT DTO ================= */
    public class PaymentDto
    {
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
