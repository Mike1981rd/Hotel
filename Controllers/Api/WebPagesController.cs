using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hotel.Data;
using Hotel.Models;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace Hotel.Controllers.Api
{
    [Route("api/builder/websites/{websiteId}/pages")]
    [ApiController]
    [Authorize]
    public class WebPagesController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public WebPagesController(HotelDbContext context)
        {
            _context = context;
        }

        // Obtener los defaults de la plantilla (compartido con WebSitesController)
        private static object[] GetDefaultHomePageStructure(string templateId)
        {
            if (templateId == "default-hotel-template-v1")
            {
                return new object[]
                {
                    new {
                        id = "block_galeria_hero_1",
                        type = "GaleriaHeroPrincipal",
                        settings = new {
                            mainImageUrl = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                            mainImageAltText = "Vista principal del Hotel Elegance",
                            gridImage1Url = "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                            gridImage1AltText = "Habitación Deluxe",
                            gridImage2Url = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                            gridImage2AltText = "Lobby del Hotel",
                            gridImage3Url = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                            gridImage3AltText = "Vista de la Piscina",
                            gridImage4Url = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                            gridImage4AltText = "Restaurante Gourmet",
                            showViewAllPhotosButton = "true",
                            viewAllPhotosButtonText = "Ver todas las fotos",
                            viewAllPhotosButtonLink = "#galeria"
                        }
                    },
                    new {
                        id = "block_widget_busqueda_1",
                        type = "WidgetBuscadorDisponibilidad",
                        settings = new {
                            title = "Encuentra tu habitación perfecta",
                            arrivalDateLabel = "Fecha de entrada",
                            departureDateLabel = "Fecha de salida",
                            roomsLabel = "Alojamiento",
                            adultsLabel = "Adultos",
                            childrenLabel = "Niños",
                            searchButtonText = "Buscar Disponibilidad",
                            showPromoCodeField = "true",
                            promoCodeLabel = "Código Promocional"
                        }
                    },
                    new {
                        id = "block_listado_habitaciones_1",
                        type = "ListadoTiposHabitacion",
                        settings = new {
                            sectionTitle = "Nuestras Habitaciones Destacadas",
                            numberOfRoomsToShow = "3",
                            viewDetailsButtonText = "Ver Detalles y Servicios",
                            checkRatesButtonText = "Consultar Disponibilidad",
                            showLowRateIndicator = "true",
                            lowRateIndicatorText = "¡Mejor Precio Hoy!",
                            viewAllRoomsButtonText = "Ver Todas las Habitaciones",
                            viewAllRoomsButtonLink = "#todas-habitaciones"
                        }
                    },
                    new {
                        id = "block_texto_descriptivo_1",
                        type = "TextoDescriptivo",
                        settings = new {
                            title = "Acerca de Hotel Elegance",
                            content = "Ubicado en el corazón de la ciudad, Hotel Elegance se ha convertido en un ícono de hospitalidad desde su fundación en 1985. Con más de tres décadas de experiencia, combinamos la elegancia clásica con las comodidades modernas para ofrecer una experiencia inolvidable.\n\nNuestro compromiso con la excelencia se refleja en cada detalle: desde nuestras amplias habitaciones con vistas panorámicas, hasta nuestro galardonado restaurante que fusiona la cocina local con sabores internacionales. Cada espacio ha sido diseñado pensando en el confort y satisfacción de nuestros huéspedes.\n\nEn Hotel Elegance, no solo ofrecemos alojamiento, creamos recuerdos. Nuestro equipo de profesionales altamente capacitados está dedicado a hacer de su estancia una experiencia excepcional, atendiendo cada necesidad con calidez y eficiencia.",
                            textAlign = "left"
                        }
                    },
                    new {
                        id = "block_lista_comodidades_1",
                        type = "ListaComodidades",
                        settings = new {
                            sectionTitle = "Nuestras Comodidades",
                            columns = "3",
                            amenities = new[]
                            {
                                new { text = "Servicio de habitaciones 24/7", hasIcon = true },
                                new { text = "Wi-Fi de alta velocidad gratuito", hasIcon = true },
                                new { text = "Televisión por cable/satélite", hasIcon = true },
                                new { text = "Recepción abierta las 24 horas", hasIcon = true },
                                new { text = "Restaurante gourmet", hasIcon = true },
                                new { text = "Bar y lounge", hasIcon = true },
                                new { text = "Gimnasio totalmente equipado", hasIcon = true },
                                new { text = "Piscina al aire libre", hasIcon = true },
                                new { text = "Spa y centro de bienestar", hasIcon = true },
                                new { text = "Servicio de lavandería y tintorería", hasIcon = true },
                                new { text = "Estacionamiento gratuito", hasIcon = true },
                                new { text = "Servicio de conserjería", hasIcon = true },
                                new { text = "Centro de negocios", hasIcon = true },
                                new { text = "Salas de reuniones y eventos", hasIcon = true },
                                new { text = "Servicio de traslado al aeropuerto", hasIcon = true },
                                new { text = "Caja fuerte en habitaciones", hasIcon = true },
                                new { text = "Mini bar", hasIcon = true },
                                new { text = "Aire acondicionado", hasIcon = true }
                            }
                        }
                    },
                    new {
                        id = "block_faq_1",
                        type = "PreguntasFrecuentes",
                        settings = new {
                            sectionTitle = "Preguntas Frecuentes",
                            faqs = new[]
                            {
                                new { 
                                    question = "¿Cuál es el horario de check-in y check-out?", 
                                    answer = "El horario de check-in es a partir de las 3:00 PM y el check-out debe realizarse antes de las 12:00 PM. Si necesita horarios especiales, por favor contáctenos con anticipación.",
                                    isOpenByDefault = true 
                                },
                                new { 
                                    question = "¿Se admiten mascotas en el hotel?", 
                                    answer = "Sí, somos un hotel pet-friendly. Admitimos mascotas pequeñas (hasta 10 kg) con un cargo adicional de $25 por noche. Se requiere notificación previa al realizar la reserva.",
                                    isOpenByDefault = false 
                                },
                                new { 
                                    question = "¿Ofrecen servicio de traslado al aeropuerto?", 
                                    answer = "Sí, ofrecemos servicio de traslado desde y hacia el aeropuerto las 24 horas. El costo es de $35 por trayecto para hasta 4 personas. Debe reservarse con al menos 24 horas de anticipación.",
                                    isOpenByDefault = false 
                                },
                                new { 
                                    question = "¿El desayuno está incluido en la tarifa?", 
                                    answer = "Depende del tipo de tarifa que elija. Nuestras tarifas con desayuno incluido ofrecen un desayuno buffet completo de 6:30 AM a 10:30 AM. También puede añadir el desayuno por $20 por persona.",
                                    isOpenByDefault = false 
                                },
                                new { 
                                    question = "¿Cuáles son las políticas de cancelación?", 
                                    answer = "Las cancelaciones sin cargo pueden realizarse hasta 48 horas antes de la fecha de llegada. Las cancelaciones posteriores o no presentarse resultarán en el cargo de una noche de estadía.",
                                    isOpenByDefault = false 
                                },
                                new { 
                                    question = "¿Hay estacionamiento disponible?", 
                                    answer = "Sí, ofrecemos estacionamiento gratuito para todos nuestros huéspedes. Contamos con estacionamiento cubierto y al aire libre, con servicio de valet parking disponible durante el día.",
                                    isOpenByDefault = false 
                                }
                            }
                        }
                    },
                    new {
                        id = "block_mapa_ubicacion_1",
                        type = "MapaUbicacion",
                        settings = new {
                            sectionTitle = "Nuestra Ubicación",
                            mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718745!2d-73.98784368459415!3d40.75889794257668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1ses!2ses!4v1635959745738!5m2!1ses!2ses",
                            staticMapImageUrl = "",
                            staticMapImageAltText = "Ubicación de Hotel Elegance en el mapa",
                            addressText = "350 5th Avenue\nNew York, NY 10118\nEstados Unidos\n\nTeléfono: +1 (212) 736-3100\nEmail: info@hotelelegance.com",
                            mapHeight = "450px"
                        }
                    },
                    new {
                        id = "block_banner_promocional_1",
                        type = "BannerPromocional",
                        settings = new {
                            backgroundImageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            logoImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                            title = "Una Experiencia Única te Espera",
                            text = "Descubre el lujo y la comodidad en el corazón de la ciudad. Reserva ahora y obtén hasta un 20% de descuento en tu estadía.",
                            buttonText = "Reservar Ahora",
                            buttonLink = "#reservar",
                            overlayColor = "#000000",
                            overlayOpacity = "0.5",
                            contentAlignment = "center"
                        }
                    },
                    new {
                        id = "block_text_1",
                        type = "Text",
                        settings = new {
                            title = "Una experiencia única",
                            content = "<p>Disfruta de nuestras instalaciones de primer nivel, servicio personalizado y una ubicación privilegiada en el corazón de la ciudad. Nuestro hotel combina elegancia clásica con comodidades modernas.</p>",
                            alignment = "center",
                            containerWidth = "medium"
                        }
                    },
                    new {
                        id = "block_features_1",
                        type = "Features",
                        settings = new {
                            title = "Nuestros Servicios",
                            subtitle = "Todo lo que necesitas para una estadía perfecta",
                            columns = "3",
                            features = new[]
                            {
                                new {
                                    icon = "wifi",
                                    title = "WiFi Gratis",
                                    description = "Internet de alta velocidad en todas las áreas"
                                },
                                new {
                                    icon = "pool",
                                    title = "Piscina y Spa",
                                    description = "Relájate en nuestras instalaciones de bienestar"
                                },
                                new {
                                    icon = "restaurant",
                                    title = "Restaurante Gourmet",
                                    description = "Cocina internacional y local de primera calidad"
                                }
                            }
                        }
                    },
                    new {
                        id = "block_gallery_1",
                        type = "Gallery",
                        settings = new {
                            title = "Nuestras Instalaciones",
                            columns = "3",
                            images = new[]
                            {
                                new {
                                    url = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                                    alt = "Habitación Deluxe"
                                },
                                new {
                                    url = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                                    alt = "Lobby del Hotel"
                                },
                                new {
                                    url = "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                                    alt = "Vista Exterior"
                                }
                            }
                        }
                    }
                };
            }
            else if (templateId == "modern-minimalist-v1")
            {
                return new object[]
                {
                    new {
                        id = "block_hero_minimal_1",
                        type = "Hero",
                        settings = new {
                            title = "Simplicidad y Confort",
                            subtitle = "Descubre un nuevo concepto de hospitalidad minimalista",
                            backgroundImageUrl = "https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            buttonText = "Explorar",
                            buttonUrl = "#explore",
                            overlayOpacity = "0.3",
                            textAlignment = "left"
                        }
                    },
                    new {
                        id = "block_text_minimal_1",
                        type = "Text",
                        settings = new {
                            title = "Diseño Moderno",
                            content = "<p>Espacios limpios y contemporáneos que abrazan la simplicidad. Cada detalle ha sido cuidadosamente seleccionado para crear un ambiente de tranquilidad y sofisticación.</p>",
                            alignment = "left",
                            containerWidth = "narrow"
                        }
                    },
                    new {
                        id = "block_image_minimal_1",
                        type = "Image",
                        settings = new {
                            imageUrl = "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                            altText = "Interior minimalista del hotel",
                            caption = "Espacios que inspiran calma"
                        }
                    },
                    new {
                        id = "block_services_minimal_1",
                        type = "Services",
                        settings = new {
                            title = "Servicios Esenciales",
                            subtitle = "Todo lo necesario, nada superfluo",
                            columns = "2"
                        }
                    }
                };
            }
            return null;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WebPageListDto>>> GetWebPages(int websiteId)
        {
            var pages = await _context.WebPages
                .Where(p => p.WebSiteId == websiteId)
                .Select(p => new WebPageListDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    IsSystemPage = p.IsSystemPage,
                    PageType = p.PageType
                })
                .ToListAsync();

            return Ok(pages);
        }

        [HttpGet("{pageIdOrSlug}")]
        public async Task<ActionResult<WebPage>> GetWebPage(int websiteId, string pageIdOrSlug)
        {
            WebPage page = null;

            // Verificar si es un ID numérico
            if (int.TryParse(pageIdOrSlug, out int pageId))
            {
                page = await _context.WebPages
                    .FirstOrDefaultAsync(p => p.Id == pageId && p.WebSiteId == websiteId);
            }
            else
            {
                // Buscar por slug
                page = await _context.WebPages
                    .FirstOrDefaultAsync(p => p.Slug == pageIdOrSlug && p.WebSiteId == websiteId);
            }

            if (page == null)
            {
                return NotFound();
            }

            // Si es la página de inicio y PageStructureJson está vacío, devolver estructura por defecto
            if ((page.Slug == "home" || page.PageType == "HomePage") &&
                (string.IsNullOrWhiteSpace(page.PageStructureJson) || 
                 page.PageStructureJson == "[]" || 
                 page.PageStructureJson == "{}"))
            {
                // Obtener el sitio web para conocer la plantilla
                var website = await _context.WebSites.FirstOrDefaultAsync(w => w.Id == websiteId);
                
                if (website != null && !string.IsNullOrEmpty(website.SelectedThemeOrTemplateId))
                {
                    var defaultStructure = GetDefaultHomePageStructure(website.SelectedThemeOrTemplateId);
                    
                    if (defaultStructure != null)
                    {
                        // Crear una copia de la página para no modificar el original de la BD
                        var pageResponse = new
                        {
                            page.Id,
                            page.WebSiteId,
                            page.Title,
                            page.Slug,
                            page.PageType,
                            PageStructureJson = System.Text.Json.JsonSerializer.Serialize(defaultStructure),
                            page.SeoTitle,
                            page.SeoDescription,
                            page.IsSystemPage,
                            page.IsEnabled,
                            page.CreatedAt,
                            page.UpdatedAt
                        };
                        return Ok(pageResponse);
                    }
                }
            }

            return Ok(page);
        }

        [HttpPut("{pageId}")]
        public async Task<IActionResult> UpdateWebPage(int websiteId, int pageId, [FromBody] UpdateWebPageDto dto)
        {
            var page = await _context.WebPages
                .FirstOrDefaultAsync(p => p.Id == pageId && p.WebSiteId == websiteId);

            if (page == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(dto.Title))
                page.Title = dto.Title;

            if (!string.IsNullOrEmpty(dto.PageStructureJson))
                page.PageStructureJson = dto.PageStructureJson;

            if (dto.SeoTitle != null)
                page.SeoTitle = dto.SeoTitle;

            if (dto.SeoDescription != null)
                page.SeoDescription = dto.SeoDescription;

            page.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<WebPage>> CreateWebPage(int websiteId, [FromBody] CreateWebPageDto dto)
        {
            // Verificar que el sitio web existe
            var websiteExists = await _context.WebSites.AnyAsync(w => w.Id == websiteId);
            if (!websiteExists)
            {
                return BadRequest("Website not found");
            }

            // Verificar que el slug es único para este sitio web
            var slugExists = await _context.WebPages
                .AnyAsync(p => p.WebSiteId == websiteId && p.Slug == dto.Slug);

            if (slugExists)
            {
                return BadRequest("A page with this slug already exists");
            }

            var page = new WebPage
            {
                WebSiteId = websiteId,
                Title = dto.Title,
                Slug = dto.Slug,
                PageStructureJson = "[]",
                IsSystemPage = false,
                IsEnabled = true
            };

            _context.WebPages.Add(page);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWebPage), new { websiteId, pageIdOrSlug = page.Id }, page);
        }

        [HttpGet("{pageIdOrSlug}/default-structure")]
        public async Task<IActionResult> GetDefaultPageStructure(int websiteId, string pageIdOrSlug)
        {
            // Primero, obtener la página para conocer su tipo
            WebPage page = null;

            if (int.TryParse(pageIdOrSlug, out int pageId))
            {
                page = await _context.WebPages
                    .FirstOrDefaultAsync(p => p.Id == pageId && p.WebSiteId == websiteId);
            }
            else
            {
                page = await _context.WebPages
                    .FirstOrDefaultAsync(p => p.Slug == pageIdOrSlug && p.WebSiteId == websiteId);
            }

            if (page == null)
            {
                return NotFound("Page not found");
            }

            // Obtener el sitio web para conocer la plantilla
            var website = await _context.WebSites.FirstOrDefaultAsync(w => w.Id == websiteId);
            
            if (website == null)
            {
                return NotFound("Website not found");
            }

            // Si no tiene plantilla asignada, usar la default
            var templateId = string.IsNullOrEmpty(website.SelectedThemeOrTemplateId) 
                ? "default-hotel-template-v1" 
                : website.SelectedThemeOrTemplateId;

            // Obtener la estructura por defecto según el tipo de página
            object[] defaultStructure = null;

            if (page.PageType == "HomePage" || page.Slug == "home")
            {
                defaultStructure = GetDefaultHomePageStructure(templateId);
            }
            // En el futuro, aquí se podrían agregar más tipos de página:
            // else if (page.PageType == "RoomDetailPageTemplate") { ... }

            if (defaultStructure != null)
            {
                return Ok(new 
                { 
                    pageStructureJson = System.Text.Json.JsonSerializer.Serialize(defaultStructure) 
                });
            }

            // Si no hay defaults para este tipo de página, devolver array vacío
            return Ok(new 
            { 
                pageStructureJson = "[]" 
            });
        }

        [HttpDelete("{pageId}")]
        public async Task<IActionResult> DeleteWebPage(int websiteId, int pageId)
        {
            var page = await _context.WebPages
                .FirstOrDefaultAsync(p => p.Id == pageId && p.WebSiteId == websiteId);

            if (page == null)
            {
                return NotFound();
            }

            if (page.IsSystemPage)
            {
                return BadRequest("Cannot delete system pages");
            }

            _context.WebPages.Remove(page);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTOs
    public class WebPageListDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsSystemPage { get; set; }
        public string PageType { get; set; }
    }

    public class UpdateWebPageDto
    {
        public string Title { get; set; }
        public string PageStructureJson { get; set; }
        public string SeoTitle { get; set; }
        public string SeoDescription { get; set; }
    }

    public class CreateWebPageDto
    {
        public string Title { get; set; }
        public string Slug { get; set; }
    }
}