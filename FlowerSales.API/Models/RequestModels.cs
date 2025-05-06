using MongoDB.Bson;

namespace FlowerSales.API.Models;

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
