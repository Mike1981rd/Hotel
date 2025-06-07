using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Hotel.Data;
using Hotel.Models;

namespace Hotel.Controllers
{
    [Authorize]
    public class AdminController : Controller
    {
        private readonly HotelDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AdminController(HotelDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }
        public IActionResult Index()
        {
            // Temporalmente sin usar base de datos para probar
            return View();
        }

        // Acción de prueba simple
        public IActionResult Test()
        {
            ViewData["Message"] = "Esta es una página de prueba";
            return Content("Página de prueba funciona correctamente");
        }

        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult Rooms()
        {
            return View();
        }

        public IActionResult Guests()
        {
            return View();
        }

        public IActionResult Reservations()
        {
            return View();
        }

        public IActionResult MaterializeIndex()
        {
            return View();
        }

        public IActionResult ExactIndex()
        {
            return View();
        }

        // GET: Admin/Company
        public async Task<IActionResult> Company()
        {
            try
            {
                // Log para diagnóstico
                Console.WriteLine($"[AdminController.Company] Método llamado a las {DateTime.Now}");
                
                var company = await _context.Companies.FirstOrDefaultAsync();
                if (company == null)
                {
                    Console.WriteLine("[AdminController.Company] No se encontró empresa, creando nueva instancia");
                    company = new Company();
                }
                
                Console.WriteLine("[AdminController.Company] Retornando vista");
                return View(company);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AdminController.Company] ERROR: {ex.Message}");
                Console.WriteLine($"[AdminController.Company] StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        // POST: Admin/Company
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Company(Company model, IFormFile? logoFile)
        {
            // Remove website validation if empty
            if (string.IsNullOrWhiteSpace(model.Website))
            {
                model.Website = null;
                ModelState.Remove("Website");
            }
            
            if (ModelState.IsValid)
            {
                try
                {
                    // Handle logo upload
                    if (logoFile != null && logoFile.Length > 0)
                    {
                        var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "logos");
                        Directory.CreateDirectory(uploadsFolder);
                        
                        var uniqueFileName = Guid.NewGuid().ToString() + "_" + logoFile.FileName;
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                        
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await logoFile.CopyToAsync(fileStream);
                        }
                        
                        model.Logo = "/uploads/logos/" + uniqueFileName;
                    }

                    var existingCompany = await _context.Companies.FirstOrDefaultAsync();
                    if (existingCompany == null)
                    {
                        // Create new company
                        _context.Add(model);
                    }
                    else
                    {
                        // Update existing company
                        existingCompany.BusinessName = model.BusinessName;
                        existingCompany.RncOrId = model.RncOrId;
                        existingCompany.TradeName = model.TradeName;
                        existingCompany.Email = model.Email;
                        existingCompany.Website = model.Website;
                        existingCompany.Phone = model.Phone;
                        existingCompany.ElectronicBilling = model.ElectronicBilling;
                        existingCompany.Address = model.Address;
                        existingCompany.Province = model.Province;
                        existingCompany.Municipality = model.Municipality;
                        existingCompany.TaxRegime = model.TaxRegime;
                        existingCompany.Sector = model.Sector;
                        existingCompany.EmployeeCount = model.EmployeeCount;
                        existingCompany.Currency = model.Currency;
                        existingCompany.DecimalPrecision = model.DecimalPrecision;
                        existingCompany.DecimalSeparator = model.DecimalSeparator;
                        existingCompany.TimeZone = model.TimeZone;
                        existingCompany.Metric = model.Metric;
                        existingCompany.Weight = model.Weight;
                        existingCompany.OrderPrefix = model.OrderPrefix;
                        existingCompany.OrderSuffix = model.OrderSuffix;
                        existingCompany.UpdatedAt = DateTime.UtcNow;
                        
                        if (!string.IsNullOrEmpty(model.Logo))
                        {
                            existingCompany.Logo = model.Logo;
                        }
                        
                        _context.Update(existingCompany);
                    }
                    
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Los cambios se han guardado correctamente.";
                    return RedirectToAction(nameof(ExactIndex));
                }
                catch (DbUpdateException ex)
                {
                    TempData["ErrorMessage"] = "Error al guardar los cambios. Por favor intente nuevamente.";
                    ModelState.AddModelError("", "No se pudo guardar los cambios: " + ex.InnerException?.Message);
                }
                catch (Exception ex)
                {
                    TempData["ErrorMessage"] = "Ocurrió un error inesperado.";
                    ModelState.AddModelError("", "Error: " + ex.Message);
                }
            }
            
            return View(model);
        }
    }
}