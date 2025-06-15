using Asp.Versioning;

using FlowerSales.API.Models;

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace FlowerSales.API.Controllers;

[EnableCors]
[ApiController]
[Route("/api/store")]
[ApiVersion("2")]
public class ProductControllerV2 : ProductController
{
    public ProductControllerV2(StoreContext context) : base(context) {}

    override protected IQueryable<Product> ProductView { get => _context.Products.Where(prod => prod.IsAvailable); }
}
