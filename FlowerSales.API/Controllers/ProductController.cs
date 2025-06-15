using Asp.Versioning;

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
[ApiVersion("1")]
public class ProductController : ControllerBase
{
    protected readonly StoreContext _context;
    protected virtual IQueryable<Product> ProductView { get => _context.Products; }

    public ProductController(StoreContext context)
    {
        _context = context;
        _context.Database.EnsureCreated();
    }

    [HttpGet]
    [Route("products")]
    public PaginatedResponse<Product> GetProducts([FromQuery] PaginationParams pagination, [FromQuery] ProductQueryParams query)
    {
        var filtered = ProductView.Where(query.Predicate());
        var count = filtered.Count();

        var paginated = filtered
            .Skip(pagination.Page * pagination.Items)
            .Take(pagination.Items);

        return new()
        {
            TotalPages = (int)Math.Ceiling((double)count / pagination.Items),
            Items = paginated,
        };
    }

    [HttpGet]
    [Route("product/{id}")]
    public async Task<ActionResult<Product>> GetProduct(ObjectId id)
    {
        var prod = await ProductView.FirstOrDefaultAsync(prod => prod.Id == id);
        return prod is not null ? Ok(prod) : NotFound();
    }

    [HttpPost]
    [Authorize]
    [Route("product")]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductRequest req)
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
    [Authorize]
    [Route("product/{id}")]
    public async Task<ActionResult<Product>> UpdateProduct(ObjectId id, [FromBody] ProductRequest req)
    {
        var prod = await ProductView.FirstOrDefaultAsync(prod => prod.Id == id);
        if (prod is null) return NotFound();

        prod.CategoryId = req.CategoryId;
        prod.Name = req.Name;
        prod.StoreLocation = req.StoreLocation;
        prod.PostCode = req.PostCode;
        prod.Price = req.Price;
        prod.IsAvailable = req.IsAvailable;

        await _context.SaveChangesAsync();
        return Ok(prod);
    }

    [HttpDelete]
    [Authorize]
    [Route("product/{id}")]
    public async Task<ActionResult> DeleteProduct(ObjectId id)
    {
        var prod = await ProductView.FirstOrDefaultAsync(prod => prod.Id == id);
        if (prod is null) return NotFound();

        _context.Products.Remove(prod);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
