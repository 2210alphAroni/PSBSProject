using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;
using Dapper;
using System.Data;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly DapperContext _context;

        public ContactController(DapperContext context)
        {
            _context = context;
        }

        // ================= CREATE CONTACT MESSAGE =================
        // POST: api/Contact
        [HttpPost]
        public async Task<IActionResult> CreateMessage([FromBody] ContactMessage model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sql = @"
                INSERT INTO ContactMessages (Name, Email, Subject, Message, CreatedAt)
                VALUES (@Name, @Email, @Subject, @Message, @CreatedAt);
            ";

            model.CreatedAt = DateTime.Now;

            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(sql, model);
            }

            return Ok(new
            {
                success = true,
                message = "Message sent successfully"
            });
        }

        // ================= GET ALL MESSAGES =================
        // GET: api/Contact
        [HttpGet]
        public async Task<IActionResult> GetAllMessages()
        {
            var sql = @"
                SELECT *
                FROM ContactMessages
                ORDER BY CreatedAt ASC;
            ";

            using (var connection = _context.CreateConnection())
            {
                var messages = await connection.QueryAsync<ContactMessage>(sql);
                return Ok(messages);
            }
        }

        // ================= GET MESSAGE BY ID =================
        // GET: api/Contact/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMessageById(int id)
        {
            var sql = @"
                SELECT *
                FROM ContactMessages
                WHERE Id = @Id;
            ";

            using (var connection = _context.CreateConnection())
            {
                var message = await connection.QueryFirstOrDefaultAsync<ContactMessage>(
                    sql, new { Id = id });

                if (message == null)
                    return NotFound(new { message = "Message not found" });

                return Ok(message);
            }
        }

        // ================= DELETE MESSAGE =================
        // DELETE: api/Contact/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var sql = "DELETE FROM ContactMessages WHERE Id = @Id";

            using (var connection = _context.CreateConnection())
            {
                var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });

                if (affectedRows == 0)
                    return NotFound(new { message = "Message not found" });

                return Ok(new
                {
                    success = true,
                    message = "Message deleted successfully"
                });
            }
        }
    }
}
