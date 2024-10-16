export interface CreateWordPressDto {
    siteName: string;      // The name of the WordPress site
    adminUser: string;     // The admin username for WordPress
    adminPassword: string; // The admin password for WordPress
    adminEmail: string;    // The admin email for WordPress
    language: string;      // The language code for WordPress (e.g., 'en_US', 'fr_FR')
  }
  