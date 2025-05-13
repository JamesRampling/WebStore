using System.ComponentModel.DataAnnotations;

using MongoDB.Bson;

namespace FlowerSales.API.Models;

public record PaginationParams
{
    [Range(0, int.MaxValue, ErrorMessage = "The page index must be non-negative.")]
    public int Page { get; set; } = 0;
    [Range(0, 100, ErrorMessage = "The number of items must be between {1} and {2}.")]
    public int Items { get; set; } = 10;
}

public record ProductQueryParams
{
    public ObjectId? CategoryId { get; set; }

    public string? Name { get; set; }
    public string? StoreLocation { get; set; }
    public string? PostCode { get; set; }

    public double? MinPrice { get; set; }
    public double? MaxPrice { get; set; }

    public bool? IsAvailable { get; set; }

    public Func<Product, bool> Predicate() => product => (
        (CategoryId is null || product.CategoryId == CategoryId) &&
        (string.IsNullOrWhiteSpace(Name) || product.Name.Contains(Name)) &&
        (string.IsNullOrWhiteSpace(StoreLocation) || product.StoreLocation.Contains(StoreLocation)) &&
        (string.IsNullOrWhiteSpace(PostCode) || product.StoreLocation.Contains(PostCode)) &&
        (MinPrice is null || product.Price >= MinPrice.Value) &&
        (MaxPrice is null || product.Price <= MaxPrice.Value) &&
        (IsAvailable is null || product.IsAvailable == IsAvailable)
    );
}

public record CategoryRequest
{
    public required string Name { get; set; }
}

public record ProductCreateRequest
{
    public required ObjectId CategoryId { get; set; }
    public required string Name { get; set; }
    public required string StoreLocation { get; set; }
    public required string PostCode { get; set; }
    public double Price { get; set; }
    public bool IsAvailable { get; set; }
}

public record ProductUpdateRequest
{
    public ObjectId? CategoryId { get; set; }
    public string? Name { get; set; }
    public string? StoreLocation { get; set; }
    public string? PostCode { get; set; }
    public double? Price { get; set; }
    public bool? IsAvailable { get; set; }
}
