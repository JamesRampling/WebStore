using System.Text.Json;

using FlowerSales.API.Models;

using Microsoft.OpenApi.Models;

using MongoDB.Bson;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        o.JsonSerializerOptions.Converters.Add(new ObjectIdConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FlowerSales", Version = "v1" });
    c.MapType<ObjectId>(() => new OpenApiSchema
    {
        Title = "ObjectId",
        Type = nameof(String)
    });
});

if (builder.Configuration["AppOrigin"] is not string appOrigin)
    throw new Exception("AppOrigin needs to be set in appsettings!");
if (builder.Configuration["MongoEndpoint"] is not string mongoEndpoint)
    throw new Exception("MongoEndpoint needs to be set in appsettings!");

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(appOrigin)
    .WithHeaders()));

builder.Services.AddMongoDB<StoreContext>(mongoEndpoint, "flowersales_db");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors();

app.MapControllers();

app.Run();
