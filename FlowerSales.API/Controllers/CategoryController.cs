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
    public async Task<PaginatedResponse<Category>> GetCategories([FromQuery] PaginationParams pagination, [FromQuery] string? name = null)
    {
        var count = _context.Categories.CountAsync();
        var results = _context.Categories.AsQueryable()
            .Where(category => string.IsNullOrWhiteSpace(name) || category.Name.Contains(name))
            .Skip(pagination.Page * pagination.Items)
            .Take(pagination.Items);

        return new()
        {
            TotalPages = (int)Math.Ceiling((double)await count / pagination.Items),
            Items = results,
        };
    }

    [HttpGet]
    [Route("categories/{ids}")]
    public IEnumerable<Category> GetSpecificCategories(string ids)
    {
        // ideally this would be done by ASP.net but we'd need a custom binder
        var split = ids.Split(",").Select(id => ObjectId.Parse(id));
        return _context.Categories.AsQueryable().Where(category => split.Contains(category.Id));
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
