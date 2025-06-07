using System;

namespace Hotel.Models
{
    public class WebPage
    {
        public int Id { get; set; }
        public int WebSiteId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsSystemPage { get; set; } = false;
        public string PageType { get; set; }
        public string PageStructureJson { get; set; } = "[]";
        public string SeoTitle { get; set; }
        public string SeoDescription { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public WebSite WebSite { get; set; }
    }
}