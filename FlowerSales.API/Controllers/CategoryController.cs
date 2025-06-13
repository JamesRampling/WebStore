using System.Collections.Frozen;

using FlowerSales.API.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using MongoDB.Bson;

namespace FlowerSales.API.Controllers;

[EnableCors]
[ApiController]
[Route("/api/store")]
public class CategoryController : ControllerBase
{
    private readonly StoreContext _context;

    public CategoryController(StoreContext context)
    {
        _context = context;
        _context.Database.EnsureCreated();
    }

    [HttpGet]
    [Route("categories")]
    public IEnumerable<Category> GetCategories([FromQuery] string? name = null)
    {
        return _context.Categories.AsQueryable()
            .Where(category => string.IsNullOrWhiteSpace(name) || category.Name.Contains(name));
    }

    [HttpGet]
    [Route("category/{id}")]
    public async Task<ActionResult<Category>> GetCategory(ObjectId id)
    {
        var cat = await _context.Categories.FindAsync(id);
        return cat is not null ? Ok(cat) : NotFound();
    }

    [HttpPost]
    [Authorize]
    [Route("category")]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] CategoryRequest req)
    {
        var cat = new Category
        {
            Id = ObjectId.GenerateNewId(),
            Name = req.Name,
        };

        var res = _context.Categories.Add(cat);
        await _context.SaveChangesAsync();

        var e = res.Entity;
        return CreatedAtAction(nameof(GetCategory), new { id = e.Id }, e);
    }

    [HttpPut]
    [Authorize]
    [Route("category/{id}")]
    public async Task<ActionResult<Category>> UpdateCategory(ObjectId id, [FromBody] CategoryRequest req)
    {
        var cat = await _context.Categories.FindAsync(id);
        if (cat is null) return NotFound();

        cat.Name = req.Name;

        await _context.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpDelete]
    [Authorize]
    [Route("category/{id}")]
    public async Task<ActionResult> DeleteCategory(ObjectId id)
    {
        var cat = await _context.Categories.FindAsync(id);
        if (cat is null) return NotFound();

        _context.Categories.Remove(cat);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
