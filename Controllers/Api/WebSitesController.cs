using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hotel.Data;
using Hotel.Models;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;

namespace Hotel.Controllers.Api
{
    [Route("api/builder/websites")]
    [ApiController]
    [Authorize]
    public class WebSitesController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public WebSitesController(HotelDbContext context)
        {
            _context = context;
        }

        // Diccionario de plantillas con sus datos por defecto
        private static readonly Dictionary<string, TemplateDefaults> TemplateDefaultsData = new Dictionary<string, TemplateDefaults>
        {
            {
                "default-hotel-template-v1",
                new TemplateDefaults
                {
                    GlobalThemeSettings = new
                    {
                        logoUrl = "",
                        faviconUrl = "",
                        backgroundColor = "#ffffff",
                        textColor = "#333333",
                        accentColor = "#e91e63",
                        bodyFont = "Open Sans",
                        headingFont = "Playfair Display",
                        footerBackgroundColor = "#282A42",
                        footerTextColor = "#ffffff",
                        navbarStyle = "transparent"
                    },
                    HomePageStructure = new object[]
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
                    }
                }
            },
            {
                "modern-minimalist-v1",
                new TemplateDefaults
                {
                    GlobalThemeSettings = new
                    {
                        logoUrl = "",
                        faviconUrl = "",
                        backgroundColor = "#fafafa",
                        textColor = "#212121",
                        accentColor = "#00bcd4",
                        bodyFont = "Roboto",
                        headingFont = "Roboto",
                        footerBackgroundColor = "#f5f5f5",
                        footerTextColor = "#616161",
                        navbarStyle = "solid"
                    },
                    HomePageStructure = new object[]
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
                    }
                }
            }
        };

        private class TemplateDefaults
        {
            public object GlobalThemeSettings { get; set; }
            public object[] HomePageStructure { get; set; }
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentWebSite()
        {
            var webSite = await _context.WebSites.FirstOrDefaultAsync();

            if (webSite == null)
            {
                // Crear un sitio web por defecto con plantilla predefinida
                webSite = await CreateDefaultWebSiteWithTemplate();
            }
            else
            {
                // Verificar que tenga una plantilla asignada
                if (string.IsNullOrEmpty(webSite.SelectedThemeOrTemplateId))
                {
                    webSite.SelectedThemeOrTemplateId = "default-hotel-template-v1";
                    webSite.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                // Si tiene plantilla pero GlobalThemeSettingsJson está vacío, devolver los defaults de la plantilla
                if (!string.IsNullOrEmpty(webSite.SelectedThemeOrTemplateId) && 
                    (string.IsNullOrWhiteSpace(webSite.GlobalThemeSettingsJson) || 
                     webSite.GlobalThemeSettingsJson == "{}" || 
                     webSite.GlobalThemeSettingsJson == "[]"))
                {
                    if (TemplateDefaultsData.TryGetValue(webSite.SelectedThemeOrTemplateId, out var templateDefaults))
                    {
                        // Crear una copia del webSite para no modificar el original de la BD
                        var webSiteResponse = new
                        {
                            webSite.Id,
                            webSite.Name,
                            webSite.PrimaryDomain,
                            webSite.Subdomain,
                            webSite.IsEnabled,
                            webSite.SelectedThemeOrTemplateId,
                            GlobalThemeSettingsJson = JsonSerializer.Serialize(templateDefaults.GlobalThemeSettings),
                            webSite.CreatedAt,
                            webSite.UpdatedAt
                        };
                        return Ok(webSiteResponse);
                    }
                }
            }

            return Ok(webSite);
        }

        private async Task<WebSite> CreateDefaultWebSiteWithTemplate()
        {
            const string defaultTemplateId = "default-hotel-template-v1";
            
            // Obtener los defaults de la plantilla
            var templateDefaults = TemplateDefaultsData[defaultTemplateId];

            // Crear el WebSite con plantilla por defecto
            var webSite = new WebSite
            {
                Name = "Mi Hotel",
                SelectedThemeOrTemplateId = defaultTemplateId,
                GlobalThemeSettingsJson = JsonSerializer.Serialize(templateDefaults.GlobalThemeSettings),
                PrimaryDomain = "localhost",
                Subdomain = "www",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.WebSites.Add(webSite);
            await _context.SaveChangesAsync();

            // Crear página de inicio con estructura predefinida de la plantilla
            await CreateDefaultHomePageWithTemplate(webSite.Id, defaultTemplateId);

            return webSite;
        }

        private async Task CreateDefaultHomePageWithTemplate(int websiteId, string templateId)
        {
            // Obtener los defaults de la plantilla
            if (!TemplateDefaultsData.TryGetValue(templateId, out var templateDefaults))
            {
                return; // Si no existe la plantilla, no crear página
            }

            // Verificar si ya existe una página de inicio
            var existingHomePage = await _context.WebPages
                .FirstOrDefaultAsync(p => p.WebSiteId == websiteId && p.Slug == "home");

            if (existingHomePage == null)
            {
                var homePage = new WebPage
                {
                    WebSiteId = websiteId,
                    Title = "Inicio",
                    Slug = "home",
                    PageType = "HomePage",
                    PageStructureJson = JsonSerializer.Serialize(templateDefaults.HomePageStructure),
                    SeoTitle = "Hotel Elegance - Inicio",
                    SeoDescription = "Bienvenido a Hotel Elegance. Donde el lujo se encuentra con la comodidad en el corazón de la ciudad.",
                    IsSystemPage = false,
                    IsEnabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.WebPages.Add(homePage);
                await _context.SaveChangesAsync();
            }
        }

        [HttpGet("current/default-global-settings")]
        public async Task<IActionResult> GetDefaultGlobalSettings()
        {
            // Obtener el sitio web actual para conocer su plantilla
            var webSite = await _context.WebSites.FirstOrDefaultAsync();

            if (webSite == null)
            {
                return NotFound("No website found");
            }

            // Si no tiene plantilla asignada, usar la default
            var templateId = string.IsNullOrEmpty(webSite.SelectedThemeOrTemplateId) 
                ? "default-hotel-template-v1" 
                : webSite.SelectedThemeOrTemplateId;

            // Obtener los defaults de la plantilla
            if (TemplateDefaultsData.TryGetValue(templateId, out var templateDefaults))
            {
                return Ok(new 
                { 
                    globalThemeSettingsJson = JsonSerializer.Serialize(templateDefaults.GlobalThemeSettings) 
                });
            }

            // Si no existe la plantilla, devolver defaults mínimos
            return Ok(new 
            { 
                globalThemeSettingsJson = JsonSerializer.Serialize(new
                {
                    logoUrl = "",
                    faviconUrl = "",
                    backgroundColor = "#ffffff",
                    textColor = "#333333",
                    accentColor = "#e91e63",
                    bodyFont = "Open Sans",
                    headingFont = "Playfair Display"
                })
            });
        }

        [HttpPut("current/global-settings")]
        public async Task<IActionResult> UpdateGlobalSettings([FromBody] UpdateGlobalSettingsDto dto)
        {
            var webSite = await _context.WebSites.FirstOrDefaultAsync();

            if (webSite == null)
            {
                return NotFound();
            }

            webSite.GlobalThemeSettingsJson = dto.GlobalThemeSettingsJson;
            webSite.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("current/template")]
        public async Task<IActionResult> UpdateTemplate([FromBody] UpdateTemplateDto dto)
        {
            var webSite = await _context.WebSites.FirstOrDefaultAsync();

            if (webSite == null)
            {
                return NotFound();
            }

            // Validar que la plantilla existe
            if (!TemplateDefaultsData.ContainsKey(dto.TemplateId))
            {
                return BadRequest("La plantilla seleccionada no existe");
            }

            // Actualizar la plantilla seleccionada
            webSite.SelectedThemeOrTemplateId = dto.TemplateId;
            webSite.UpdatedAt = DateTime.UtcNow;

            // IMPORTANTE: Resetear configuraciones globales para que se carguen los defaults de la nueva plantilla
            webSite.GlobalThemeSettingsJson = "{}";

            // Resetear también la estructura de las páginas principales (especialmente la home)
            var homePage = await _context.WebPages
                .FirstOrDefaultAsync(p => p.WebSiteId == webSite.Id && 
                    (p.Slug == "home" || p.PageType == "HomePage"));

            if (homePage != null)
            {
                homePage.PageStructureJson = "[]";
                homePage.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Devolver el sitio actualizado
            return Ok(new 
            { 
                id = webSite.Id,
                selectedThemeOrTemplateId = webSite.SelectedThemeOrTemplateId,
                message = "Plantilla actualizada exitosamente. Los datos se han reseteado para cargar los defaults de la nueva plantilla."
            });
        }
    }

    public class UpdateGlobalSettingsDto
    {
        public string GlobalThemeSettingsJson { get; set; }
    }

    public class UpdateTemplateDto
    {
        public string TemplateId { get; set; }
    }
}