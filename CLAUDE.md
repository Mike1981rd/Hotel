# Memoria del Proyecto Hotel

## Reglas Importantes

### Migraciones de Entity Framework
- **REGLA CRÍTICA**: Los archivos de migración deben ser preparados por Claude
- Solo proporcionar el nombre de la migración al usuario
- El usuario ejecutará el comando de migración desde Visual Studio
- NO ejecutar comandos `dotnet ef` directamente

## Configuración de Base de Datos
- Base de datos: Hotel (PostgreSQL)
- Usuario: postgres
- Contraseña: 123456
- La base de datos ya está creada en pgAdmin

## Estructura del Proyecto
- ASP.NET Core 8.0
- Entity Framework Core con PostgreSQL
- Modelos creados: Room, RoomType, Guest, Reservation, Payment, Company, WebSite, WebPage
- DbContext: HotelDbContext

## Patrones y Estándares Implementados

### Arquitectura y Patrones
1. **Single-Entity Pattern** (Empresa): FirstOrDefaultAsync(), crear si no existe
2. **Fechas PostgreSQL**: Usar `DateTime.UtcNow`
3. **Redirección Post-Save**: Siempre a `ExactIndex`
4. **Validaciones Opcionales**: Remove ModelState si campo vacío

### UI/UX
5. **Mensajes**: TempData["SuccessMessage"] y TempData["ErrorMessage"]
6. **Breadcrumbs**: Home/[Módulo] - Home enlaza a ExactIndex
7. **Dark Mode**: Fondo #282A42, cards color original
8. **Botones**: Solo un set al final, Guardar usa var(--primary)
9. **Requeridos**: `<span class="required-asterisk">*</span>`
10. **Traducciones**: Agregar en _MaterializeExactLayout translations object

## Website Builder - Implementación Completa

### Arquitectura Base
- **Modelos EF Core**: 
  - `WebSite`: Configuración global (GlobalThemeSettingsJson en jsonb)
  - `WebPage`: Páginas con PageStructureJson (jsonb) que almacena array de bloques
- **API Controllers**:
  - `WebSitesController`: GET/PUT para sitio actual
  - `WebPagesController`: CRUD completo de páginas

### Interfaz Editor (3 paneles estilo Shopify)
1. **Panel Principal** (`.builder-sidebar-main`): Lista bloques, botones mover/eliminar
2. **Panel Settings** (`.builder-sidebar-settings`): Campos dinámicos según bloque
3. **Preview** (`#preview-content-placeholder`): Renderizado visual en tiempo real

### Estructura JavaScript
```javascript
editorState = {
    websiteId, currentPageId, currentPageBlocks: [], 
    hasUnsavedChanges, selectedBlockId
}
blockSettingsSchemas = { "Hero": [...campos], "Text": [...] }
blockRenderers = { "Hero": function(settings) => html }
```

### Funcionalidades
- **Bloques**: Añadir (modal), editar settings, reordenar (up/down), eliminar (confirmación)
- **Guardado**: PUT con PageStructureJson stringificado, indicador visual de cambios
- **Preview**: renderPreview() actualiza con cada cambio usando blockRenderers

### Flujo de Datos
1. Carga: GET site → pages → parse JSON → render
2. Edición: UI → actualizar array memoria → renderPreview()
3. Guardar: stringify → PUT API

### Archivos Clave
- `/Controllers/Api/Web*Controller.cs`
- `/Views/WebsiteBuilder/Index.cshtml`
- `/wwwroot/js/website-builder.js` (toda la lógica)
- `/wwwroot/css/website-builder.css` (editor)
- `/wwwroot/css/preview-blocks.css` (preview)

### Notas Importantes
- Bloques = {id, type, settings}
- No hay edición HTML directa, solo settings
- Estado en memoria hasta guardar
- CSS editor ≠ CSS sitio final