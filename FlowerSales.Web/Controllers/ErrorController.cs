using Microsoft.AspNetCore.Mvc;

namespace FlowerSales.Web.Controllers;

public class ErrorController : Controller
{
    public IActionResult Status(int code) => View(code switch
    {
        404 => "PageNotFound",
        _ => throw new NotImplementedException(),
    });

    public IActionResult PageNotFound() {
        Response.StatusCode = 404;
        return View();
    }
}
