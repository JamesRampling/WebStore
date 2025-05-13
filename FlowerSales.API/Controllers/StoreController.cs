using FlowerSales.API.Models;

using Microsoft.AspNetCore.Mvc;

using MongoDB.Bson;

namespace FlowerSales.API.Controllers;

[ApiController]
[Route("store")]
public class StoreAPIController : ControllerBase
{
    private readonly StoreContext _context;

    public StoreAPIController(StoreContext context)
    {
        _context = context;
        _context.Database.EnsureCreated();
    }

    [HttpGet]
    [Route("products")]
    public IEnumerable<Product> GetProducts([FromQuery] PaginationParams pagination, [FromQuery] ProductQueryParams query)
        => _context.Products.AsQueryable()
            .Where(query.Predicate())
            .Skip(pagination.Page * pagination.Items)
            .Take(pagination.Items);

    [HttpGet]
    [Route("product/{id}")]
    public async Task<ActionResult<Product>> GetProduct(ObjectId id)
    {
        var prod = await _context.Products.FindAsync(id);
        return prod is not null ? Ok(prod) : NotFound();
    }

    [HttpPost]
    [Route("product")]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductCreateRequest req)
    {
        var prod = new Product
        {
            Id = ObjectId.GenerateNewId(),
            CategoryId = req.CategoryId,
            Name = req.Name,
            StoreLocation = req.StoreLocation,
            PostCode = req.PostCode,
            Price = req.Price,
            IsAvailable = req.IsAvailable,
        };

        var res = _context.Products.Add(prod);
        await _context.SaveChangesAsync();

        var e = res.Entity;
        return CreatedAtAction(nameof(GetProduct), new { id = e.Id }, e);
    }

    [HttpPut]
    [Route("product/{id}")]
    public async Task<ActionResult<Product>> UpdateProduct(ObjectId id, [FromBody] ProductUpdateRequest req)
    {
        var prod = await _context.Products.FindAsync(id);
        if (prod is null) return NotFound();

        prod.CategoryId = req.CategoryId ?? prod.CategoryId;
        prod.Name = req.Name ?? prod.Name;
        prod.StoreLocation = req.StoreLocation ?? prod.StoreLocation;
        prod.PostCode = req.PostCode ?? prod.PostCode;
        prod.Price = req.Price ?? prod.Price;
        prod.IsAvailable = req.IsAvailable ?? prod.IsAvailable;

        await _context.SaveChangesAsync();
        return Ok(prod);
    }

    [HttpDelete]
    [Route("product/{id}")]
    public async Task<ActionResult> DeleteProduct(ObjectId id)
    {
        var prod = await _context.Products.FindAsync(id);
        if (prod is null) return NotFound();

        _context.Products.Remove(prod);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
