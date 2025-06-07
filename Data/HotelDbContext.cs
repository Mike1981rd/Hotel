using Microsoft.EntityFrameworkCore;
using Hotel.Models;

namespace Hotel.Data
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options)
            : base(options)
        {
        }

        // DbSets para las tablas
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<WebSite> WebSites { get; set; }
        public DbSet<WebPage> WebPages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Room
            modelBuilder.Entity<Room>()
                .HasIndex(r => r.RoomNumber)
                .IsUnique();

            // Configuración de Guest
            modelBuilder.Entity<Guest>()
                .HasIndex(g => g.Email)
                .IsUnique();

            // Configuración de Reservation
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Room)
                .WithMany(room => room.Reservations)
                .HasForeignKey(r => r.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Guest)
                .WithMany(g => g.Reservations)
                .HasForeignKey(r => r.GuestId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.TotalAmount)
                .HasPrecision(18, 2);

            // Configuración de Payment
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            // Configuración de RoomType
            modelBuilder.Entity<RoomType>()
                .Property(rt => rt.BasePrice)
                .HasPrecision(18, 2);

            // Configuración de Role y Permission (many-to-many)
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            // Configuración de User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuración de WebSite
            modelBuilder.Entity<WebSite>()
                .Property(w => w.GlobalThemeSettingsJson)
                .HasColumnType("jsonb");

            // Configuración de WebPage
            modelBuilder.Entity<WebPage>()
                .Property(p => p.PageStructureJson)
                .HasColumnType("jsonb");

            modelBuilder.Entity<WebPage>()
                .HasIndex(p => new { p.WebSiteId, p.Slug })
                .IsUnique();

            modelBuilder.Entity<WebPage>()
                .HasOne(p => p.WebSite)
                .WithMany(w => w.WebPages)
                .HasForeignKey(p => p.WebSiteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Datos semilla para RoomTypes
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType { Id = 1, Name = "Individual", Description = "Habitación individual estándar", BasePrice = 50.00m, MaxOccupancy = 1 },
                new RoomType { Id = 2, Name = "Doble", Description = "Habitación doble estándar", BasePrice = 80.00m, MaxOccupancy = 2 },
                new RoomType { Id = 3, Name = "Suite", Description = "Suite de lujo", BasePrice = 150.00m, MaxOccupancy = 4 },
                new RoomType { Id = 4, Name = "Suite Presidencial", Description = "Suite presidencial de lujo", BasePrice = 300.00m, MaxOccupancy = 6 }
            );

            // Datos semilla para Permissions basados en el menú lateral
            var permissions = new List<Permission>();
            int permissionId = 1;
            
            // Empresa
            permissions.Add(new Permission { Id = permissionId++, Module = "Empresa", Action = "Read", Description = "Ver información de empresa", DisplayOrder = 1 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Empresa", Action = "Write", Description = "Editar información de empresa", DisplayOrder = 1 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Empresa", Action = "Create", Description = "Crear información de empresa", DisplayOrder = 1 });
            
            // Roles
            permissions.Add(new Permission { Id = permissionId++, Module = "Roles", Action = "Read", Description = "Ver roles", DisplayOrder = 2 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Roles", Action = "Write", Description = "Editar roles", DisplayOrder = 2 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Roles", Action = "Create", Description = "Crear roles", DisplayOrder = 2 });
            
            // Usuarios
            permissions.Add(new Permission { Id = permissionId++, Module = "Usuarios", Action = "Read", Description = "Ver usuarios", DisplayOrder = 3 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Usuarios", Action = "Write", Description = "Editar usuarios", DisplayOrder = 3 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Usuarios", Action = "Create", Description = "Crear usuarios", DisplayOrder = 3 });
            
            // Clientes
            permissions.Add(new Permission { Id = permissionId++, Module = "Clientes", Action = "Read", Description = "Ver clientes", DisplayOrder = 4 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Clientes", Action = "Write", Description = "Editar clientes", DisplayOrder = 4 });
            permissions.Add(new Permission { Id = permissionId++, Module = "Clientes", Action = "Create", Description = "Crear clientes", DisplayOrder = 4 });
            
            // Sitio Web
            permissions.Add(new Permission { Id = permissionId++, Module = "SitioWeb", Action = "Read", Description = "Ver configuración del sitio web", DisplayOrder = 5 });
            permissions.Add(new Permission { Id = permissionId++, Module = "SitioWeb", Action = "Write", Description = "Editar configuración del sitio web", DisplayOrder = 5 });
            permissions.Add(new Permission { Id = permissionId++, Module = "SitioWeb", Action = "Create", Description = "Crear contenido del sitio web", DisplayOrder = 5 });

            modelBuilder.Entity<Permission>().HasData(permissions);

            // Datos semilla para Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Administrator", Description = "Acceso completo al sistema", IsActive = true },
                new Role { Id = 2, Name = "Manager", Description = "Acceso de gestión", IsActive = true },
                new Role { Id = 3, Name = "Support", Description = "Acceso de soporte", IsActive = true },
                new Role { Id = 4, Name = "Users", Description = "Acceso básico de usuario", IsActive = true }
            );
        }
    }
}