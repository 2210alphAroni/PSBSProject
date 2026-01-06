using Microsoft.AspNetCore.Mvc;
using Dapper;
using PSBS.Context;
using PSBS.Model;

[ApiController]
[Route("api/[controller]")]
public class UsersProfileController : ControllerBase
{
    private readonly DapperContext _context;

    public UsersProfileController(DapperContext context)
    {
        _context = context;
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] UserVM data)
    {
        try
        {
            if (data.image == null || data.image.Length == 0)
                return BadRequest("No image");

            var folder = Path.Combine("wwwroot/profile-images");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(data.image.FileName);
            var path = Path.Combine(folder, fileName);

            using var stream = new FileStream(path, FileMode.Create);
            await data.image.CopyToAsync(stream);

            var imageUrl = $"/profile-images/{fileName}";

            using var con = _context.CreateConnection();
            await con.ExecuteAsync(
                "UPDATE Users SET ProfileImage=@img WHERE Id=@id",
                new { img = imageUrl, id = data.userId }
            );

            return Ok(new { imageUrl });
        }
        catch (Exception)
        {

            throw;
        }
       
    }
}
