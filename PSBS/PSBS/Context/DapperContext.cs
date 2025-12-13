using Microsoft.Data.SqlClient;
using System.Data;

namespace PSBS.Context
{
    public class DapperContext
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public DapperContext(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection"); // Or your preferred connection string name
        }

        public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
    }
}
