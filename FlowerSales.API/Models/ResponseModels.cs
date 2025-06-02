namespace FlowerSales.API.Models;

public record PaginatedResponse<T>
{
    public required int TotalPages { get; set; }
    public required IEnumerable<T> Items { get; set; }
}
