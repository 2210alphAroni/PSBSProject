using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSBS.Context;
using PSBS.Model;

namespace PSBS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController : ControllerBase
    {
        private readonly DapperContext _context;

        public PackagesController(DapperContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPackages()
        {
            var sql = @"
            SELECT p.*, a.AddOnName 
            FROM Packages p
            LEFT JOIN PackageAddOns a ON p.Id = a.PackageId";

            var dict = new Dictionary<int, Package>();

            var result = await _context.CreateConnection()
                .QueryAsync<Package, string, Package>(
                    sql,
                    (pkg, addon) =>
                    {
                        if (!dict.TryGetValue(pkg.Id, out var current))
                        {
                            current = pkg;
                            current.AddOns = new List<string?>();
                            dict.Add(pkg.Id, current);
                        }
                        if (addon != null)
                            current.AddOns.Add(addon);
                        return current;
                    },
                    splitOn: "AddOnName"
                );

            return Ok(dict.Values);
        }

        [HttpPost]
        public async Task<IActionResult> AddPackage(Package package)
        {
            // Insert Package + AddOns
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(int id, Package package)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            return Ok();
        }
    }
}
