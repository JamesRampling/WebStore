using System.Text.Json;

using Asp.Versioning;

using AspNetCore.Identity.Mongo;

using FlowerSales.API.Models;

using Microsoft.OpenApi.Models;

using MongoDB.Bson;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiVersioning(o =>
    {
        o.DefaultApiVersion = new ApiVersion(1);
        o.AssumeDefaultVersionWhenUnspecified = true;
        o.ApiVersionReader = new HeaderApiVersionReader("Version");
    })
    .AddMvc()
    .AddApiExplorer(o => o.GroupNameFormat = "'v'VVV");

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
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FlowerSales",
        Version = "v1",
        Description = "The regular flower sales API with all products.",
    });
    c.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "FlowerSales",
        Version = "v2",
        Description = "A variant of the flower sales API which only handles available products.",
    });

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
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint($"/swagger/v1/swagger.json", "FlowerSales.API V1");
        o.SwaggerEndpoint($"/swagger/v2/swagger.json", "FlowerSales.API V2");
    });
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
