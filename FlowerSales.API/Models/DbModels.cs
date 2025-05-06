using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.EntityFrameworkCore;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.EntityFrameworkCore.Extensions;

namespace FlowerSales.API.Models;

public class StoreContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Category> Categories { get; init; }
    public DbSet<Product> Products { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>().ToCollection("categories");
        modelBuilder.Entity<Product>().ToCollection("products");
    }
}

public class ObjectIdConverter : JsonConverter<ObjectId>
{
    public override ObjectId Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        ObjectId.Parse(reader.GetString());

    public override void Write(Utf8JsonWriter writer, ObjectId value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString());
}

public record Category
{
    [BsonId]
    public required ObjectId Id { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }
}

public record Product
{
    [BsonId]
    public required ObjectId Id { get; set; }

    [BsonElement("category_id")]
    public required ObjectId CategoryId { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("store_location")]
    public required string StoreLocation { get; set; }

    [BsonElement("post_code")]
    public required string PostCode { get; set; }

    [BsonElement("price")]
    public double Price { get; set; }

    [BsonElement("is_available")]
    public bool IsAvailable { get; set; }
}
