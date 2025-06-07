using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Hotel.Controllers
{
    [Authorize]
    public class ClientsController : Controller
    {
        public IActionResult Index()
        {
            ViewData["Title"] = "Clientes";
            return View();
        }
    }
}