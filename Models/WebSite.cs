using System;
using System.Collections.Generic;

namespace Hotel.Models
{
    public class WebSite
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string SelectedThemeOrTemplateId { get; set; }
        public string GlobalThemeSettingsJson { get; set; }
        public string PrimaryDomain { get; set; }
        public string Subdomain { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<WebPage> WebPages { get; set; }
    }
}