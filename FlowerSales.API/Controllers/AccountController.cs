using Asp.Versioning;

using FlowerSales.API.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FlowerSales.API.Controllers;

[EnableCors]
[ApiController]
[Route("/api/account")]
[ApiVersionNeutral]
public class AccountController : ControllerBase
{
    [HttpPost]
    [Authorize]
    [Route("logout")]
    public async Task<ActionResult> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return Ok();
    }
}
