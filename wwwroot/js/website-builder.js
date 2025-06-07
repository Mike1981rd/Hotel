// Website Builder JavaScript
(function() {
    'use strict';
    
    // PROTECCIÓN: Solo ejecutar si estamos en la página correcta
    if (!window.location.pathname.toLowerCase().includes('websitebuilder')) {
        console.log('Website Builder script skipped - not on WebsiteBuilder page');
        return; // Salir completamente si no estamos en WebsiteBuilder
    }

    // Estado global del editor
    const editorState = {
        websiteId: null,
        currentPageId: null,
        pages: [],
        currentPageData: null,
        currentPageBlocks: [],
        hasUnsavedChanges: false,
        selectedBlockId: null,
        editorMode: 'blocks', // 'blocks' o 'theme'
        currentGlobalThemeSettings: {},
        currentWebSite: null,
        currentPage: null,
        currentBlocksArray: [],
        selectedBlockIndex: null,
        selectedBlockSettingsForm: null,
        availablePages: [], // Lista de páginas disponibles
        currentPageIsSystem: false, // Indica si la página actual es de sistema
        selectedTemplateId: null, // ID de la plantilla/tema actualmente seleccionado
        templateDisplayName: null // Nombre amigable de la plantilla para mostrar en UI
    };

    // Lista de plantillas disponibles
    const availableTemplates = [
        { 
            id: "default-hotel-template-v1", 
            name: "Plantilla Hotel Clásica V1",
            description: "Diseño elegante y clásico ideal para hoteles de lujo"
        },
        { 
            id: "modern-minimalist-v1", 
            name: "Plantilla Moderna Minimalista V1",
            description: "Estilo minimalista con enfoque en simplicidad y modernidad"
        }
    ];

    // Esquemas de configuración para diferentes tipos de bloques
    const blockSettingsSchemas = {
        "GaleriaHeroPrincipal": [
            { label: "URL Imagen Principal", type: "text", propertyName: "mainImageUrl" },
            { label: "Alt Imagen Principal", type: "text", propertyName: "mainImageAltText" },
            { label: "URL Imagen Cuadrícula 1", type: "text", propertyName: "gridImage1Url" },
            { label: "Alt Imagen Cuadrícula 1", type: "text", propertyName: "gridImage1AltText" },
            { label: "URL Imagen Cuadrícula 2", type: "text", propertyName: "gridImage2Url" },
            { label: "Alt Imagen Cuadrícula 2", type: "text", propertyName: "gridImage2AltText" },
            { label: "URL Imagen Cuadrícula 3", type: "text", propertyName: "gridImage3Url" },
            { label: "Alt Imagen Cuadrícula 3", type: "text", propertyName: "gridImage3AltText" },
            { label: "URL Imagen Cuadrícula 4", type: "text", propertyName: "gridImage4Url" },
            { label: "Alt Imagen Cuadrícula 4", type: "text", propertyName: "gridImage4AltText" },
            { label: "Mostrar Botón 'Ver Todas' (true/false)", type: "text", propertyName: "showViewAllPhotosButton" },
            { label: "Texto del Botón", type: "text", propertyName: "viewAllPhotosButtonText" },
            { label: "Enlace del Botón", type: "text", propertyName: "viewAllPhotosButtonLink" }
        ],
        "WidgetBuscadorDisponibilidad": [
            { label: "Título (opcional)", type: "text", propertyName: "title" },
            { label: "Etiqueta Fecha de Entrada", type: "text", propertyName: "arrivalDateLabel" },
            { label: "Etiqueta Fecha de Salida", type: "text", propertyName: "departureDateLabel" },
            { label: "Etiqueta Alojamiento", type: "text", propertyName: "roomsLabel" },
            { label: "Etiqueta Adultos", type: "text", propertyName: "adultsLabel" },
            { label: "Etiqueta Niños", type: "text", propertyName: "childrenLabel" },
            { label: "Texto del Botón de Búsqueda", type: "text", propertyName: "searchButtonText" },
            { label: "Mostrar Campo Código Promocional (true/false)", type: "text", propertyName: "showPromoCodeField" },
            { label: "Etiqueta Código Promocional", type: "text", propertyName: "promoCodeLabel" }
        ],
        "ListadoTiposHabitacion": [
            { label: "Título de la Sección", type: "text", propertyName: "sectionTitle" },
            { label: "Número de Habitaciones a Mostrar", type: "text", propertyName: "numberOfRoomsToShow" },
            { label: "Texto Botón Ver Detalles", type: "text", propertyName: "viewDetailsButtonText" },
            { label: "Texto Botón Consultar Tarifas", type: "text", propertyName: "checkRatesButtonText" },
            { label: "Mostrar Indicador Tarifa Baja (true/false)", type: "text", propertyName: "showLowRateIndicator" },
            { label: "Texto Indicador Tarifa Baja", type: "text", propertyName: "lowRateIndicatorText" },
            { label: "Texto Botón Ver Todas las Habitaciones", type: "text", propertyName: "viewAllRoomsButtonText" },
            { label: "Enlace Botón Ver Todas", type: "text", propertyName: "viewAllRoomsButtonLink" }
        ],
        "TextoDescriptivo": [
            { label: "Título (opcional)", type: "text", propertyName: "title" },
            { label: "Contenido", type: "textarea", propertyName: "content" },
            { label: "Alineación del Texto (left/center/right)", type: "text", propertyName: "textAlign" }
        ],
        "ListaComodidades": [
            { label: "Título de la Sección", type: "text", propertyName: "sectionTitle" },
            { label: "Número de Columnas (2-4)", type: "text", propertyName: "columns" },
            // Nota: El campo 'amenities' es un array que se editará manualmente en el JSON por ahora
            // En el futuro se implementará un editor tipo 'repeater' para este campo
        ],
        "PreguntasFrecuentes": [
            { label: "Título de la Sección", type: "text", propertyName: "sectionTitle" },
            // Nota: El campo 'faqs' es un array que se editará manualmente en el JSON por ahora
            // Estructura esperada: [{ question: "", answer: "", isOpenByDefault: false }]
        ],
        "MapaUbicacion": [
            { label: "Título de la Sección", type: "text", propertyName: "sectionTitle" },
            { label: "URL de Embed del Mapa (src del iframe)", type: "textarea", propertyName: "mapEmbedUrl" },
            { label: "URL de Imagen Estática (si no hay embed)", type: "text", propertyName: "staticMapImageUrl" },
            { label: "Texto Alt. para Imagen Estática", type: "text", propertyName: "staticMapImageAltText" },
            { label: "Texto de Dirección", type: "textarea", propertyName: "addressText" },
            { label: "Altura del Mapa (ej: 400px)", type: "text", propertyName: "mapHeight" }
        ],
        "BannerPromocional": [
            { label: "URL de Imagen de Fondo", type: "text", propertyName: "backgroundImageUrl" },
            { label: "URL del Logo", type: "text", propertyName: "logoImageUrl" },
            { label: "Título Principal", type: "text", propertyName: "title" },
            { label: "Texto Descriptivo", type: "textarea", propertyName: "text" },
            { label: "Texto del Botón", type: "text", propertyName: "buttonText" },
            { label: "Enlace del Botón", type: "text", propertyName: "buttonLink" },
            { label: "Color de Overlay (hex)", type: "text", propertyName: "overlayColor" },
            { label: "Opacidad del Overlay (0-1)", type: "text", propertyName: "overlayOpacity" },
            { label: "Alineación del Contenido (left/center/right)", type: "text", propertyName: "contentAlignment" }
        ],
        "Hero": [
            { label: "Título Principal", type: "text", propertyName: "title" },
            { label: "Subtítulo", type: "textarea", propertyName: "subtitle" },
            { label: "URL de Imagen de Fondo", type: "text", propertyName: "backgroundImageUrl" },
            { label: "Texto del Botón", type: "text", propertyName: "buttonText" },
            { label: "URL del Botón", type: "text", propertyName: "buttonUrl" }
        ],
        "Text": [
            { label: "Contenido de Texto", type: "textarea", propertyName: "content" }
        ],
        "Image": [
            { label: "URL de Imagen", type: "text", propertyName: "imageUrl" },
            { label: "Texto Alternativo (Alt)", type: "text", propertyName: "altText" },
            { label: "Título", type: "text", propertyName: "caption" }
        ],
        "Gallery": [
            { label: "Título de la Galería", type: "text", propertyName: "title" },
            { label: "Número de Columnas", type: "text", propertyName: "columns" }
        ],
        "Services": [
            { label: "Título de la Sección", type: "text", propertyName: "title" },
            { label: "Subtítulo", type: "text", propertyName: "subtitle" }
        ],
        "Testimonials": [
            { label: "Título de la Sección", type: "text", propertyName: "title" },
            { label: "Mostrar Indicadores", type: "text", propertyName: "showIndicators" }
        ],
        "Contact": [
            { label: "Título del Formulario", type: "text", propertyName: "title" },
            { label: "Email de Destino", type: "text", propertyName: "emailTo" },
            { label: "Mensaje de Éxito", type: "textarea", propertyName: "successMessage" }
        ],
        "Header": [
            { label: "Logo URL", type: "text", propertyName: "logoUrl" },
            { label: "Mostrar Menú", type: "text", propertyName: "showMenu" }
        ],
        "Footer": [
            { label: "Texto de Copyright", type: "text", propertyName: "copyrightText" },
            { label: "Mostrar Enlaces Sociales", type: "text", propertyName: "showSocialLinks" }
        ]
    };

    // Esquema de configuración global del tema
    const globalThemeSettingsSchema = [
        { sectionTitle: "Identidad Visual" },
        { label: "URL del Logo", type: "text", propertyName: "logoUrl" },
        { label: "Favicon URL", type: "text", propertyName: "faviconUrl" },
        { sectionTitle: "Colores Globales" },
        { label: "Color de Fondo Principal", type: "color", propertyName: "backgroundColor", defaultValue: "#ffffff" },
        { label: "Color de Texto Principal", type: "color", propertyName: "textColor", defaultValue: "#333333" },
        { label: "Color de Acento (Enlaces, Botones)", type: "color", propertyName: "accentColor", defaultValue: "#e91e63" },
        { sectionTitle: "Tipografía" },
        { label: "Fuente Principal (Cuerpo)", type: "select", propertyName: "bodyFont", 
          options: ["Arial", "Verdana", "Georgia", "Times New Roman", "Helvetica", "Open Sans", "Roboto"],
          defaultValue: "Arial" },
        { label: "Fuente de Encabezados", type: "select", propertyName: "headingFont", 
          options: ["Arial Black", "Impact", "Georgia", "Helvetica", "Open Sans", "Roboto", "Playfair Display"],
          defaultValue: "Arial Black" }
    ];

    // Información descriptiva de los bloques
    const blockTypeInfo = {
        "GaleriaHeroPrincipal": { icon: "fa-th-large", desc: "Galería hero con imagen principal y cuadrícula" },
        "WidgetBuscadorDisponibilidad": { icon: "fa-search", desc: "Widget de búsqueda de disponibilidad" },
        "ListadoTiposHabitacion": { icon: "fa-bed", desc: "Lista de tipos de habitación disponibles" },
        "TextoDescriptivo": { icon: "fa-paragraph", desc: "Bloque de texto descriptivo" },
        "ListaComodidades": { icon: "fa-check-circle", desc: "Lista de comodidades y servicios" },
        "PreguntasFrecuentes": { icon: "fa-question-circle", desc: "Preguntas frecuentes con acordeón" },
        "MapaUbicacion": { icon: "fa-map-marker-alt", desc: "Mapa de ubicación del hotel" },
        "BannerPromocional": { icon: "fa-bullhorn", desc: "Banner promocional con imagen de fondo" },
        "Hero": { icon: "fa-image", desc: "Banner principal con imagen" },
        "Text": { icon: "fa-align-left", desc: "Bloque de texto simple" },
        "Image": { icon: "fa-image", desc: "Imagen individual" },
        "Gallery": { icon: "fa-images", desc: "Galería de imágenes" },
        "Services": { icon: "fa-th", desc: "Cuadrícula de servicios" },
        "Testimonials": { icon: "fa-comment-dots", desc: "Testimonios de clientes" },
        "Contact": { icon: "fa-envelope", desc: "Formulario de contacto" },
        "Header": { icon: "fa-bars", desc: "Encabezado del sitio" },
        "Footer": { icon: "fa-bars", desc: "Pie de página" }
    };

    // Renderers para cada tipo de bloque
    const blockRenderers = {
        "GaleriaHeroPrincipal": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-galeria-hero">`;
            html += `<div class="galeria-hero-container">`;
            
            // Imagen principal
            html += `<div class="hero-main-image">`;
            html += `<img src="${settings.mainImageUrl || 'https://via.placeholder.com/800x600?text=Imagen+Principal'}" 
                     alt="${settings.mainImageAltText || 'Imagen principal'}" />`;
            html += `</div>`;
            
            // Cuadrícula de imágenes
            html += `<div class="hero-grid-images">`;
            
            // Imagen 1
            html += `<div class="hero-grid-item">`;
            html += `<img src="${settings.gridImage1Url || 'https://via.placeholder.com/300x200?text=Grid+1'}" 
                     alt="${settings.gridImage1AltText || 'Imagen 1'}" />`;
            html += `</div>`;
            
            // Imagen 2
            html += `<div class="hero-grid-item">`;
            html += `<img src="${settings.gridImage2Url || 'https://via.placeholder.com/300x200?text=Grid+2'}" 
                     alt="${settings.gridImage2AltText || 'Imagen 2'}" />`;
            html += `</div>`;
            
            // Imagen 3
            html += `<div class="hero-grid-item">`;
            html += `<img src="${settings.gridImage3Url || 'https://via.placeholder.com/300x200?text=Grid+3'}" 
                     alt="${settings.gridImage3AltText || 'Imagen 3'}" />`;
            html += `</div>`;
            
            // Imagen 4 con botón
            html += `<div class="hero-grid-item">`;
            html += `<img src="${settings.gridImage4Url || 'https://via.placeholder.com/300x200?text=Grid+4'}" 
                     alt="${settings.gridImage4AltText || 'Imagen 4'}" />`;
            
            // Botón "Ver todas las fotos" si está habilitado
            if (settings.showViewAllPhotosButton === 'true' || settings.showViewAllPhotosButton === true) {
                html += `<a href="${settings.viewAllPhotosButtonLink || '#'}" class="view-all-photos-btn">`;
                html += `<i class="fas fa-images"></i> `;
                html += settings.viewAllPhotosButtonText || 'Ver todas las fotos';
                html += `</a>`;
            }
            
            html += `</div>`;
            html += `</div>`; // Cierre hero-grid-images
            html += `</div>`; // Cierre galeria-hero-container
            html += `</div>`; // Cierre block-galeria-hero
            
            return html;
        },
        
        "WidgetBuscadorDisponibilidad": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-availability-widget">`;
            html += `<div class="widget-container">`;
            
            // Título opcional
            if (settings.title) {
                html += `<h3 class="widget-title">${settings.title}</h3>`;
            }
            
            // Formulario de búsqueda
            html += `<form class="availability-form">`;
            html += `<div class="widget-fields-row">`;
            
            // Campo de fecha de entrada
            html += `<div class="widget-field-group">`;
            html += `<label class="widget-label">${settings.arrivalDateLabel || 'Fecha de entrada'}</label>`;
            html += `<div class="widget-input-wrapper">`;
            html += `<i class="fas fa-calendar-alt"></i>`;
            html += `<input type="date" class="widget-date-input" placeholder="DD/MM/AAAA" />`;
            html += `</div>`;
            html += `</div>`;
            
            // Campo de fecha de salida
            html += `<div class="widget-field-group">`;
            html += `<label class="widget-label">${settings.departureDateLabel || 'Fecha de salida'}</label>`;
            html += `<div class="widget-input-wrapper">`;
            html += `<i class="fas fa-calendar-alt"></i>`;
            html += `<input type="date" class="widget-date-input" placeholder="DD/MM/AAAA" />`;
            html += `</div>`;
            html += `</div>`;
            
            // Campo de alojamiento/habitaciones
            html += `<div class="widget-field-group">`;
            html += `<label class="widget-label">${settings.roomsLabel || 'Alojamiento'}</label>`;
            html += `<div class="widget-input-wrapper">`;
            html += `<i class="fas fa-bed"></i>`;
            html += `<select class="widget-occupancy-select">`;
            html += `<option value="1">1 Habitación</option>`;
            html += `<option value="2">2 Habitaciones</option>`;
            html += `<option value="3">3 Habitaciones</option>`;
            html += `<option value="4">4+ Habitaciones</option>`;
            html += `</select>`;
            html += `</div>`;
            html += `</div>`;
            
            // Campo de adultos
            html += `<div class="widget-field-group">`;
            html += `<label class="widget-label">${settings.adultsLabel || 'Adultos'}</label>`;
            html += `<div class="widget-input-wrapper">`;
            html += `<i class="fas fa-user"></i>`;
            html += `<select class="widget-occupancy-select">`;
            html += `<option value="1">1</option>`;
            html += `<option value="2" selected>2</option>`;
            html += `<option value="3">3</option>`;
            html += `<option value="4">4</option>`;
            html += `<option value="5">5+</option>`;
            html += `</select>`;
            html += `</div>`;
            html += `</div>`;
            
            // Campo de niños
            html += `<div class="widget-field-group">`;
            html += `<label class="widget-label">${settings.childrenLabel || 'Niños'}</label>`;
            html += `<div class="widget-input-wrapper">`;
            html += `<i class="fas fa-child"></i>`;
            html += `<select class="widget-occupancy-select">`;
            html += `<option value="0" selected>0</option>`;
            html += `<option value="1">1</option>`;
            html += `<option value="2">2</option>`;
            html += `<option value="3">3</option>`;
            html += `<option value="4">4+</option>`;
            html += `</select>`;
            html += `</div>`;
            html += `</div>`;
            
            // Campo de código promocional (opcional)
            if (settings.showPromoCodeField === 'true' || settings.showPromoCodeField === true) {
                html += `<div class="widget-field-group widget-promo-field">`;
                html += `<label class="widget-label">${settings.promoCodeLabel || 'Código Promocional'}</label>`;
                html += `<div class="widget-input-wrapper">`;
                html += `<i class="fas fa-tag"></i>`;
                html += `<input type="text" class="widget-promo-input" placeholder="Ingrese código" />`;
                html += `</div>`;
                html += `</div>`;
            }
            
            // Botón de búsqueda
            html += `<div class="widget-search-button-wrapper">`;
            html += `<button type="submit" class="widget-search-button">`;
            html += `<i class="fas fa-search"></i> `;
            html += settings.searchButtonText || 'Encuentra Habitaciones';
            html += `</button>`;
            html += `</div>`;
            
            html += `</div>`; // Cierre widget-fields-row
            html += `</form>`;
            html += `</div>`; // Cierre widget-container
            html += `</div>`; // Cierre block-availability-widget
            
            return html;
        },
        
        "ListadoTiposHabitacion": function(settings, blockId, blockType) {
            // Datos de ejemplo para las habitaciones
            const roomExamples = [
                { name: "Habitación Deluxe", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { name: "Suite Junior", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { name: "Habitación Estándar", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { name: "Suite Presidencial", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
            ];
            
            const numberOfRooms = parseInt(settings.numberOfRoomsToShow) || 3;
            const showLowRate = settings.showLowRateIndicator === 'true' || settings.showLowRateIndicator === true;
            
            let html = `<div class="preview-block block-room-list">`;
            html += `<div class="room-list-container">`;
            
            // Título de la sección
            if (settings.sectionTitle) {
                html += `<h2 class="room-list-title">${settings.sectionTitle}</h2>`;
            }
            
            // Lista de habitaciones
            html += `<div class="room-list-grid">`;
            
            // Generar habitaciones de ejemplo
            for (let i = 0; i < numberOfRooms && i < roomExamples.length; i++) {
                const room = roomExamples[i];
                
                html += `<div class="room-item">`;
                
                // Imagen de la habitación
                html += `<div class="room-item-image">`;
                html += `<img src="${room.image}" alt="${room.name}" />`;
                
                // Indicador de tarifa baja
                if (showLowRate && i === 0) { // Solo mostrar en la primera habitación
                    html += `<div class="low-rate-indicator">`;
                    html += `<i class="fas fa-tag"></i> `;
                    html += settings.lowRateIndicatorText || 'Tasa baja de hoy';
                    html += `</div>`;
                }
                
                html += `</div>`;
                
                // Detalles de la habitación
                html += `<div class="room-item-details">`;
                html += `<h3 class="room-name">${room.name}</h3>`;
                html += `<p class="room-description">Disfruta de una experiencia única con todas las comodidades modernas y un servicio excepcional.</p>`;
                
                // Características (ejemplo)
                html += `<div class="room-features">`;
                html += `<span class="room-feature"><i class="fas fa-wifi"></i> WiFi Gratis</span>`;
                html += `<span class="room-feature"><i class="fas fa-tv"></i> TV de Pantalla Plana</span>`;
                html += `<span class="room-feature"><i class="fas fa-snowflake"></i> Aire Acondicionado</span>`;
                html += `</div>`;
                html += `</div>`;
                
                // Acciones de la habitación
                html += `<div class="room-item-actions">`;
                html += `<a href="#" class="room-details-link">`;
                html += settings.viewDetailsButtonText || 'Servicios, detalles y políticas de la habitación';
                html += `</a>`;
                html += `<button class="room-rates-button">`;
                html += `<i class="fas fa-calendar-check"></i> `;
                html += settings.checkRatesButtonText || 'Consultar Tarifas';
                html += `</button>`;
                html += `</div>`;
                
                html += `</div>`; // Cierre room-item
            }
            
            html += `</div>`; // Cierre room-list-grid
            
            // Botón ver todas las habitaciones
            if (settings.viewAllRoomsButtonText) {
                html += `<div class="room-list-footer">`;
                html += `<a href="${settings.viewAllRoomsButtonLink || '#'}" class="view-all-rooms-button">`;
                html += `<i class="fas fa-door-open"></i> `;
                html += settings.viewAllRoomsButtonText;
                html += `</a>`;
                html += `</div>`;
            }
            
            html += `</div>`; // Cierre room-list-container
            html += `</div>`; // Cierre block-room-list
            
            return html;
        },
        
        "TextoDescriptivo": function(settings, blockId, blockType) {
            const alignment = settings.textAlign || 'left';
            
            let html = `<div class="preview-block block-descriptive-text">`;
            html += `<div class="descriptive-text-container" style="text-align: ${alignment};">`;
            
            // Título opcional
            if (settings.title) {
                html += `<h2 class="descriptive-text-title">${settings.title}</h2>`;
            }
            
            // Contenido principal
            html += `<div class="descriptive-text-content">`;
            if (settings.content) {
                // Procesar saltos de línea y párrafos
                const paragraphs = settings.content.split('\n\n');
                paragraphs.forEach(paragraph => {
                    if (paragraph.trim()) {
                        html += `<p>${paragraph.trim()}</p>`;
                    }
                });
            } else {
                html += `<p>Escribe aquí tu descripción. Puedes usar saltos de línea dobles para crear párrafos separados.</p>`;
            }
            html += `</div>`;
            
            html += `</div>`; // Cierre descriptive-text-container
            html += `</div>`; // Cierre block-descriptive-text
            
            return html;
        },
        
        "ListaComodidades": function(settings, blockId, blockType) {
            const columns = parseInt(settings.columns) || 3;
            const amenities = settings.amenities || [];
            
            let html = `<div class="preview-block block-amenities-list">`;
            html += `<div class="amenities-container">`;
            
            // Título de la sección
            if (settings.sectionTitle) {
                html += `<h2 class="amenities-title">${settings.sectionTitle}</h2>`;
            }
            
            // Lista de comodidades
            html += `<div class="amenities-grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
            
            // Si no hay comodidades definidas, mostrar ejemplos por defecto
            const displayAmenities = amenities.length > 0 ? amenities : [
                { text: "Servicio de habitaciones 24/7", hasIcon: true },
                { text: "Wi-Fi de alta velocidad gratuito", hasIcon: true },
                { text: "Televisión por cable/satélite", hasIcon: true },
                { text: "Recepción abierta las 24 horas", hasIcon: true },
                { text: "Restaurante gourmet", hasIcon: true },
                { text: "Gimnasio totalmente equipado", hasIcon: true },
                { text: "Piscina al aire libre", hasIcon: true },
                { text: "Spa y centro de bienestar", hasIcon: true },
                { text: "Servicio de lavandería", hasIcon: true },
                { text: "Estacionamiento gratuito", hasIcon: true },
                { text: "Servicio de conserjería", hasIcon: true },
                { text: "Salas de reuniones", hasIcon: true }
            ];
            
            // Renderizar cada comodidad
            displayAmenities.forEach(amenity => {
                const showIcon = amenity.hasIcon !== false; // Por defecto mostrar ícono
                
                html += `<div class="amenity-item">`;
                if (showIcon) {
                    html += `<span class="amenity-icon"><i class="fas fa-check"></i></span>`;
                }
                html += `<span class="amenity-text">${amenity.text}</span>`;
                html += `</div>`;
            });
            
            html += `</div>`; // Cierre amenities-grid
            html += `</div>`; // Cierre amenities-container
            html += `</div>`; // Cierre block-amenities-list
            
            return html;
        },
        
        "PreguntasFrecuentes": function(settings, blockId, blockType) {
            const faqs = settings.faqs || [];
            
            let html = `<div class="preview-block block-faq-list">`;
            html += `<div class="faq-container">`;
            
            // Título de la sección
            if (settings.sectionTitle) {
                html += `<h2 class="faq-title">${settings.sectionTitle}</h2>`;
            }
            
            // Lista de FAQs
            html += `<div class="faq-accordion">`;
            
            // Si no hay FAQs definidas, mostrar ejemplos por defecto
            const displayFaqs = faqs.length > 0 ? faqs : [
                { 
                    question: "¿Cuál es el horario de check-in y check-out?", 
                    answer: "El horario de check-in es a partir de las 3:00 PM y el check-out debe realizarse antes de las 12:00 PM. Si necesita horarios especiales, por favor contáctenos con anticipación.",
                    isOpenByDefault: true 
                },
                { 
                    question: "¿Se admiten mascotas en el hotel?", 
                    answer: "Sí, somos un hotel pet-friendly. Admitimos mascotas pequeñas (hasta 10 kg) con un cargo adicional de $25 por noche. Se requiere notificación previa al realizar la reserva.",
                    isOpenByDefault: false 
                },
                { 
                    question: "¿Ofrecen servicio de traslado al aeropuerto?", 
                    answer: "Sí, ofrecemos servicio de traslado desde y hacia el aeropuerto las 24 horas. El costo es de $35 por trayecto para hasta 4 personas. Debe reservarse con al menos 24 horas de anticipación.",
                    isOpenByDefault: false 
                },
                { 
                    question: "¿El desayuno está incluido en la tarifa?", 
                    answer: "Depende del tipo de tarifa que elija. Nuestras tarifas con desayuno incluido ofrecen un desayuno buffet completo de 6:30 AM a 10:30 AM. También puede añadir el desayuno por $20 por persona.",
                    isOpenByDefault: false 
                },
                { 
                    question: "¿Cuáles son las políticas de cancelación?", 
                    answer: "Las cancelaciones sin cargo pueden realizarse hasta 48 horas antes de la fecha de llegada. Las cancelaciones posteriores o no presentarse resultarán en el cargo de una noche de estadía.",
                    isOpenByDefault: false 
                }
            ];
            
            // Renderizar cada FAQ
            displayFaqs.forEach((faqItem, index) => {
                const isOpen = faqItem.isOpenByDefault === true;
                const uniqueId = `faq-${Date.now()}-${index}`; // ID único para aria
                
                html += `<div class="faq-item ${isOpen ? 'open' : ''}" data-faq-index="${index}">`;
                
                // Pregunta (botón clickeable)
                html += `<button class="faq-question" aria-expanded="${isOpen}" aria-controls="${uniqueId}">`;
                html += `<span class="faq-question-text">${faqItem.question}</span>`;
                html += `<span class="faq-toggle-icon">${isOpen ? '−' : '+'}</span>`;
                html += `</button>`;
                
                // Respuesta
                html += `<div class="faq-answer" id="${uniqueId}" ${isOpen ? '' : 'style="display: none;"'}>`;
                html += `<div class="faq-answer-content">`;
                html += `<p>${faqItem.answer}</p>`;
                html += `</div>`;
                html += `</div>`;
                
                html += `</div>`; // Cierre faq-item
            });
            
            html += `</div>`; // Cierre faq-accordion
            html += `</div>`; // Cierre faq-container
            html += `</div>`; // Cierre block-faq-list
            
            return html;
        },
        
        "MapaUbicacion": function(settings, blockId, blockType) {
            const mapHeight = settings.mapHeight || '400px';
            
            let html = `<div class="preview-block block-map-location">`;
            html += `<div class="map-location-container">`;
            
            // Título de la sección
            if (settings.sectionTitle) {
                html += `<h2 class="map-title">${settings.sectionTitle}</h2>`;
            }
            
            // Contenedor del mapa
            html += `<div class="map-content" style="height: ${mapHeight};">`;
            
            // Lógica para renderizar el mapa
            if (settings.mapEmbedUrl) {
                // Si hay URL de embed, mostrar iframe
                html += `<iframe 
                    src="${settings.mapEmbedUrl}" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>`;
            } else if (settings.staticMapImageUrl) {
                // Si hay imagen estática, mostrarla
                html += `<img 
                    src="${settings.staticMapImageUrl}" 
                    alt="${settings.staticMapImageAltText || 'Mapa de ubicación del hotel'}" 
                    style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                // Placeholder si no hay mapa configurado
                html += `<div class="map-placeholder">`;
                html += `<i class="fas fa-map-marked-alt"></i>`;
                html += `<p>Mapa no configurado</p>`;
                html += `<small>Configure la URL de embed o imagen estática en los ajustes</small>`;
                html += `</div>`;
            }
            
            html += `</div>`; // Cierre map-content
            
            // Dirección del hotel
            if (settings.addressText) {
                html += `<div class="map-address-section">`;
                html += `<div class="map-address-icon">`;
                html += `<i class="fas fa-map-pin"></i>`;
                html += `</div>`;
                html += `<div class="map-address-content">`;
                html += `<h3>Dirección</h3>`;
                html += `<p>${settings.addressText}</p>`;
                html += `</div>`;
                html += `</div>`;
            }
            
            html += `</div>`; // Cierre map-location-container
            html += `</div>`; // Cierre block-map-location
            
            return html;
        },
        
        "BannerPromocional": function(settings, blockId, blockType) {
            const overlayColor = settings.overlayColor || '#000000';
            const overlayOpacity = settings.overlayOpacity || '0.6';
            const contentAlignment = settings.contentAlignment || 'center';
            
            let html = `<div class="preview-block block-promotional-banner" style="background-image: url('${settings.backgroundImageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'}');">`;
            
            // Overlay
            html += `<div class="banner-overlay" style="background-color: ${overlayColor}; opacity: ${overlayOpacity};"></div>`;
            
            // Contenido
            html += `<div class="banner-content" style="text-align: ${contentAlignment};">`;
            
            // Logo si está presente
            if (settings.logoImageUrl) {
                html += `<img src="${settings.logoImageUrl}" alt="Logo" class="banner-logo" />`;
            }
            
            // Título
            if (settings.title) {
                html += `<h2 class="banner-title">${settings.title}</h2>`;
            }
            
            // Texto descriptivo
            if (settings.text) {
                html += `<p class="banner-text">${settings.text}</p>`;
            }
            
            // Botón
            if (settings.buttonText) {
                html += `<a href="${settings.buttonLink || '#'}" class="banner-button">${settings.buttonText}</a>`;
            }
            
            html += `</div>`; // Cierre banner-content
            html += `</div>`; // Cierre block-promotional-banner
            
            return html;
        },
        
        "Hero": function(settings, blockId, blockType) {
            const bgImage = settings.backgroundImageUrl ? 
                `style="background-image: url('${settings.backgroundImageUrl}');"` : '';
            
            let html = `<div class="preview-block block-hero" ${bgImage}>`;
            html += `<div class="hero-content">`;
            html += `<h1>${settings.title || 'Título Principal'}</h1>`;
            if (settings.subtitle) {
                html += `<p class="hero-subtitle">${settings.subtitle}</p>`;
            }
            if (settings.buttonText) {
                html += `<a href="${settings.buttonUrl || '#'}" class="hero-button">${settings.buttonText}</a>`;
            }
            html += `</div>`;
            html += `</div>`;
            return html;
        },

        "Text": function(settings, blockId, blockType) {
            return `<div class="preview-block block-text">
                <div class="text-content">${settings.content || '<p>Contenido de texto...</p>'}</div>
            </div>`;
        },

        "Image": function(settings, blockId, blockType) {
            const imgSrc = settings.imageUrl || 'https://via.placeholder.com/800x400?text=Imagen';
            return `<div class="preview-block block-image">
                <img src="${imgSrc}" alt="${settings.altText || ''}" title="${settings.caption || ''}">
                ${settings.caption ? `<p class="image-caption">${settings.caption}</p>` : ''}
            </div>`;
        },

        "Gallery": function(settings, blockId, blockType) {
            const columns = settings.columns || '3';
            let html = `<div class="preview-block block-gallery">`;
            if (settings.title) {
                html += `<h2>${settings.title}</h2>`;
            }
            html += `<div class="gallery-grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
            // Imágenes de ejemplo para la galería
            for (let i = 1; i <= parseInt(columns) * 2; i++) {
                html += `<div class="gallery-item">
                    <img src="https://via.placeholder.com/300x300?text=Imagen+${i}" alt="Imagen ${i}">
                </div>`;
            }
            html += `</div></div>`;
            return html;
        },

        "Services": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-services">`;
            if (settings.title) {
                html += `<h2>${settings.title}</h2>`;
            }
            if (settings.subtitle) {
                html += `<p class="services-subtitle">${settings.subtitle}</p>`;
            }
            html += `<div class="services-grid">`;
            // Servicios de ejemplo
            const services = ['Servicio 1', 'Servicio 2', 'Servicio 3', 'Servicio 4'];
            services.forEach(service => {
                html += `<div class="service-item">
                    <i class="fas fa-concierge-bell"></i>
                    <h3>${service}</h3>
                    <p>Descripción del servicio</p>
                </div>`;
            });
            html += `</div></div>`;
            return html;
        },

        "Testimonials": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-testimonials">`;
            if (settings.title) {
                html += `<h2>${settings.title}</h2>`;
            }
            html += `<div class="testimonials-container">`;
            // Testimonios de ejemplo
            for (let i = 1; i <= 3; i++) {
                html += `<div class="testimonial-item">
                    <p>"Excelente servicio y atención. Totalmente recomendado."</p>
                    <div class="testimonial-author">- Cliente ${i}</div>
                </div>`;
            }
            html += `</div>`;
            if (settings.showIndicators === 'true') {
                html += `<div class="testimonial-indicators">• • •</div>`;
            }
            html += `</div>`;
            return html;
        },

        "Contact": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-contact">`;
            if (settings.title) {
                html += `<h2>${settings.title}</h2>`;
            }
            html += `<form class="contact-form">
                <div class="form-row">
                    <input type="text" placeholder="Nombre" class="contact-input">
                    <input type="email" placeholder="Email" class="contact-input">
                </div>
                <textarea placeholder="Mensaje" rows="4" class="contact-textarea"></textarea>
                <button type="submit" class="contact-button">Enviar</button>
            </form>`;
            html += `</div>`;
            return html;
        },

        "Header": function(settings, blockId, blockType) {
            const logoUrl = settings.logoUrl || 'https://via.placeholder.com/150x50?text=Logo';
            let html = `<div class="preview-block block-header">`;
            html += `<div class="header-container">`;
            html += `<img src="${logoUrl}" alt="Logo" class="header-logo">`;
            if (settings.showMenu !== 'false') {
                html += `<nav class="header-nav">
                    <a href="#">Inicio</a>
                    <a href="#">Habitaciones</a>
                    <a href="#">Servicios</a>
                    <a href="#">Contacto</a>
                </nav>`;
            }
            html += `</div></div>`;
            return html;
        },

        "Footer": function(settings, blockId, blockType) {
            let html = `<div class="preview-block block-footer">`;
            html += `<div class="footer-container">`;
            html += `<p>${settings.copyrightText || '© 2024 Hotel. Todos los derechos reservados.'}</p>`;
            if (settings.showSocialLinks !== 'false') {
                html += `<div class="social-links">
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>`;
            }
            html += `</div></div>`;
            return html;
        },
        
        // Renderizadores placeholder para tipos de bloque comunes que podrían estar faltando
        "HeroBanner": function(settings, blockId, blockType) {
            return `<div class="placeholder-block" style="border:2px dashed #17a2b8; padding:30px; margin:10px; background-color: #e7f5ff; border-radius: 8px; text-align: center;">
                <i class="fas fa-image" style="font-size: 48px; color: #17a2b8; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #17a2b8; margin: 0 0 10px 0;">Bloque: Hero Banner</h3>
                <p style="margin: 10px 0;"><strong>ID:</strong> ${blockId || 'N/A'}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                    <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: left;">${JSON.stringify(settings, null, 2)}</pre>
                </details>
            </div>`;
        },
        
        "Servicios": function(settings, blockId, blockType) {
            return `<div class="placeholder-block" style="border:2px dashed #28a745; padding:30px; margin:10px; background-color: #e6f7e6; border-radius: 8px; text-align: center;">
                <i class="fas fa-th" style="font-size: 48px; color: #28a745; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #28a745; margin: 0 0 10px 0;">Bloque: Servicios</h3>
                <p style="margin: 10px 0;"><strong>ID:</strong> ${blockId || 'N/A'}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                    <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: left;">${JSON.stringify(settings, null, 2)}</pre>
                </details>
            </div>`;
        },
        
        "HabitacionesDestacadas": function(settings, blockId, blockType) {
            return `<div class="placeholder-block" style="border:2px dashed #fd7e14; padding:30px; margin:10px; background-color: #fff5e6; border-radius: 8px; text-align: center;">
                <i class="fas fa-bed" style="font-size: 48px; color: #fd7e14; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #fd7e14; margin: 0 0 10px 0;">Bloque: Habitaciones Destacadas</h3>
                <p style="margin: 10px 0;"><strong>ID:</strong> ${blockId || 'N/A'}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                    <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: left;">${JSON.stringify(settings, null, 2)}</pre>
                </details>
            </div>`;
        },
        
        "Testimonios": function(settings, blockId, blockType) {
            return `<div class="placeholder-block" style="border:2px dashed #6f42c1; padding:30px; margin:10px; background-color: #f3efff; border-radius: 8px; text-align: center;">
                <i class="fas fa-comment-dots" style="font-size: 48px; color: #6f42c1; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #6f42c1; margin: 0 0 10px 0;">Bloque: Testimonios</h3>
                <p style="margin: 10px 0;"><strong>ID:</strong> ${blockId || 'N/A'}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                    <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: left;">${JSON.stringify(settings, null, 2)}</pre>
                </details>
            </div>`;
        },
        
        // Renderizador genérico de fallback para cualquier tipo no definido
        "_default": function(settings, blockId, blockType) {
            return `<div class="placeholder-block generic-block" style="border:2px dashed #6c757d; padding:30px; margin:10px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
                <i class="fas fa-cube" style="font-size: 48px; color: #6c757d; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #6c757d; margin: 0 0 10px 0;">Bloque: ${blockType || 'Sin Tipo'}</h3>
                <p style="margin: 10px 0;"><strong>ID:</strong> ${blockId || 'N/A'}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                    <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: white; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: left;">${JSON.stringify(settings, null, 2)}</pre>
                </details>
            </div>`;
        }
    };

    // Funciones auxiliares para API
    const api = {
        get: async function(url) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error en petición GET:', error);
                alert('Error al cargar datos. Por favor, intente nuevamente.');
                throw error;
            }
        },

        put: async function(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Si el servidor devuelve NoContent (204), no intentar parsear JSON
                if (response.status === 204) {
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error('Error en petición PUT:', error);
                throw error;
            }
        },

        post: async function(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error en petición POST:', error);
                throw error;
            }
        },

        delete: async function(url) {
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error en petición DELETE:', error);
                throw error;
            }
        }
    };

    // Función para actualizar el título de la página en el sidebar
    function updatePageTitle(title) {
        const pageNameElement = document.getElementById('current-page-name');
        if (pageNameElement) {
            pageNameElement.textContent = title;
        }
    }

    // Función para poblar el selector de páginas
    async function populatePageSelector() {
        try {
            const websiteId = editorState.currentWebSite?.id || 1;
            const pages = await api.get(`/api/builder/websites/${websiteId}/pages`);
            
            const pageSelector = document.getElementById('page-selector');
            pageSelector.innerHTML = '';
            
            // Actualizar estado
            editorState.availablePages = pages;
            
            pages.forEach(page => {
                const option = document.createElement('option');
                option.value = page.slug;
                option.textContent = page.title;
                option.setAttribute('data-page-id', page.id);
                option.setAttribute('data-is-system', page.isSystemPage);
                pageSelector.appendChild(option);
            });
            
            // Seleccionar la primera página por defecto
            if (pages.length > 0) {
                const firstPage = pages[0];
                pageSelector.value = firstPage.slug;
                editorState.currentPage = firstPage;
                editorState.currentPageIsSystem = firstPage.isSystemPage;
                updateDeletePageButtonState();
                
                // Cargar contenido de la primera página
                await loadPageContent(firstPage.slug);
            }
            
        } catch (error) {
            console.error('Error al cargar páginas:', error);
            showNotification('Error al cargar las páginas', 'error');
        }
    }

    // Función para mostrar la estructura de bloques
    function displayBlockStructure(pageStructureJson) {
        const blocksContainer = document.getElementById('blocks-list-placeholder');
        if (!blocksContainer) return;

        try {
            // Parsear el JSON de estructura
            const blocks = JSON.parse(pageStructureJson || '[]');
            
            // Guardar los bloques en el estado
            editorState.currentPageBlocks = blocks;
            
            // Limpiar contenido actual
            blocksContainer.innerHTML = '';

            if (blocks.length === 0) {
                blocksContainer.innerHTML = '<li class="empty-state">No hay bloques en esta página</li>';
                return;
            }

            // Crear elementos de lista para cada bloque
            const ul = document.createElement('ul');
            ul.className = 'blocks-list';

            blocks.forEach((block, index) => {
                const li = document.createElement('li');
                li.className = 'block-item';
                li.setAttribute('data-block-id', block.id || '');
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                
                // Iconos según el tipo de bloque
                const iconMap = {
                    'Hero': 'fa-image',
                    'Text': 'fa-align-left',
                    'Gallery': 'fa-images',
                    'Header': 'fa-bars',
                    'Footer': 'fa-bars',
                    'Services': 'fa-th',
                    'Testimonials': 'fa-comment-dots',
                    'Contact': 'fa-envelope',
                    'Image': 'fa-image'
                };

                const icon = iconMap[block.type] || 'fa-cube';
                const blockName = block.settings?.title || block.type || 'Bloque';
                
                li.innerHTML = `
                    <div class="block-info">
                        <i class="fas ${icon}"></i>
                        <span>${blockName}</span>
                    </div>
                    <div class="block-actions">
                        <button class="block-action-btn move-up" data-block-id="${block.id}" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="block-action-btn move-down" data-block-id="${block.id}" title="Mover abajo" ${index === blocks.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="block-action-btn delete-block" data-block-id="${block.id}" title="Eliminar bloque">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                ul.appendChild(li);
            });

            blocksContainer.appendChild(ul);

            // Añadir event listeners a los bloques
            attachBlockClickHandlers();
            
            // Actualizar estado de botones mover
            updateMoveButtonsState();

        } catch (error) {
            console.error('Error al parsear estructura de página:', error);
            blocksContainer.innerHTML = '<li class="error-state">Error al cargar estructura de bloques</li>';
        }
    }

    // Función para adjuntar manejadores de click a los bloques
    function attachBlockClickHandlers() {
        const blockItems = document.querySelectorAll('.block-item');
        blockItems.forEach(item => {
            // Click en el bloque para seleccionarlo
            item.addEventListener('click', function(e) {
                // Ignorar si el click fue en un botón de acción
                if (e.target.closest('.block-actions')) return;
                
                // Remover clase active de todos los bloques
                blockItems.forEach(block => block.classList.remove('active'));
                
                // Añadir clase active al bloque clickeado
                this.classList.add('active');
                
                // Actualizar panel de settings
                const blockId = this.getAttribute('data-block-id');
                showBlockSettings(blockId);
            });

            // Soporte para navegación con teclado
            item.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Event listeners para botones de mover
        document.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                moveBlock(blockId, 'up');
            });
        });

        document.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                moveBlock(blockId, 'down');
            });
        });

        // Event listeners para botones de eliminar
        document.querySelectorAll('.delete-block').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                deleteBlock(blockId);
            });
        });
    }

    // Función para mover bloques arriba/abajo
    function moveBlock(blockId, direction) {
        const blockIndex = editorState.currentPageBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const blocks = editorState.currentPageBlocks;
        let newIndex;

        if (direction === 'up' && blockIndex > 0) {
            newIndex = blockIndex - 1;
        } else if (direction === 'down' && blockIndex < blocks.length - 1) {
            newIndex = blockIndex + 1;
        } else {
            return; // No se puede mover
        }

        // Intercambiar bloques
        [blocks[blockIndex], blocks[newIndex]] = [blocks[newIndex], blocks[blockIndex]];

        // Marcar cambios sin guardar
        editorState.hasUnsavedChanges = true;
        updateSaveButtonState();

        // Re-renderizar la lista de bloques
        displayBlockStructure(JSON.stringify(blocks));

        // Actualizar previsualización
        renderPreview(blocks);

        // Mantener la selección del bloque
        setTimeout(() => {
            const movedBlock = document.querySelector(`[data-block-id="${blockId}"]`);
            if (movedBlock) {
                movedBlock.classList.add('active');
            }
        }, 0);
    }

    // Función para actualizar el estado de los botones mover
    function updateMoveButtonsState() {
        const blocks = editorState.currentPageBlocks;
        
        blocks.forEach((block, index) => {
            const upBtn = document.querySelector(`.move-up[data-block-id="${block.id}"]`);
            const downBtn = document.querySelector(`.move-down[data-block-id="${block.id}"]`);
            
            if (upBtn) upBtn.disabled = index === 0;
            if (downBtn) downBtn.disabled = index === blocks.length - 1;
        });
    }

    // Función para mostrar la configuración de un bloque
    function showBlockSettings(blockId) {
        const settingsContainer = document.getElementById('settings-panel-placeholder');
        if (!settingsContainer) return;

        // Encontrar el bloque en el estado actual
        const block = editorState.currentPageBlocks.find(b => b.id === blockId);
        if (!block) {
            settingsContainer.innerHTML = `
                <div class="settings-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudo encontrar el bloque seleccionado.</p>
                </div>
            `;
            return;
        }

        // Obtener el esquema de configuración para este tipo de bloque
        const schema = blockSettingsSchemas[block.type];
        if (!schema) {
            settingsContainer.innerHTML = `
                <div class="settings-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No hay configuraciones disponibles para este tipo de bloque.</p>
                </div>
            `;
            return;
        }

        // Limpiar el contenedor
        settingsContainer.innerHTML = '';

        // Crear el header de configuración
        const header = document.createElement('div');
        header.className = 'settings-block-header';
        header.innerHTML = `
            <h6>Editando: ${block.type}</h6>
            <small class="text-muted">ID: ${blockId}</small>
        `;
        settingsContainer.appendChild(header);

        // Crear el formulario de configuración
        const form = document.createElement('form');
        form.className = 'settings-form';
        form.id = 'block-settings-form';

        // Generar campos según el esquema
        schema.forEach(field => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = `setting-${field.propertyName}`;
            label.textContent = field.label;
            fieldGroup.appendChild(label);

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 4;
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }

            input.id = `setting-${field.propertyName}`;
            input.name = field.propertyName;
            input.className = 'form-control';
            
            // Establecer el valor actual
            const currentValue = block.settings?.[field.propertyName] || '';
            input.value = currentValue;

            // Añadir listener para cambios
            input.addEventListener('input', function() {
                updateBlockSetting(blockId, field.propertyName, this.value);
                // Actualizar previsualización en tiempo real
                renderPreview(editorState.currentPageBlocks);
            });

            fieldGroup.appendChild(input);
            form.appendChild(fieldGroup);
        });

        settingsContainer.appendChild(form);
        
        // Guardar el ID del bloque seleccionado
        editorState.selectedBlockId = blockId;
    }

    // Función para actualizar un setting de un bloque
    function updateBlockSetting(blockId, propertyName, value) {
        // Encontrar el bloque en el estado actual
        const block = editorState.currentPageBlocks.find(b => b.id === blockId);
        if (!block) return;

        // Asegurar que el objeto settings existe
        if (!block.settings) {
            block.settings = {};
        }

        // Actualizar el valor
        block.settings[propertyName] = value;

        // Marcar que hay cambios sin guardar
        editorState.hasUnsavedChanges = true;
        updateSaveButtonState();

        console.log(`Actualizado ${propertyName} del bloque ${blockId}:`, value);
    }

    // Función para actualizar el estado del botón guardar
    function updateSaveButtonState() {
        const saveBtn = document.getElementById('save-builder-changes-btn');
        if (!saveBtn) return;

        if (editorState.hasUnsavedChanges) {
            saveBtn.classList.add('has-changes');
            saveBtn.innerHTML = `
                <i class="fas fa-save"></i>
                <span data-i18n="builder.save">Guardar</span>
                <span class="unsaved-indicator">*</span>
            `;
        } else {
            saveBtn.classList.remove('has-changes');
            saveBtn.innerHTML = `
                <i class="fas fa-save"></i>
                <span data-i18n="builder.save">Guardar</span>
            `;
        }
    }

    // Función para renderizar la vista previa de los bloques
    function renderPreview(blocksArray) {
        const previewContainer = document.getElementById('preview-content-placeholder');
        if (!previewContainer) return;

        // Limpiar contenido anterior
        previewContainer.innerHTML = '';

        if (!blocksArray || blocksArray.length === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-eye"></i>
                    <h4>Área de Previsualización</h4>
                    <p>La vista previa de su sitio web aparecerá aquí</p>
                </div>
            `;
            return;
        }

        // Log para depuración
        console.log("Renderizando previsualización con bloques:", JSON.parse(JSON.stringify(blocksArray)));

        // Renderizar cada bloque
        blocksArray.forEach(block => {
            console.log("Renderizando bloque:", block.type, "con settings:", block.settings);
            
            let blockHtml = '';
            const renderer = blockRenderers[block.type];
            
            if (renderer) {
                // Llamar al renderer pasando settings, id y type
                blockHtml = renderer(block.settings || {}, block.id, block.type);
            } else {
                // Renderizar placeholder para bloques desconocidos
                console.warn(`No se encontró renderer para el tipo de bloque: ${block.type}`);
                blockHtml = `<div class="placeholder-block unknown-block" style="border:2px dashed #ff0000; padding:20px; margin:10px; background-color: #ffe5e5; border-radius: 8px;">
                    <h3 style="color: #cc0000; margin-top: 0;">⚠️ Bloque Desconocido: ${block.type}</h3>
                    <p style="margin: 10px 0;"><strong>ID:</strong> ${block.id}</p>
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer; color: #666;">Ver configuración</summary>
                        <pre style="font-size:12px; white-space:pre-wrap; word-break:break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">${JSON.stringify(block.settings || {}, null, 2)}</pre>
                    </details>
                </div>`;
            }
            
            console.log("HTML generado para", block.type, ":", blockHtml.substring(0, 100) + "...");
            
            const blockElement = document.createElement('div');
            blockElement.innerHTML = blockHtml;
            blockElement.setAttribute('data-block-id', block.id);
            blockElement.className = 'preview-block-wrapper';
            previewContainer.appendChild(blockElement);
        });
        
        // Inicializar funcionalidad de acordeón para bloques FAQ
        initializeFaqAccordions();
    }
    
    // Función para inicializar los acordeones de FAQ
    function initializeFaqAccordions() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            // Remover listeners existentes para evitar duplicados
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            // Añadir nuevo listener
            newQuestion.addEventListener('click', function() {
                const faqItem = this.closest('.faq-item');
                const answer = faqItem.querySelector('.faq-answer');
                const icon = this.querySelector('.faq-toggle-icon');
                const isOpen = faqItem.classList.contains('open');
                
                if (isOpen) {
                    // Cerrar
                    faqItem.classList.remove('open');
                    answer.style.display = 'none';
                    this.setAttribute('aria-expanded', 'false');
                    icon.textContent = '+';
                } else {
                    // Abrir
                    faqItem.classList.add('open');
                    answer.style.display = 'block';
                    this.setAttribute('aria-expanded', 'true');
                    icon.textContent = '−';
                }
            });
        });
    }

    // Función para renderizar la lista de bloques en el sidebar
    function renderBlocksList(blocksArray) {
        const blocksContainer = document.getElementById('blocks-list-placeholder');
        if (!blocksContainer) return;

        // Limpiar contenido anterior
        blocksContainer.innerHTML = '';

        if (!blocksArray || blocksArray.length === 0) {
            blocksContainer.innerHTML = '<li class="empty-state">No hay bloques en esta página</li>';
            return;
        }

        // Crear elementos de lista para cada bloque
        blocksArray.forEach((block, index) => {
            const li = document.createElement('li');
            li.className = 'block-item';
            li.setAttribute('data-block-id', block.id || '');
            li.setAttribute('role', 'button');
            li.setAttribute('tabindex', '0');
            
            // Iconos según el tipo de bloque
            const iconMap = {
                'Hero': 'fa-image',
                'Text': 'fa-align-left',
                'Gallery': 'fa-images',
                'Header': 'fa-bars',
                'Footer': 'fa-bars',
                'Services': 'fa-th',
                'Testimonials': 'fa-comment-dots',
                'Contact': 'fa-envelope',
                'Image': 'fa-image'
            };

            const icon = iconMap[block.type] || 'fa-cube';
            const blockName = block.settings?.title || block.type || 'Bloque';
            
            li.innerHTML = `
                <div class="block-info">
                    <i class="fas ${icon}"></i>
                    <span>${blockName}</span>
                </div>
                <div class="block-actions">
                    <button class="block-action-btn move-up" data-block-id="${block.id}" title="Mover arriba" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="block-action-btn move-down" data-block-id="${block.id}" title="Mover abajo" ${index === blocksArray.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="block-action-btn delete-block" data-block-id="${block.id}" title="Eliminar bloque">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Event listener para seleccionar bloque
            li.addEventListener('click', function(e) {
                if (!e.target.closest('.block-actions')) {
                    // Remover selección anterior
                    document.querySelectorAll('.block-item.selected').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Seleccionar este bloque
                    li.classList.add('selected');
                    
                    // Mostrar configuraciones del bloque
                    showBlockSettings(block.id);
                }
            });

            blocksContainer.appendChild(li);
        });

        // Agregar event listeners para las acciones de bloques
        attachBlockActionHandlers();
    }

    // Función para agregar event listeners a las acciones de bloques
    function attachBlockActionHandlers() {
        // Botones de mover arriba
        document.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                moveBlock(blockId, 'up');
            });
        });

        // Botones de mover abajo
        document.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                moveBlock(blockId, 'down');
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.delete-block').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const blockId = this.getAttribute('data-block-id');
                deleteBlock(blockId);
            });
        });
    }

    // Función para guardar los cambios (maneja ambos modos: bloques y tema)
    async function savePageChanges() {
        // Verificar en qué modo estamos
        if (editorState.editorMode === 'theme') {
            // Estamos en modo configuración del tema
            await saveGlobalThemeChanges();
        } else {
            // Estamos en modo edición de bloques
            await savePageBlocksChanges();
        }
    }

    // Función para guardar los cambios de los bloques de la página
    async function savePageBlocksChanges() {
        if (!editorState.websiteId || !editorState.currentPageId) {
            alert('No se pudo identificar la página actual.');
            return;
        }

        if (!editorState.hasUnsavedChanges) {
            showNotification('No hay cambios para guardar.', 'info');
            return;
        }

        const saveBtn = document.getElementById('save-builder-changes-btn');
        const originalContent = saveBtn.innerHTML;

        try {
            // Mostrar estado de guardando
            saveBtn.disabled = true;
            saveBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>Guardando...</span>
            `;

            // Convertir los bloques actuales a JSON string
            const pageStructureJson = JSON.stringify(editorState.currentPageBlocks);

            // Preparar datos para enviar
            const updateData = {
                pageStructureJson: pageStructureJson
            };

            // Enviar petición PUT
            await api.put(
                `/api/builder/websites/${editorState.websiteId}/pages/${editorState.currentPageId}`,
                updateData
            );

            // Actualizar estado
            editorState.hasUnsavedChanges = false;
            updateSaveButtonState();

            // Mostrar notificación de éxito
            showNotification('Cambios guardados exitosamente.', 'success');

        } catch (error) {
            console.error('Error al guardar:', error);
            showNotification('Error al guardar los cambios. Por favor, intente nuevamente.', 'error');
        } finally {
            // Restaurar botón
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalContent;
        }
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Por ahora usar alert, pero se puede mejorar con toast notifications
        const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : 'ℹ️ ';
        alert(prefix + message);
    }

    // Función para mostrar la configuración global del tema
    function showGlobalThemeSettings() {
        // Cambiar modo del editor
        editorState.editorMode = 'theme';
        
        // Limpiar el panel de bloques
        const blocksContainer = document.getElementById('blocks-list-placeholder');
        if (blocksContainer) {
            blocksContainer.innerHTML = `
                <div class="theme-mode-indicator">
                    <i class="fas fa-palette"></i>
                    <h5>Modo Configuración del Tema</h5>
                    <p>Editando configuraciones globales del sitio web</p>
                    <button class="btn-back-to-blocks" onclick="showPageBlocks()">
                        <i class="fas fa-arrow-left"></i>
                        Volver a Bloques
                    </button>
                </div>
            `;
        }
        
        // Mostrar configuraciones del tema en el panel de settings
        const settingsContainer = document.getElementById('settings-panel-placeholder');
        if (!settingsContainer) return;
        
        // Limpiar el contenedor
        settingsContainer.innerHTML = '';
        
        // Crear el header
        const header = document.createElement('div');
        header.className = 'settings-block-header';
        header.innerHTML = `
            <h6>Configuración Global del Tema</h6>
            <small class="text-muted">Personaliza la apariencia de todo tu sitio</small>
        `;
        settingsContainer.appendChild(header);
        
        // Crear el formulario
        const form = document.createElement('form');
        form.className = 'settings-form theme-settings-form';
        form.id = 'theme-settings-form';
        
        // Generar campos según el esquema
        globalThemeSettingsSchema.forEach(field => {
            if (field.sectionTitle) {
                // Es un título de sección
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'settings-section-header';
                sectionHeader.innerHTML = `<h6>${field.sectionTitle}</h6>`;
                form.appendChild(sectionHeader);
            } else {
                // Es un campo normal
                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.htmlFor = `theme-${field.propertyName}`;
                label.textContent = field.label;
                fieldGroup.appendChild(label);
                
                let input;
                if (field.type === 'select') {
                    input = document.createElement('select');
                    input.className = 'form-control';
                    
                    // Agregar opciones
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        input.appendChild(optionElement);
                    });
                } else if (field.type === 'color') {
                    input = document.createElement('input');
                    input.type = 'color';
                    input.className = 'form-control color-input';
                } else {
                    input = document.createElement('input');
                    input.type = field.type;
                    input.className = 'form-control';
                }
                
                input.id = `theme-${field.propertyName}`;
                input.name = field.propertyName;
                
                // Establecer el valor actual o el valor por defecto
                const currentValue = editorState.currentGlobalThemeSettings[field.propertyName] || field.defaultValue || '';
                input.value = currentValue;
                
                // Añadir listener para cambios
                input.addEventListener('input', function() {
                    updateGlobalThemeSetting(field.propertyName, this.value);
                });
                
                fieldGroup.appendChild(input);
                form.appendChild(fieldGroup);
            }
        });
        
        // Agregar botón de resetear settings globales
        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.id = 'reset-global-settings-btn';
        resetButton.className = 'btn-reset-global-settings';
        resetButton.innerHTML = `
            <i class="fas fa-undo"></i>
            Resetear a Defaults de Plantilla
        `;
        resetButton.addEventListener('click', resetGlobalSettingsToDefaults);
        
        form.appendChild(resetButton);
        settingsContainer.appendChild(form);
    }

    // Función para volver a la vista de bloques
    window.showPageBlocks = function() {
        // Cambiar modo del editor
        editorState.editorMode = 'blocks';
        
        // Recargar la estructura de bloques
        if (editorState.currentPageData) {
            displayBlockStructure(editorState.currentPageData.pageStructureJson);
        }
        
        // Resetear panel de settings
        const settingsPlaceholder = document.getElementById('settings-panel-placeholder');
        if (settingsPlaceholder) {
            settingsPlaceholder.innerHTML = `
                <div class="placeholder-icon">
                    <i class="fas fa-sliders-h"></i>
                </div>
                <p data-i18n="builder.selectElement">Seleccione un elemento para editar sus propiedades.</p>
            `;
        }
    };

    // Función para actualizar un setting global del tema
    function updateGlobalThemeSetting(propertyName, value) {
        // Actualizar el valor en memoria
        editorState.currentGlobalThemeSettings[propertyName] = value;
        
        // Marcar que hay cambios sin guardar
        editorState.hasUnsavedChanges = true;
        updateSaveButtonState();
        
        // Aplicar estilos globales inmediatamente
        applyGlobalThemeStyles(editorState.currentGlobalThemeSettings);
        
        // Re-renderizar la previsualización para que los bloques usen los nuevos estilos
        renderPreview(editorState.currentPageBlocks);
        
        console.log(`Actualizado setting global ${propertyName}:`, value);
    }

    // Función para aplicar estilos globales a la previsualización
    function applyGlobalThemeStyles(themeSettings) {
        const previewContainer = document.getElementById('preview-content-placeholder');
        if (!previewContainer) return;
        
        // Crear o actualizar el elemento style para los estilos globales
        let styleElement = document.getElementById('global-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'global-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        // Generar CSS con las variables globales
        const cssVars = `
            #preview-content-placeholder {
                --global-bg-color: ${themeSettings.backgroundColor || '#ffffff'};
                --global-text-color: ${themeSettings.textColor || '#333333'};
                --global-accent-color: ${themeSettings.accentColor || '#e91e63'};
                --global-body-font: ${themeSettings.bodyFont || 'Arial'}, sans-serif;
                --global-heading-font: ${themeSettings.headingFont || 'Arial Black'}, sans-serif;
            }
            
            #preview-content-placeholder .preview-page-container {
                background-color: var(--global-bg-color);
                color: var(--global-text-color);
                font-family: var(--global-body-font);
            }
            
            #preview-content-placeholder h1,
            #preview-content-placeholder h2,
            #preview-content-placeholder h3,
            #preview-content-placeholder h4,
            #preview-content-placeholder h5,
            #preview-content-placeholder h6 {
                font-family: var(--global-heading-font);
                color: var(--global-text-color);
            }
            
            #preview-content-placeholder a {
                color: var(--global-accent-color);
            }
            
            #preview-content-placeholder .hero-button,
            #preview-content-placeholder .contact-button {
                background-color: var(--global-accent-color);
                border-color: var(--global-accent-color);
            }
            
            #preview-content-placeholder .header-nav a {
                color: var(--global-text-color);
            }
            
            #preview-content-placeholder .header-nav a:hover {
                color: var(--global-accent-color);
            }
        `;
        
        styleElement.textContent = cssVars;
    }

    // Función para guardar los cambios globales del tema
    async function saveGlobalThemeChanges() {
        if (!editorState.websiteId) {
            alert('No se pudo identificar el sitio web actual.');
            return;
        }
        
        const saveBtn = document.getElementById('save-builder-changes-btn');
        const originalContent = saveBtn.innerHTML;
        
        try {
            // Mostrar estado de guardando
            saveBtn.disabled = true;
            saveBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>Guardando...</span>
            `;
            
            // Convertir los settings globales a JSON string
            const globalThemeSettingsJson = JSON.stringify(editorState.currentGlobalThemeSettings);
            
            // Enviar petición PUT
            await api.put(
                `/api/builder/websites/current/global-settings`,
                { globalThemeSettingsJson: globalThemeSettingsJson }
            );
            
            // Actualizar estado
            editorState.hasUnsavedChanges = false;
            updateSaveButtonState();
            
            // Mostrar notificación de éxito
            showNotification('Configuración del tema guardada exitosamente.', 'success');
            
        } catch (error) {
            console.error('Error al guardar configuración del tema:', error);
            showNotification('Error al guardar la configuración del tema. Por favor, intente nuevamente.', 'error');
        } finally {
            // Restaurar botón
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalContent;
        }
    }

    // Estados del panel lateral
    const SIDEBAR_STATES = {
        BLOCKS_LIST: 'blocks_list',
        BLOCK_SETTINGS: 'block_settings',
        ADD_SECTION: 'add_section',
        THEME_SETTINGS: 'theme_settings'
    };
    
    let currentSidebarState = SIDEBAR_STATES.BLOCKS_LIST;
    let previousSidebarState = null;
    
    // Función para cambiar el estado del panel lateral
    function changeSidebarState(newState, data = {}) {
        previousSidebarState = currentSidebarState;
        currentSidebarState = newState;
        
        const container = document.getElementById('sidebar-state-container');
        if (!container) return;
        
        switch (newState) {
            case SIDEBAR_STATES.BLOCKS_LIST:
                renderBlocksListState(container);
                break;
            case SIDEBAR_STATES.BLOCK_SETTINGS:
                renderBlockSettingsState(container, data.blockId);
                break;
            case SIDEBAR_STATES.ADD_SECTION:
                renderAddSectionState(container);
                break;
            case SIDEBAR_STATES.THEME_SETTINGS:
                renderThemeSettingsState(container);
                break;
        }
    }
    
    // Renderizar estado: Lista de Bloques
    function renderBlocksListState(container) {
        container.innerHTML = `
            <div class="sidebar-header">
                <h5 class="sidebar-title">
                    <span data-i18n="builder.page">Página</span>: 
                    <span id="current-page-name">${editorState.currentPage?.title || 'Página de inicio'}</span>
                </h5>
            </div>
            
            <div class="sidebar-content">
                <div class="blocks-hierarchy">
                    <ul id="blocks-list-placeholder" class="blocks-list">
                        ${editorState.currentPageBlocks.length === 0 ? 
                            '<li class="empty-state">No hay bloques en esta página</li>' : ''}
                    </ul>
                </div>
            </div>
            
            <div class="sidebar-footer">
                <button id="add-section-btn" class="btn-add-section">
                    <i class="fas fa-plus"></i>
                    <span data-i18n="builder.addSection">Añadir Sección</span>
                </button>
                <button id="reset-page-structure-btn" class="btn-reset-page" title="Resetear página a valores por defecto de la plantilla">
                    <i class="fas fa-undo"></i>
                    <span>Resetear Página a Defaults</span>
                </button>
                <button id="theme-settings-btn" class="btn-theme-settings">
                    <i class="fas fa-palette"></i>
                    <span data-i18n="builder.themeSettings">Configuración del Tema</span>
                </button>
            </div>
        `;
        
        // Renderizar la lista de bloques actual
        if (editorState.currentPageBlocks.length > 0) {
            renderBlocksList(editorState.currentPageBlocks);
        }
        
        // Re-adjuntar event listeners
        attachSidebarEventListeners();
    }
    
    // Renderizar estado: Settings de Bloque
    function renderBlockSettingsState(container, blockId) {
        const block = editorState.currentPageBlocks.find(b => b.id === blockId);
        if (!block) {
            changeSidebarState(SIDEBAR_STATES.BLOCKS_LIST);
            return;
        }
        
        container.innerHTML = `
            <div class="sidebar-header">
                <button class="sidebar-back-btn" id="sidebar-back-btn">
                    <i class="fas fa-arrow-left"></i>
                    <span>Volver</span>
                </button>
                <h5 class="sidebar-title">
                    Editando: ${block.type}
                </h5>
            </div>
            
            <div class="sidebar-content">
                <div class="settings-form" id="block-settings-form">
                    <!-- Los campos se generarán dinámicamente -->
                </div>
            </div>
        `;
        
        // Botón volver
        const backBtn = document.getElementById('sidebar-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => changeSidebarState(SIDEBAR_STATES.BLOCKS_LIST));
        }
        
        // Generar el formulario de settings
        const settingsContainer = document.getElementById('block-settings-form');
        if (settingsContainer) {
            renderBlockSettingsForm(block, settingsContainer);
        }
    }
    
    // Renderizar estado: Añadir Sección
    function renderAddSectionState(container) {
        container.innerHTML = `
            <div class="sidebar-header">
                <button class="sidebar-back-btn" id="sidebar-back-btn">
                    <i class="fas fa-arrow-left"></i>
                    <span>Volver</span>
                </button>
                <h5 class="sidebar-title">
                    Añadir Sección
                </h5>
            </div>
            
            <div class="sidebar-content">
                <div class="blocks-library" id="blocks-library-sidebar">
                    <!-- Los tipos de bloques se generarán dinámicamente -->
                </div>
            </div>
        `;
        
        // Botón volver
        const backBtn = document.getElementById('sidebar-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => changeSidebarState(SIDEBAR_STATES.BLOCKS_LIST));
        }
        
        // Generar biblioteca de bloques
        const library = document.getElementById('blocks-library-sidebar');
        if (library) {
            Object.keys(blockSettingsSchemas).forEach(type => {
                const info = blockTypeInfo[type] || { icon: 'fa-cube', desc: type };
                
                const blockItem = document.createElement('div');
                blockItem.className = 'block-type-item';
                blockItem.setAttribute('data-block-type', type);
                
                blockItem.innerHTML = `
                    <div class="block-type-icon">
                        <i class="fas ${info.icon}"></i>
                    </div>
                    <div class="block-type-name">${type}</div>
                    <div class="block-type-desc">${info.desc}</div>
                `;
                
                blockItem.addEventListener('click', function() {
                    addNewBlock(type);
                    changeSidebarState(SIDEBAR_STATES.BLOCKS_LIST);
                });
                
                library.appendChild(blockItem);
            });
        }
    }
    
    // Renderizar estado: Configuración del Tema
    function renderThemeSettingsState(container) {
        container.innerHTML = `
            <div class="sidebar-header">
                <button class="sidebar-back-btn" id="sidebar-back-btn">
                    <i class="fas fa-arrow-left"></i>
                    <span>Volver</span>
                </button>
                <h5 class="sidebar-title">
                    Configuración del Tema
                </h5>
            </div>
            
            <div class="sidebar-content">
                <div class="settings-form" id="theme-settings-form">
                    <!-- Los campos se generarán dinámicamente -->
                </div>
                <button class="btn-reset-global-settings" id="reset-global-settings-btn">
                    <i class="fas fa-undo"></i>
                    Resetear a Valores por Defecto de la Plantilla
                </button>
            </div>
        `;
        
        // Botón volver
        const backBtn = document.getElementById('sidebar-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                editorState.editorMode = 'blocks';
                changeSidebarState(SIDEBAR_STATES.BLOCKS_LIST);
            });
        }
        
        // Cambiar a modo tema
        editorState.editorMode = 'theme';
        
        // Generar el formulario de configuración global
        renderThemeSettingsForm();
        
        // Botón resetear
        const resetBtn = document.getElementById('reset-global-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetGlobalSettingsToDefaults);
        }
    }
    
    // Función auxiliar para re-adjuntar event listeners después de cambiar el estado
    function attachSidebarEventListeners() {
        // Event listener para botón de añadir sección
        const addSectionBtn = document.getElementById('add-section-btn');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', function() {
                changeSidebarState(SIDEBAR_STATES.ADD_SECTION);
            });
        }
        
        // Event listener para botón de configuración del tema
        const themeSettingsBtn = document.getElementById('theme-settings-btn');
        if (themeSettingsBtn) {
            themeSettingsBtn.addEventListener('click', function() {
                changeSidebarState(SIDEBAR_STATES.THEME_SETTINGS);
            });
        }
        
        // Event listener para botón de resetear página
        const resetPageBtn = document.getElementById('reset-page-structure-btn');
        if (resetPageBtn) {
            resetPageBtn.addEventListener('click', resetPageStructure);
        }
    }
    
    // Renderizar formulario de settings de bloque
    function renderBlockSettingsForm(block, container) {
        const schema = blockSettingsSchemas[block.type];
        if (!schema) {
            container.innerHTML = '<p class="text-muted">No hay configuraciones disponibles para este tipo de bloque.</p>';
            return;
        }
        
        const form = document.createElement('form');
        form.className = 'settings-form';
        
        schema.forEach(field => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = `field-${field.propertyName}`;
            label.textContent = field.label;
            fieldGroup.appendChild(label);
            
            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 4;
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }
            
            input.className = 'form-control';
            input.id = `field-${field.propertyName}`;
            input.name = field.propertyName;
            input.value = block.settings[field.propertyName] || '';
            
            // Listener para actualizar en tiempo real
            input.addEventListener('input', function() {
                updateBlockSetting(block.id, field.propertyName, this.value);
            });
            
            fieldGroup.appendChild(input);
            form.appendChild(fieldGroup);
        });
        
        container.appendChild(form);
    }
    
    // Renderizar formulario de configuración del tema
    function renderThemeSettingsForm() {
        const container = document.getElementById('theme-settings-form');
        if (!container) return;
        
        const form = document.createElement('form');
        form.className = 'settings-form theme-settings-form';
        
        globalThemeSettingsSchema.forEach(field => {
            if (field.sectionTitle) {
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'settings-section-header';
                sectionHeader.innerHTML = `<h6>${field.sectionTitle}</h6>`;
                form.appendChild(sectionHeader);
            } else {
                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.htmlFor = `theme-${field.propertyName}`;
                label.textContent = field.label;
                fieldGroup.appendChild(label);
                
                let input;
                if (field.type === 'select') {
                    input = document.createElement('select');
                    input.className = 'form-control';
                    
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        input.appendChild(optionElement);
                    });
                } else if (field.type === 'color') {
                    input = document.createElement('input');
                    input.type = 'color';
                    input.className = 'form-control color-input';
                } else {
                    input = document.createElement('input');
                    input.type = field.type;
                    input.className = 'form-control';
                }
                
                input.id = `theme-${field.propertyName}`;
                input.name = field.propertyName;
                
                const currentValue = editorState.currentGlobalThemeSettings[field.propertyName] || field.defaultValue || '';
                input.value = currentValue;
                
                input.addEventListener('input', function() {
                    updateGlobalThemeSetting(field.propertyName, this.value);
                });
                
                fieldGroup.appendChild(input);
                form.appendChild(fieldGroup);
            }
        });
        
        container.appendChild(form);
    }

    // Función principal de inicialización
    async function initializeBuilder() {
        try {
            // 1. Obtener el sitio web actual
            const website = await api.get('/api/builder/websites/current');
            editorState.websiteId = website.id;
            
            // Guardar en estado
            editorState.currentWebSite = website;
            editorState.websiteId = website.id;
            
            // Procesar información de plantilla
            if (website.selectedThemeOrTemplateId) {
                editorState.selectedTemplateId = website.selectedThemeOrTemplateId;
                editorState.templateDisplayName = getTemplateDisplayName(website.selectedThemeOrTemplateId);
            }
            
            // Parsear configuraciones globales del tema
            if (website.globalThemeSettingsJson) {
                try {
                    editorState.currentGlobalThemeSettings = JSON.parse(website.globalThemeSettingsJson);
                } catch (e) {
                    console.error('Error al parsear GlobalThemeSettingsJson:', e);
                    editorState.currentGlobalThemeSettings = {};
                }
            }
            
            // Aplicar estilos globales iniciales
            applyGlobalThemeStyles(editorState.currentGlobalThemeSettings);

            console.log('Sitio web cargado:', website);
            
            // Actualizar información de plantilla en UI
            updateTemplateInfoUI();

            // 2. Obtener lista de páginas
            const pages = await api.get(`/api/builder/websites/${website.id}/pages`);
            editorState.pages = pages;

            console.log('Páginas cargadas:', pages);

            // 3. Poblar el selector de páginas
            populatePageSelector();

            // 4. Cargar la primera página seleccionada (ya se maneja en populatePageSelector)
            // populatePageSelector ya configura la primera página y actualiza el estado

            // 5. Event listener para cambio de página ya está configurado en setupEventListeners

            // 6. Configurar otros event listeners
            setupEventListeners();

        } catch (error) {
            console.error('Error al inicializar el builder:', error);
        }
    }

    // Configurar event listeners adicionales
    function setupEventListeners() {
        // Botón de añadir sección
        const addSectionBtn = document.getElementById('add-section-btn');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', showAddSectionModal);
        }

        // Botón cerrar modal de añadir sección
        const closeModalBtn = document.getElementById('close-add-section-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideAddSectionModal);
        }

        // Click en overlay para cerrar modal
        const modalOverlay = document.getElementById('add-section-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', hideAddSectionModal);
        }

        // Botón de configuración del tema
        const themeSettingsBtn = document.getElementById('theme-settings-btn');
        if (themeSettingsBtn) {
            themeSettingsBtn.addEventListener('click', showGlobalThemeSettings);
        }

        // Botón de resetear página
        const resetPageBtn = document.getElementById('reset-page-structure-btn');
        if (resetPageBtn) {
            resetPageBtn.addEventListener('click', resetPageStructureToDefaults);
        }

        // Botones de vista de dispositivo
        const deviceBtns = document.querySelectorAll('.device-btn');
        deviceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                deviceBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const view = this.getAttribute('data-view');
                console.log('Vista cambiada a:', view);
                // TODO: Implementar cambio de vista de dispositivo
            });
        });

        // Botón de guardar
        const saveBtn = document.getElementById('save-builder-changes-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', savePageChanges);
        }

        // Event listeners para gestión de páginas
        const createPageBtn = document.getElementById('create-new-page-btn');
        const deletePageBtn = document.getElementById('delete-current-page-btn');
        const changeTemplateBtn = document.getElementById('change-template-btn');
        
        if (createPageBtn) {
            createPageBtn.addEventListener('click', showCreatePageModal);
        }
        
        if (deletePageBtn) {
            deletePageBtn.addEventListener('click', deleteCurrentPage);
        }
        
        if (changeTemplateBtn) {
            changeTemplateBtn.addEventListener('click', showChangeTemplateModal);
        }
        
        // Event listeners para el modal de crear página
        const closeCreatePageModal = document.getElementById('close-create-page-modal');
        const createPageOverlay = document.getElementById('create-page-modal-overlay');
        const cancelCreatePageBtn = document.getElementById('cancel-create-page-btn');
        const createPageForm = document.getElementById('create-page-form');
        const pageTitleInput = document.getElementById('page-title-input');
        const pageSlugInput = document.getElementById('page-slug-input');
        
        if (closeCreatePageModal) {
            closeCreatePageModal.addEventListener('click', hideCreatePageModal);
        }
        
        if (createPageOverlay) {
            createPageOverlay.addEventListener('click', hideCreatePageModal);
        }
        
        if (cancelCreatePageBtn) {
            cancelCreatePageBtn.addEventListener('click', hideCreatePageModal);
        }
        
        if (createPageForm) {
            createPageForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const title = pageTitleInput.value;
                const slug = pageSlugInput.value;
                await createNewPage(title, slug);
            });
        }
        
        // Auto-generar slug cuando se escriba el título
        if (pageTitleInput && pageSlugInput) {
            pageTitleInput.addEventListener('input', function(e) {
                const title = e.target.value;
                if (title && !pageSlugInput.dataset.userModified) {
                    pageSlugInput.value = generateSlugFromTitle(title);
                }
            });
            
            // Marcar como modificado por usuario cuando se edite manualmente el slug
            pageSlugInput.addEventListener('input', function(e) {
                e.target.dataset.userModified = 'true';
            });
        }
        
        // Event listener para cambio de página en el selector
        const pageSelector = document.getElementById('page-selector');
        if (pageSelector) {
            pageSelector.addEventListener('change', async function(e) {
                const selectedSlug = e.target.value;
                const selectedOption = e.target.selectedOptions[0];
                
                if (selectedOption) {
                    const pageId = parseInt(selectedOption.getAttribute('data-page-id'));
                    const isSystemPage = selectedOption.getAttribute('data-is-system') === 'true';
                    
                    // Actualizar estado
                    editorState.currentPage = editorState.availablePages.find(p => p.id === pageId);
                    editorState.currentPageIsSystem = isSystemPage;
                    
                    // Actualizar botones
                    updateDeletePageButtonState();
                    
                    // Cargar contenido de la página
                    await loadPageContent(selectedSlug);
                }
            });
        }

        // Event listeners para el modal de cambiar plantilla
        const closeChangeTemplateModalBtn = document.getElementById('close-change-template-modal');
        const changeTemplateOverlay = document.getElementById('change-template-modal-overlay');
        const cancelChangeTemplateBtn = document.getElementById('cancel-change-template-btn');
        const applyTemplateBtn = document.getElementById('apply-template-btn');
        
        if (closeChangeTemplateModalBtn) {
            closeChangeTemplateModalBtn.addEventListener('click', hideChangeTemplateModal);
        }
        
        if (changeTemplateOverlay) {
            changeTemplateOverlay.addEventListener('click', hideChangeTemplateModal);
        }
        
        if (cancelChangeTemplateBtn) {
            cancelChangeTemplateBtn.addEventListener('click', hideChangeTemplateModal);
        }
        
        if (applyTemplateBtn) {
            applyTemplateBtn.addEventListener('click', applySelectedTemplate);
        }
    }

    // Función para mostrar el modal de añadir sección
    function showAddSectionModal() {
        const modal = document.getElementById('add-section-modal');
        const overlay = document.getElementById('add-section-modal-overlay');
        const library = document.getElementById('blocks-library');

        // Limpiar biblioteca actual
        library.innerHTML = '';

        // Generar tipos de bloques disponibles
        Object.keys(blockSettingsSchemas).forEach(type => {
            const info = blockTypeInfo[type] || { icon: 'fa-cube', desc: type };
            
            const blockItem = document.createElement('div');
            blockItem.className = 'block-type-item';
            blockItem.setAttribute('data-block-type', type);
            
            blockItem.innerHTML = `
                <div class="block-type-icon">
                    <i class="fas ${info.icon}"></i>
                </div>
                <div class="block-type-name">${type}</div>
                <div class="block-type-desc">${info.desc}</div>
            `;
            
            blockItem.addEventListener('click', function() {
                addNewBlock(type);
            });
            
            library.appendChild(blockItem);
        });

        // Mostrar modal
        overlay.classList.add('show');
        modal.classList.add('show');
    }

    // Función para ocultar el modal de añadir sección
    function hideAddSectionModal() {
        const modal = document.getElementById('add-section-modal');
        const overlay = document.getElementById('add-section-modal-overlay');
        
        modal.classList.remove('show');
        overlay.classList.remove('show');
    }

    // Función para añadir un nuevo bloque
    function addNewBlock(type) {
        // Generar ID único para el bloque
        const blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Crear objeto del nuevo bloque
        const newBlock = {
            id: blockId,
            type: type,
            settings: {}
        };

        // Inicializar settings con valores por defecto
        const schema = blockSettingsSchemas[type];
        if (schema) {
            schema.forEach(field => {
                // Valores por defecto según el tipo
                let defaultValue = '';
                if (field.propertyName === 'title') {
                    defaultValue = `Nuevo ${type}`;
                } else if (field.propertyName === 'content') {
                    defaultValue = 'Nuevo contenido...';
                } else if (field.propertyName === 'columns') {
                    defaultValue = '3';
                } else if (field.type === 'textarea') {
                    defaultValue = 'Texto de ejemplo...';
                }
                
                newBlock.settings[field.propertyName] = defaultValue;
            });
        }

        // Añadir el bloque al array
        editorState.currentPageBlocks.push(newBlock);

        // Marcar cambios sin guardar
        editorState.hasUnsavedChanges = true;
        updateSaveButtonState();

        // Re-renderizar la lista de bloques
        displayBlockStructure(JSON.stringify(editorState.currentPageBlocks));

        // Actualizar previsualización
        renderPreview(editorState.currentPageBlocks);

        // Cerrar modal
        hideAddSectionModal();

        // Seleccionar automáticamente el nuevo bloque
        setTimeout(() => {
            const newBlockElement = document.querySelector(`[data-block-id="${blockId}"]`);
            if (newBlockElement) {
                newBlockElement.click();
                // Hacer scroll para mostrar el nuevo bloque
                newBlockElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }

    // Función para eliminar un bloque
    function deleteBlock(blockId) {
        // Buscar el bloque
        const blockIndex = editorState.currentPageBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const block = editorState.currentPageBlocks[blockIndex];
        const blockName = block.settings?.title || block.type || 'este bloque';

        // Confirmación
        const confirmMessage = `¿Está seguro de que desea eliminar "${blockName}"?\n\nEsta acción no se puede deshacer.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        // Eliminar el bloque del array
        editorState.currentPageBlocks.splice(blockIndex, 1);

        // Marcar cambios sin guardar
        editorState.hasUnsavedChanges = true;
        updateSaveButtonState();

        // Si el bloque eliminado estaba seleccionado, limpiar el panel de settings
        if (editorState.selectedBlockId === blockId) {
            editorState.selectedBlockId = null;
            const settingsPlaceholder = document.getElementById('settings-panel-placeholder');
            if (settingsPlaceholder) {
                settingsPlaceholder.innerHTML = `
                    <div class="placeholder-icon">
                        <i class="fas fa-sliders-h"></i>
                    </div>
                    <p data-i18n="builder.selectElement">Seleccione un elemento para editar sus propiedades.</p>
                `;
            }
        }

        // Re-renderizar la lista de bloques
        displayBlockStructure(JSON.stringify(editorState.currentPageBlocks));

        // Actualizar previsualización
        renderPreview(editorState.currentPageBlocks);

        // Mostrar notificación
        showNotification(`Bloque "${blockName}" eliminado.`, 'info');
    }

    // Función para generar un ID único
    function generateUniqueId() {
        return 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Función para actualizar el estado del botón eliminar página
    function updateDeletePageButtonState() {
        const deleteBtn = document.getElementById('delete-current-page-btn');
        if (!deleteBtn) return;
        
        // Deshabilitar si es página de sistema o si hay solo una página
        const shouldDisable = editorState.currentPageIsSystem || editorState.availablePages.length <= 1;
        
        deleteBtn.disabled = shouldDisable;
        
        if (shouldDisable) {
            if (editorState.currentPageIsSystem) {
                deleteBtn.title = 'Las páginas del sistema no se pueden eliminar';
            } else {
                deleteBtn.title = 'Debe existir al menos una página';
            }
        } else {
            deleteBtn.title = 'Eliminar Página Actual';
        }
    }

    // Función para mostrar modal de crear página
    function showCreatePageModal() {
        const modal = document.getElementById('create-page-modal');
        const overlay = document.getElementById('create-page-modal-overlay');
        const form = document.getElementById('create-page-form');
        
        // Limpiar formulario
        form.reset();
        
        // Mostrar modal
        overlay.style.display = 'block';
        modal.classList.add('show');
        
        // Focus en el primer input
        document.getElementById('page-title-input').focus();
    }
    
    // Función para ocultar modal de crear página
    function hideCreatePageModal() {
        const modal = document.getElementById('create-page-modal');
        const overlay = document.getElementById('create-page-modal-overlay');
        
        modal.classList.remove('show');
        overlay.style.display = 'none';
    }

    // Función para generar slug automáticamente
    function generateSlugFromTitle(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[áéíóúñ]/g, (match) => {
                const map = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
                return map[match];
            })
            .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
            .replace(/\s+/g, '-') // Reemplazar espacios con guiones
            .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
            .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
    }

    // Función para obtener nombre amigable de plantilla
    function getTemplateDisplayName(templateId) {
        const template = availableTemplates.find(t => t.id === templateId);
        return template ? template.name : `Plantilla: ${templateId}`;
    }

    // Función para actualizar información de plantilla en la UI
    function updateTemplateInfoUI() {
        const templateNameElement = document.getElementById('current-template-name');
        if (templateNameElement && editorState.templateDisplayName) {
            templateNameElement.textContent = editorState.templateDisplayName;
        }
    }

    // Función para mostrar modal de cambio de plantilla
    function showChangeTemplateModal() {
        const modal = document.getElementById('change-template-modal');
        const overlay = document.getElementById('change-template-modal-overlay');
        const grid = document.getElementById('template-selection-grid');
        
        if (!modal || !overlay || !grid) return;
        
        // Limpiar el grid
        grid.innerHTML = '';
        
        // Generar las opciones de plantilla
        availableTemplates.forEach(template => {
            const templateDiv = document.createElement('div');
            templateDiv.className = 'template-option';
            templateDiv.setAttribute('data-template-id', template.id);
            
            // Marcar la plantilla activa
            if (template.id === editorState.selectedTemplateId) {
                templateDiv.classList.add('active');
            }
            
            templateDiv.innerHTML = `
                <div class="template-preview">
                    <div class="template-preview-placeholder">
                        <i class="fas fa-palette"></i>
                    </div>
                </div>
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
            `;
            
            // Click handler para seleccionar plantilla
            templateDiv.addEventListener('click', function() {
                if (!this.classList.contains('active')) {
                    // Remover selección previa
                    document.querySelectorAll('.template-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Marcar como seleccionada
                    this.classList.add('selected');
                    
                    // Habilitar botón de aplicar
                    const applyBtn = document.getElementById('apply-template-btn');
                    if (applyBtn) {
                        applyBtn.disabled = false;
                        applyBtn.setAttribute('data-selected-template', template.id);
                    }
                }
            });
            
            grid.appendChild(templateDiv);
        });
        
        // Mostrar el modal
        overlay.classList.add('show');
        modal.classList.add('show');
    }

    // Función para cerrar modal de cambio de plantilla
    function hideChangeTemplateModal() {
        const modal = document.getElementById('change-template-modal');
        const overlay = document.getElementById('change-template-modal-overlay');
        
        if (modal) modal.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        
        // Resetear botón de aplicar
        const applyBtn = document.getElementById('apply-template-btn');
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.removeAttribute('data-selected-template');
        }
    }

    // Función para aplicar la plantilla seleccionada
    async function applySelectedTemplate() {
        const applyBtn = document.getElementById('apply-template-btn');
        const selectedTemplateId = applyBtn?.getAttribute('data-selected-template');
        
        if (!selectedTemplateId) {
            showNotification('No se ha seleccionado ninguna plantilla', 'error');
            return;
        }
        
        // Confirmar acción
        const confirmed = confirm(
            'Cambiar de plantilla reseteará la estructura de tus páginas y la configuración global del tema a los defaults de la nueva plantilla. ' +
            '¿Estás seguro?'
        );
        
        if (!confirmed) {
            return;
        }
        
        try {
            // Mostrar estado de cargando
            applyBtn.disabled = true;
            const originalContent = applyBtn.innerHTML;
            applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aplicando...';
            
            // Llamar al API para cambiar la plantilla
            const response = await api.put('/api/builder/websites/current/template', {
                templateId: selectedTemplateId
            });
            
            if (response) {
                // Actualizar el estado local
                editorState.selectedTemplateId = selectedTemplateId;
                
                // Cerrar el modal
                hideChangeTemplateModal();
                
                // Mostrar mensaje de éxito
                showNotification('Plantilla cambiada exitosamente. Recargando editor...', 'success');
                
                // Recargar el editor completamente
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error al cambiar plantilla:', error);
            showNotification('Error al cambiar la plantilla. Por favor, intente nuevamente.', 'error');
            
            // Restaurar botón
            const applyBtn = document.getElementById('apply-template-btn');
            if (applyBtn) {
                applyBtn.disabled = false;
                applyBtn.innerHTML = '<i class="fas fa-palette"></i> Aplicar Plantilla Seleccionada';
            }
        }
    }

    // Función para crear nueva página
    async function createNewPage(title, slug) {
        try {
            const websiteId = editorState.currentWebSite?.id || 1;
            
            // Validación básica
            if (!title.trim()) {
                showNotification('El título es obligatorio', 'error');
                return false;
            }
            
            if (!slug.trim()) {
                showNotification('El slug es obligatorio', 'error');
                return false;
            }
            
            // Validar formato de slug
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                showNotification('El slug solo puede contener letras minúsculas, números y guiones', 'error');
                return false;
            }
            
            // Verificar si el slug ya existe
            const slugExists = editorState.availablePages.some(page => page.slug === slug);
            if (slugExists) {
                showNotification('Ya existe una página con ese slug', 'error');
                return false;
            }
            
            // Crear página mediante API
            const newPageData = { title: title.trim(), slug: slug.trim() };
            const newPage = await api.post(`/api/builder/websites/${websiteId}/pages`, newPageData);
            
            // Actualizar estado local
            editorState.availablePages.push(newPage);
            
            // Actualizar selector de páginas
            const pageSelector = document.getElementById('page-selector');
            const option = document.createElement('option');
            option.value = newPage.slug;
            option.textContent = newPage.title;
            option.setAttribute('data-page-id', newPage.id);
            option.setAttribute('data-is-system', 'false');
            pageSelector.appendChild(option);
            
            // Seleccionar la nueva página
            pageSelector.value = newPage.slug;
            editorState.currentPage = newPage;
            editorState.currentPageIsSystem = false;
            
            // Actualizar estado de botones
            updateDeletePageButtonState();
            
            // Cargar contenido de la nueva página (vacía)
            editorState.currentBlocksArray = [];
            renderPreview(editorState.currentBlocksArray);
            renderBlocksList(editorState.currentBlocksArray);
            
            showNotification(`Página "${title}" creada exitosamente`, 'success');
            hideCreatePageModal();
            
            return true;
            
        } catch (error) {
            console.error('Error al crear página:', error);
            
            // Mostrar mensaje de error específico
            if (error.message.includes('slug')) {
                showNotification('El slug ya existe o es inválido', 'error');
            } else {
                showNotification('Error al crear la página', 'error');
            }
            
            return false;
        }
    }

    // Función para eliminar página actual
    async function deleteCurrentPage() {
        try {
            if (!editorState.currentPage) {
                showNotification('No hay página seleccionada', 'error');
                return false;
            }
            
            if (editorState.currentPageIsSystem) {
                showNotification('Las páginas del sistema no se pueden eliminar', 'error');
                return false;
            }
            
            if (editorState.availablePages.length <= 1) {
                showNotification('Debe existir al menos una página', 'error');
                return false;
            }
            
            // Confirmación
            const confirmed = confirm(`¿Estás seguro de eliminar la página "${editorState.currentPage.title}"?`);
            if (!confirmed) {
                return false;
            }
            
            const websiteId = editorState.currentWebSite?.id || 1;
            const pageId = editorState.currentPage.id;
            
            // Eliminar mediante API
            await api.delete(`/api/builder/websites/${websiteId}/pages/${pageId}`);
            
            // Actualizar estado local
            editorState.availablePages = editorState.availablePages.filter(page => page.id !== pageId);
            
            // Remover del selector
            const pageSelector = document.getElementById('page-selector');
            const optionToRemove = pageSelector.querySelector(`option[data-page-id="${pageId}"]`);
            if (optionToRemove) {
                optionToRemove.remove();
            }
            
            // Seleccionar otra página (la primera disponible)
            if (editorState.availablePages.length > 0) {
                const firstPage = editorState.availablePages[0];
                pageSelector.value = firstPage.slug;
                editorState.currentPage = firstPage;
                editorState.currentPageIsSystem = firstPage.isSystemPage;
                
                // Cargar contenido de la nueva página seleccionada
                await loadPageContent(firstPage.slug);
            }
            
            // Actualizar estado de botones
            updateDeletePageButtonState();
            
            showNotification('Página eliminada exitosamente', 'success');
            
            return true;
            
        } catch (error) {
            console.error('Error al eliminar página:', error);
            showNotification('Error al eliminar la página', 'error');
            return false;
        }
    }

    // Función para cargar contenido de una página específica
    async function loadPageContent(pageSlug) {
        try {
            // Obtener datos completos de la página desde el servidor usando el slug
            const websiteId = editorState.websiteId || editorState.currentWebSite?.id;
            if (!websiteId) {
                console.error('Website ID no disponible');
                return;
            }
            
            const pageData = await api.get(`/api/builder/websites/${websiteId}/pages/${pageSlug}`);
            
            // Actualizar estado actual
            editorState.currentPage = pageData;
            editorState.currentPageData = pageData;
            editorState.currentPageId = pageData.id;
            editorState.currentPageIsSystem = pageData.isSystemPage;
            
            // Actualizar el título de la página en UI
            updatePageTitle(pageData.title);
            
            // Parsear estructura de la página
            let blocksArray = [];
            if (pageData.pageStructureJson) {
                try {
                    blocksArray = JSON.parse(pageData.pageStructureJson);
                } catch (e) {
                    console.error('Error al parsear estructura de página:', e);
                    blocksArray = [];
                }
            }
            
            // Actualizar estado de bloques
            editorState.currentBlocksArray = blocksArray;
            editorState.currentPageBlocks = blocksArray;
            
            // Renderizar vista previa y lista de bloques
            renderPreview(blocksArray);
            renderBlocksList(blocksArray);
            
            // Resetear panel de settings
            const settingsPlaceholder = document.getElementById('settings-panel-placeholder');
            if (settingsPlaceholder) {
                settingsPlaceholder.innerHTML = `
                    <div class="placeholder-icon">
                        <i class="fas fa-sliders-h"></i>
                    </div>
                    <p data-i18n="builder.selectElement">Seleccione un elemento para editar sus propiedades.</p>
                `;
            }
            
            // Actualizar botones
            updateDeletePageButtonState();
            
            // Resetear estado de cambios sin guardar
            editorState.hasUnsavedChanges = false;
            updateSaveButtonState();
            
            console.log('Página cargada:', pageData.title, 'con', blocksArray.length, 'bloques');
            
        } catch (error) {
            console.error('Error al cargar página:', error);
            showNotification('Error al cargar la página', 'error');
        }
    }

    // Función legacy para mantener compatibilidad
    function updatePreview(pageData) {
        // Parsear y renderizar los bloques
        try {
            const blocks = JSON.parse(pageData.pageStructureJson || '[]');
            renderPreview(blocks);
        } catch (error) {
            console.error('Error al renderizar previsualización:', error);
        }
    }

    // Función para resetear settings globales a defaults de la plantilla
    async function resetGlobalSettingsToDefaults() {
        try {
            // Confirmar acción
            const confirmed = confirm(
                '¿Estás seguro de que quieres resetear los settings globales a los valores por defecto de la plantilla? ' +
                'Los cambios no guardados se perderán.'
            );
            
            if (!confirmed) {
                return;
            }
            
            // Llamar al nuevo endpoint para obtener los defaults
            const response = await api.get('/api/builder/websites/current/default-global-settings');
            
            if (response.globalThemeSettingsJson) {
                // Parsear los defaults
                const defaultSettings = JSON.parse(response.globalThemeSettingsJson);
                
                // Actualizar el estado en memoria
                editorState.currentGlobalThemeSettings = defaultSettings;
                
                // Actualizar todos los campos del formulario
                globalThemeSettingsSchema.forEach(field => {
                    if (!field.sectionTitle) {
                        const input = document.getElementById(`theme-${field.propertyName}`);
                        if (input) {
                            const value = defaultSettings[field.propertyName] || field.defaultValue || '';
                            input.value = value;
                        }
                    }
                });
                
                // Aplicar estilos inmediatamente
                applyGlobalThemeStyles(defaultSettings);
                
                // Re-renderizar la previsualización
                renderPreview(editorState.currentPageBlocks);
                
                // Marcar cambios sin guardar
                editorState.hasUnsavedChanges = true;
                updateSaveButtonState();
                
                showNotification('Settings globales reseteados a los valores por defecto de la plantilla', 'success');
            }
            
        } catch (error) {
            console.error('Error al resetear settings globales:', error);
            showNotification('Error al obtener los valores por defecto de la plantilla', 'error');
        }
    }

    // Función para resetear la estructura de página a defaults de la plantilla
    async function resetPageStructureToDefaults() {
        try {
            // Confirmar acción
            const confirmed = confirm(
                '¿Estás seguro de que quieres resetear la página a los valores por defecto de la plantilla? ' +
                'Los cambios no guardados se perderán.'
            );
            
            if (!confirmed) {
                return;
            }
            
            const websiteId = editorState.websiteId;
            const pageSlug = editorState.currentPage?.slug || 'home';
            
            // Llamar al nuevo endpoint para obtener los defaults
            const response = await api.get(
                `/api/builder/websites/${websiteId}/pages/${pageSlug}/default-structure`
            );
            
            if (response.pageStructureJson) {
                // Parsear la estructura por defecto
                const defaultBlocks = JSON.parse(response.pageStructureJson);
                
                // Actualizar el estado en memoria
                editorState.currentPageBlocks = defaultBlocks;
                editorState.currentBlocksArray = defaultBlocks;
                
                // Re-renderizar la lista de bloques y la previsualización
                renderBlocksList(defaultBlocks);
                renderPreview(defaultBlocks);
                
                // Limpiar el panel de settings
                const settingsPlaceholder = document.getElementById('settings-panel-placeholder');
                if (settingsPlaceholder) {
                    settingsPlaceholder.innerHTML = `
                        <div class="placeholder-icon">
                            <i class="fas fa-sliders-h"></i>
                        </div>
                        <p data-i18n="builder.selectElement">Seleccione un elemento para editar sus propiedades.</p>
                    `;
                }
                
                // Marcar cambios sin guardar
                editorState.hasUnsavedChanges = true;
                updateSaveButtonState();
                
                showNotification('Página reseteada a los valores por defecto de la plantilla', 'success');
            }
            
        } catch (error) {
            console.error('Error al resetear estructura de página:', error);
            showNotification('Error al obtener los valores por defecto de la plantilla', 'error');
        }
    }

    // Inicializar cuando el DOM esté listo SOLO si estamos en la página de WebsiteBuilder
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Solo inicializar si existe el contenedor específico del website builder
            if (document.querySelector('.website-builder-editor')) {
                initializeBuilder();
            }
        });
    } else {
        // Solo inicializar si existe el contenedor específico del website builder
        if (document.querySelector('.website-builder-editor')) {
            initializeBuilder();
        }
    }

})();