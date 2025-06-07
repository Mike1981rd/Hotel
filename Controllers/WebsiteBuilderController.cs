using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hotel.Controllers
{
    [Authorize]
    public class WebsiteBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}