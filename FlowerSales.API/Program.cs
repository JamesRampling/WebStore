using System.Text.Json;

using AspNetCore.Identity.Mongo;

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
        Type = "string",
        Description = "MongoDB ObjectId",
        Format = "hex",
        Pattern = "[0-9a-fA-F]{24}",
    });
});

if (builder.Configuration["AppOrigin"] is not string appOrigin)
    throw new Exception("AppOrigin needs to be set in appsettings!");
if (builder.Configuration["MongoEndpoint"] is not string mongoEndpoint)
    throw new Exception("MongoEndpoint needs to be set in appsettings!");

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(appOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

builder.Services.AddMongoDB<StoreContext>(mongoEndpoint, "flowersales_db");
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddMongoDbStores<ApplicationUser>(o => o.ConnectionString = mongoEndpoint);

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

app.MapControllers();
app.MapGroup("/api/account")
    .WithTags("Account")
    .MapIdentityApi<ApplicationUser>();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.Run();
