import { Product } from '../store/slices/productsSlice';

// Template themes available for storefronts
export enum StorefrontTheme {
  MINIMAL = 'minimal',
  MODERN = 'modern',
  VINTAGE = 'vintage',
  BOLD = 'bold',
  ELEGANT = 'elegant',
}

// Color schemes available for themes
export enum ColorScheme {
  LIGHT = 'light',
  DARK = 'dark',
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  ORANGE = 'orange',
  CUSTOM = 'custom',
}

// Font options for storefronts
export enum FontFamily {
  SANS = 'sans',
  SERIF = 'serif',
  MONO = 'mono',
  DISPLAY = 'display',
  HANDWRITTEN = 'handwritten',
}

// Layout types for product display
export enum LayoutType {
  GRID = 'grid',
  LIST = 'list',
  MASONRY = 'masonry',
  CAROUSEL = 'carousel',
  FEATURED = 'featured',
}

// Page types available in a storefront
export enum PageType {
  HOME = 'home',
  CATALOG = 'catalog',
  PRODUCT = 'product',
  ABOUT = 'about',
  CONTACT = 'contact',
  CART = 'cart',
  CHECKOUT = 'checkout',
  POLICY = 'policy',
}

// Social media platforms that can be linked
export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest',
  WHATSAPP = 'whatsapp',
}

// Website custom section types
export enum SectionType {
  HERO = 'hero',
  FEATURED_PRODUCTS = 'featuredProducts',
  CATEGORIES = 'categories',
  TESTIMONIALS = 'testimonials',
  ABOUT = 'about',
  CONTACT_FORM = 'contactForm',
  IMAGE_GALLERY = 'imageGallery',
  VIDEO = 'video',
  FAQ = 'faq',
  NEWSLETTER = 'newsletter',
}

// Represents a custom color scheme
export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// SEO settings for the storefront
export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  structuredData?: Record<string, any>;
  sitemapEnabled: boolean;
  robotsTxt?: string;
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

// Social media links configuration
export interface SocialMediaLinks {
  platform: SocialPlatform;
  url: string;
  displayOnHeader: boolean;
  displayOnFooter: boolean;
}

// Configuration for a section on the storefront
export interface SectionConfig {
  type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>; // Type-specific settings
}

// Configuration for a page on the storefront
export interface PageConfig {
  type: PageType;
  title: string;
  slug: string;
  sections: SectionConfig[];
  metaTitle?: string; 
  metaDescription?: string;
}

// Category configuration for storefront
export interface CategoryConfig {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  featured: boolean;
  order: number;
}

// Main storefront configuration
export interface StorefrontConfig {
  id: string;
  businessName: string;
  domain: string; // e.g., mybusiness.autodukaan.com
  logo?: string;
  favicon?: string;
  theme: StorefrontTheme;
  colorScheme: ColorScheme;
  customColors?: CustomColors;
  fontFamily: FontFamily;
  defaultLayout: LayoutType;
  pages: PageConfig[];
  navigation: {
    mainItems: { label: string; link: string; order: number }[];
    footerCategories: { title: string; links: { label: string; link: string }[] }[];
  };
  categories: CategoryConfig[];
  seo: SEOSettings;
  socialMedia: SocialMediaLinks[];
  paymentMethods: string[];
  shippingOptions: string[];
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
  };
  legalPages: {
    privacyPolicy?: string;
    termsConditions?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
  };
  customCSS?: string;
  customJS?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Product display preferences for the storefront
export interface ProductDisplayConfig {
  showPrices: boolean;
  showStock: boolean;
  showRatings: boolean;
  enableQuickView: boolean;
  enableWishlist: boolean;
  productsPerPage: number;
  sortOptions: string[];
  filterOptions: string[];
}

// Default storefront configuration
export const defaultStorefrontConfig: StorefrontConfig = {
  id: '', // Will be set when created
  businessName: '',
  domain: '',
  theme: StorefrontTheme.MODERN,
  colorScheme: ColorScheme.LIGHT,
  fontFamily: FontFamily.SANS,
  defaultLayout: LayoutType.GRID,
  pages: [
    {
      type: PageType.HOME,
      title: 'Home',
      slug: '',
      sections: [
        {
          type: SectionType.HERO,
          enabled: true,
          order: 0,
          settings: {
            heading: 'Welcome to our store',
            subheading: 'Find the best products at great prices',
            buttonText: 'Shop Now',
            buttonLink: '/catalog',
            backgroundImage: '',
          },
        },
        {
          type: SectionType.FEATURED_PRODUCTS,
          enabled: true,
          order: 1,
          title: 'Featured Products',
          settings: {
            productIds: [],
            maxProducts: 4,
          },
        },
        {
          type: SectionType.CATEGORIES,
          enabled: true,
          order: 2,
          title: 'Shop by Category',
          settings: {
            displayStyle: 'grid',
            maxCategories: 4,
          },
        },
      ],
    },
    {
      type: PageType.CATALOG,
      title: 'All Products',
      slug: 'catalog',
      sections: [],
    },
    {
      type: PageType.ABOUT,
      title: 'About Us',
      slug: 'about',
      sections: [
        {
          type: SectionType.ABOUT,
          enabled: true,
          order: 0,
          settings: {
            content: 'Tell your customers about your business...',
            showImage: true,
            image: '',
          },
        },
      ],
    },
    {
      type: PageType.CONTACT,
      title: 'Contact Us',
      slug: 'contact',
      sections: [
        {
          type: SectionType.CONTACT_FORM,
          enabled: true,
          order: 0,
          settings: {
            showMap: true,
            formFields: ['name', 'email', 'message'],
          },
        },
      ],
    },
  ],
  navigation: {
    mainItems: [
      { label: 'Home', link: '/', order: 0 },
      { label: 'Products', link: '/catalog', order: 1 },
      { label: 'About', link: '/about', order: 2 },
      { label: 'Contact', link: '/contact', order: 3 },
    ],
    footerCategories: [
      {
        title: 'Shop',
        links: [
          { label: 'All Products', link: '/catalog' },
          { label: 'New Arrivals', link: '/catalog?sort=newest' },
        ],
      },
      {
        title: 'Information',
        links: [
          { label: 'About Us', link: '/about' },
          { label: 'Contact Us', link: '/contact' },
        ],
      },
    ],
  },
  categories: [],
  seo: {
    title: '',
    description: '',
    keywords: [],
    sitemapEnabled: true,
  },
  socialMedia: [],
  paymentMethods: ['Cash on Delivery', 'UPI'],
  shippingOptions: ['Standard Delivery'],
  contactInfo: {},
  legalPages: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: false,
};

/**
 * Service for managing storefront generation and customization
 */
class StorefrontService {
  /**
   * Generate a new default storefront configuration for a business
   */
  generateDefaultStorefront(businessName: string, businessId: string): StorefrontConfig {
    const domain = this.generateDomain(businessName);
    
    return {
      ...defaultStorefrontConfig,
      id: businessId,
      businessName,
      domain,
      seo: {
        ...defaultStorefrontConfig.seo,
        title: businessName,
        description: `Welcome to ${businessName}. Shop our products online.`,
        keywords: [businessName.toLowerCase(), 'shop', 'online store'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate a domain name based on business name
   */
  generateDomain(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + '.autodukaan.com';
  }

  /**
   * Update an existing storefront configuration
   */
  updateStorefront(config: StorefrontConfig, updates: Partial<StorefrontConfig>): StorefrontConfig {
    return {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };
  }

  /**
   * Get a preview URL for the storefront
   */
  getPreviewUrl(config: StorefrontConfig): string {
    return `https://preview.autodukaan.com/${config.id}`;
  }

  /**
   * Get a live URL for the published storefront
   */
  getLiveUrl(config: StorefrontConfig): string {
    return `https://${config.domain}`;
  }

  /**
   * Add a product category to the storefront
   */
  addCategory(config: StorefrontConfig, category: Omit<CategoryConfig, 'id' | 'order'>): StorefrontConfig {
    const newCategory: CategoryConfig = {
      ...category,
      id: Date.now().toString(),
      order: config.categories.length,
    };

    return {
      ...config,
      categories: [...config.categories, newCategory],
      updatedAt: new Date(),
    };
  }

  /**
   * Add a section to a specific page
   */
  addSection(config: StorefrontConfig, pageType: PageType, section: Omit<SectionConfig, 'order'>): StorefrontConfig {
    const updatedPages = config.pages.map((page) => {
      if (page.type === pageType) {
        return {
          ...page,
          sections: [
            ...page.sections,
            {
              ...section,
              order: page.sections.length,
            },
          ],
        };
      }
      return page;
    });

    return {
      ...config,
      pages: updatedPages,
      updatedAt: new Date(),
    };
  }

  /**
   * Generate SEO-friendly content for the storefront
   */
  generateSEO(config: StorefrontConfig, products: Product[]): SEOSettings {
    const categories = config.categories.map((c) => c.name).join(', ');
    const productTypes = [...new Set(products.map((p) => p.category))].join(', ');
    
    return {
      title: `${config.businessName} - Shop Online`,
      description: `Shop online at ${config.businessName}. We offer ${productTypes}. Fast delivery and easy returns.`,
      keywords: [
        config.businessName.toLowerCase(),
        'online shop',
        'ecommerce',
        ...config.categories.map(c => c.name.toLowerCase()),
        ...products.slice(0, 5).map(p => p.name.toLowerCase())
      ],
      ogImage: config.logo,
      sitemapEnabled: true,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        'name': config.businessName,
        'description': `Shop online at ${config.businessName}`,
        'url': this.getLiveUrl(config),
        'telephone': config.contactInfo.phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': config.contactInfo.address
        },
        'priceRange': '₹₹'
      }
    };
  }

  /**
   * Generate CSS based on the selected theme and colors
   */
  generateThemeCSS(config: StorefrontConfig): string {
    let css = '';
    
    // Base styles based on theme
    switch (config.theme) {
      case StorefrontTheme.MINIMAL:
        css += `
          /* Minimal theme styles */
          body {
            font-family: ${this.getFontFamily(config.fontFamily)};
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          /* ... more minimal theme styles ... */
        `;
        break;
      case StorefrontTheme.MODERN:
        css += `
          /* Modern theme styles */
          body {
            font-family: ${this.getFontFamily(config.fontFamily)};
            line-height: 1.5;
          }
          .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }
          /* ... more modern theme styles ... */
        `;
        break;
      // Add other theme styles here
      default:
        break;
    }
    
    // Color scheme styles
    if (config.colorScheme === ColorScheme.CUSTOM && config.customColors) {
      css += `
        :root {
          --primary-color: ${config.customColors.primary};
          --secondary-color: ${config.customColors.secondary};
          --accent-color: ${config.customColors.accent};
          --background-color: ${config.customColors.background};
          --text-color: ${config.customColors.text};
        }
      `;
    } else {
      // Predefined color schemes
      const colors = this.getColorScheme(config.colorScheme);
      css += `
        :root {
          --primary-color: ${colors.primary};
          --secondary-color: ${colors.secondary};
          --accent-color: ${colors.accent};
          --background-color: ${colors.background};
          --text-color: ${colors.text};
        }
      `;
    }
    
    // Add custom CSS if provided
    if (config.customCSS) {
      css += config.customCSS;
    }
    
    return css;
  }

  /**
   * Get font family CSS value
   */
  private getFontFamily(fontFamily: FontFamily): string {
    switch (fontFamily) {
      case FontFamily.SANS:
        return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      case FontFamily.SERIF:
        return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
      case FontFamily.MONO:
        return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case FontFamily.DISPLAY:
        return '"Playfair Display", Georgia, serif';
      case FontFamily.HANDWRITTEN:
        return '"Caveat", "Brush Script MT", cursive';
      default:
        return 'system-ui, sans-serif';
    }
  }

  /**
   * Get color scheme values
   */
  private getColorScheme(scheme: ColorScheme): CustomColors {
    switch (scheme) {
      case ColorScheme.LIGHT:
        return {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#ef4444',
          background: '#ffffff',
          text: '#333333',
        };
      case ColorScheme.DARK:
        return {
          primary: '#60a5fa',
          secondary: '#9ca3af',
          accent: '#f87171',
          background: '#1f2937',
          text: '#f3f4f6',
        };
      case ColorScheme.BLUE:
        return {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#3b82f6',
          background: '#ffffff',
          text: '#1e293b',
        };
      case ColorScheme.GREEN:
        return {
          primary: '#10b981',
          secondary: '#047857',
          accent: '#34d399',
          background: '#f8fafc',
          text: '#1e293b',
        };
      case ColorScheme.PURPLE:
        return {
          primary: '#8b5cf6',
          secondary: '#6d28d9',
          accent: '#a78bfa',
          background: '#ffffff',
          text: '#1e293b',
        };
      case ColorScheme.ORANGE:
        return {
          primary: '#f97316',
          secondary: '#ea580c',
          accent: '#fb923c',
          background: '#ffffff',
          text: '#1e293b',
        };
      default:
        return {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#ef4444',
          background: '#ffffff',
          text: '#333333',
        };
    }
  }

  /**
   * Generate a sitemap for the storefront
   */
  generateSitemap(config: StorefrontConfig, products: Product[]): string {
    const baseUrl = this.getLiveUrl(config);
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add pages
    config.pages.forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/${page.slug}</loc>\n`;
      sitemap += `    <lastmod>${config.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>${page.type === PageType.HOME ? '1.0' : '0.8'}</priority>\n`;
      sitemap += `  </url>\n`;
    });
    
    // Add categories
    config.categories.forEach(category => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/catalog/category/${category.id}</loc>\n`;
      sitemap += `    <lastmod>${config.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });
    
    // Add products
    products.forEach(product => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/product/${product.id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(product.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    });
    
    sitemap += '</urlset>';
    return sitemap;
  }
}

export default new StorefrontService();