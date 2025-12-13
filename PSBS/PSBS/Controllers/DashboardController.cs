using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly DapperContext _context;

        public DashboardController(DapperContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardData()
        {
            using var connection = _context.CreateConnection();

            var user = await connection.QueryAsync<dynamic>(
                @"select RegisterAS ,count(*) as personCount from UsersRegistration group by RegisterAS");

            return Ok(new { message = "Data Get Successfully.", user });
        }
    }
}
