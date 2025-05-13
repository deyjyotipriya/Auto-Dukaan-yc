/**
 * ProductInformationService
 * 
 * Extracts and generates product information from detected products,
 * including titles, descriptions, pricing, variants, and more.
 */

import { DetectedProduct } from './ProductDetectionService';

// Supported languages
export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  BENGALI = 'bn',
  HINGLISH = 'hinglish',
  BANGLISH = 'banglish'
}

// Product information extracted from detected products
export interface ProductInformation {
  id: string;
  sourceProductId: string;
  name: {
    text: string;
    confidence: number;
    source: 'generated' | 'extracted' | 'manual';
  };
  description: {
    text: string;
    confidence: number;
    source: 'generated' | 'extracted' | 'manual';
  };
  price: {
    value: number;
    currency: string;
    confidence: number;
    source: 'extracted' | 'estimated' | 'manual';
  };
  category: {
    main: string;
    sub?: string;
    confidence: number;
  };
  attributes: {
    [key: string]: {
      value: string | string[];
      confidence: number;
    };
  };
  variants: {
    type: string;
    options: string[];
    default?: string;
  }[];
  images: {
    url: string;
    type: 'main' | 'variant' | 'detail';
    confidence: number;
  }[];
  tags: {
    text: string;
    confidence: number;
    source: 'generated' | 'extracted';
  }[];
  translations: {
    [key in Language]?: {
      name: string;
      description: string;
      confidence: number;
    };
  };
  specifications?: {
    [key: string]: string;
  };
  similarProducts: string[];
  estimatedInventory?: number;
  SKU?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  createdAt: Date;
  extractedFrom: {
    videoId?: string;
    frameIds: string[];
  };
}

// Product generation settings
export interface GenerationSettings {
  languages: Language[];
  nameMaxLength: number;
  descriptionMaxLength: number;
  generateVariants: boolean;
  includeBrandName: boolean;
  includeKeyFeatures: boolean;
  generateMultipleDescriptions: boolean;
  toneOfVoice: 'formal' | 'casual' | 'enthusiastic' | 'professional';
  priceSuggestionStrategy: 'market' | 'premium' | 'budget' | 'extracted';
  includeTags: boolean;
  tagsCount: number;
  includeSpecifications: boolean;
  generateSKU: boolean;
  inventoryEstimation: boolean;
  businessName?: string;
  businessType?: string;
  sellerLocation?: string;
}

// Product attribute templates for different categories
interface AttributeTemplate {
  name: string;
  variants: string[];
  descriptions: string[];
  specifications: string[];
  tags: string[];
  inventoryRange: [number, number];
  priceRange: [number, number];
}

class ProductInformationService {
  private defaultSettings: GenerationSettings = {
    languages: [Language.ENGLISH, Language.HINGLISH],
    nameMaxLength: 60,
    descriptionMaxLength: 500,
    generateVariants: true,
    includeBrandName: true,
    includeKeyFeatures: true,
    generateMultipleDescriptions: false,
    toneOfVoice: 'enthusiastic',
    priceSuggestionStrategy: 'extracted',
    includeTags: true,
    tagsCount: 5,
    includeSpecifications: true,
    generateSKU: true,
    inventoryEstimation: true,
    businessName: 'Our Shop',
  };
  
  // Category-specific templates
  private templates: Record<string, AttributeTemplate> = {
    'Clothing': {
      name: '{color} {material} {pattern} {type} for {demographic}',
      variants: ['Size', 'Color'],
      descriptions: [
        'Stylish {color} {type} made with premium {material}. Features {pattern} design perfect for {occasion}. {businessName} brings you the latest fashion trends at amazing prices.',
        'Elevate your wardrobe with this beautiful {color} {pattern} {type}. Made from high-quality {material} for comfort and durability. Ideal for {occasion} and daily wear.',
        'Premium quality {color} {type} with elegant {pattern} pattern. Crafted from soft and comfortable {material} fabric. Perfect for {occasion} or casual outings.'
      ],
      specifications: [
        'Material', 'Pattern', 'Sleeve Type', 'Neck Type', 'Occasion', 'Care Instructions', 'Fabric Type'
      ],
      tags: [
        'fashion', 'clothing', 'apparel', 'style', 'trendy', 'casual', 'formal', 'traditional', 'ethnic', 'modern'
      ],
      inventoryRange: [10, 50],
      priceRange: [499, 2999]
    },
    'Jewelry': {
      name: '{material} {type} with {feature} design',
      variants: ['Size', 'Metal Type'],
      descriptions: [
        'Exquisite {material} {type} featuring beautiful {feature} design. Handcrafted with attention to detail, this piece adds elegance to any outfit. Perfect for {occasion}.',
        'Stunning {material} {type} that showcases intricate {feature} patterns. Each piece is meticulously crafted to ensure quality and beauty. Make a statement with this gorgeous accessory.',
        'Add a touch of luxury with this {material} {type}. The beautiful {feature} design makes this piece stand out. Ideal for {occasion} or as a thoughtful gift.'
      ],
      specifications: [
        'Material', 'Metal Type', 'Stone Type', 'Weight', 'Occasion', 'Certification', 'Care Instructions'
      ],
      tags: [
        'jewelry', 'accessories', 'fashion', 'luxury', 'gift', 'traditional', 'handcrafted', 'elegant', 'wedding', 'festive'
      ],
      inventoryRange: [5, 30],
      priceRange: [999, 25000]
    },
    'Electronics': {
      name: '{brand} {type} with {feature} - {model}',
      variants: ['Color', 'Storage', 'RAM'],
      descriptions: [
        'Powerful {brand} {type} featuring {feature}. Experience superior performance with {specification}. Designed for tech enthusiasts who demand the best quality and reliability.',
        'Advanced {brand} {type} with cutting-edge {feature} technology. Enjoy {benefit} with {specification}. Perfect for work, entertainment, and everyday use.',
        'High-performance {brand} {type} with innovative {feature}. Offering exceptional {benefit} and reliability with {specification}. Stay ahead with the latest technology.'
      ],
      specifications: [
        'Brand', 'Model', 'Processor', 'Memory', 'Storage', 'Display', 'Battery Life', 'Warranty', 'Operating System'
      ],
      tags: [
        'electronics', 'gadget', 'technology', 'smart', 'digital', 'wireless', 'portable', 'innovation', 'performance', 'premium'
      ],
      inventoryRange: [3, 20],
      priceRange: [1999, 79999]
    },
    'Home & Decor': {
      name: '{material} {type} for {room} - {color} {pattern}',
      variants: ['Size', 'Color'],
      descriptions: [
        'Beautiful {color} {type} made from premium {material}. Add a touch of elegance to your {room} with this {feature} design. Perfect for modern and traditional homes alike.',
        'Enhance your {room} decor with this stylish {color} {type}. Crafted from high-quality {material} with {pattern} pattern. Brings warmth and character to any space.',
        'Transform your {room} with this exquisite {color} {type}. Made from durable {material} with {feature} that complements any interior style. Practical and decorative.'
      ],
      specifications: [
        'Material', 'Dimensions', 'Color', 'Pattern', 'Care Instructions', 'Weight', 'Room Type'
      ],
      tags: [
        'home decor', 'interior', 'decoration', 'living', 'furniture', 'accent', 'homeware', 'traditional', 'modern', 'handmade'
      ],
      inventoryRange: [8, 40],
      priceRange: [599, 5999]
    },
    'Handicrafts': {
      name: 'Handcrafted {material} {type} with {feature} - {origin} Art',
      variants: ['Size', 'Design'],
      descriptions: [
        'Authentic handcrafted {type} made by skilled artisans from {origin}. Each piece showcases traditional {technique} with {feature} detailing. A unique addition to your home or office.',
        'Exquisite {origin} {type} handmade with premium {material}. Features intricate {feature} design created using traditional {technique}. Own a piece of cultural heritage and support local artisans.',
        'Beautiful handcrafted {material} {type} from {origin}. This unique piece features detailed {feature} work made using age-old {technique}. Perfect as a gift or home decoration.'
      ],
      specifications: [
        'Material', 'Origin', 'Technique', 'Dimensions', 'Artisan', 'Care Instructions', 'Authenticity'
      ],
      tags: [
        'handicraft', 'handmade', 'artisan', 'traditional', 'cultural', 'heritage', 'indigenous', 'authentic', 'artistic', 'decorative'
      ],
      inventoryRange: [3, 25],
      priceRange: [799, 9999]
    },
    'Beauty': {
      name: '{brand} {type} for {benefit} - {variant}',
      variants: ['Shade', 'Size'],
      descriptions: [
        'Premium quality {type} formulated to provide {benefit}. Enriched with {ingredient} that helps {effect}. Perfect for all skin types and daily use. Experience the difference with {brand}.',
        'Achieve {benefit} with our {brand} {type}. Contains {ingredient} known for {effect}. Gentle yet effective formula suitable for regular application. Look your best every day.',
        'Advanced {type} specially designed for {benefit}. Infused with natural {ingredient} to {effect}. Dermatologically tested and free from harmful chemicals. Feel confident with {brand}.'
      ],
      specifications: [
        'Type', 'Skin Type', 'Ingredients', 'Benefits', 'Usage', 'Shelf Life', 'Volume/Weight'
      ],
      tags: [
        'beauty', 'skincare', 'cosmetics', 'natural', 'organic', 'vegan', 'dermatological', 'makeup', 'wellness', 'premium'
      ],
      inventoryRange: [15, 60],
      priceRange: [299, 1999]
    }
  };
  
  // Size variants by category
  private sizeVariants: Record<string, string[]> = {
    'Clothing': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Jewelry': ['Small', 'Medium', 'Large'],
    'Electronics': ['Standard'],
    'Home & Decor': ['Small', 'Medium', 'Large', 'Extra Large'],
    'Handicrafts': ['Small', 'Medium', 'Large'],
    'Beauty': ['30ml', '50ml', '100ml', '150ml']
  };
  
  // Color variants commonly used
  private colorVariants: string[] = [
    'Red', 'Blue', 'Green', 'Black', 'White', 'Navy', 'Grey', 'Beige',
    'Purple', 'Pink', 'Yellow', 'Orange', 'Brown', 'Gold', 'Silver', 'Multi'
  ];
  
  // Demographics for clothing
  private demographics: string[] = [
    'Men', 'Women', 'Children', 'Kids', 'Boys', 'Girls', 'Unisex'
  ];
  
  // Occasions
  private occasions: string[] = [
    'Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Office',
    'Daily Use', 'Special Occasion', 'Evening', 'Summer', 'Winter'
  ];
  
  // Room types
  private roomTypes: string[] = [
    'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room',
    'Office', 'Garden', 'Patio', 'Study Room', 'Kids Room'
  ];
  
  // Origin for handicrafts
  private origins: string[] = [
    'Rajasthan', 'Kashmir', 'Bengal', 'Kerala', 'Gujarat',
    'Madhya Pradesh', 'Tamil Nadu', 'Uttar Pradesh', 'Odisha', 'Assam'
  ];
  
  /**
   * Generate product information from a detected product
   */
  public async generateProductInformation(
    detectedProduct: DetectedProduct,
    settings?: Partial<GenerationSettings>
  ): Promise<ProductInformation> {
    // Combine settings with defaults
    const generationSettings: GenerationSettings = {
      ...this.defaultSettings,
      ...settings
    };
    
    // Get category from detected product
    const category = detectedProduct.attributes.category?.value || 'General';
    
    // Get template for this category
    const template = this.templates[category] || {
      name: '{type}',
      variants: ['Size'],
      descriptions: ['A quality {type} perfect for everyday use.'],
      specifications: ['Material', 'Dimensions', 'Weight'],
      tags: ['general', 'product', 'quality'],
      inventoryRange: [5, 30],
      priceRange: [499, 1999]
    };
    
    // Extract main attributes
    const color = detectedProduct.attributes.color?.value || '';
    const material = detectedProduct.attributes.material?.value || '';
    const pattern = detectedProduct.attributes.pattern?.value || '';
    const type = detectedProduct.attributes.type?.value || 'Product';
    
    // Generate name
    const name = this.generateProductName(
      template, 
      { color, material, pattern, type, category },
      generationSettings
    );
    
    // Generate description
    const description = this.generateProductDescription(
      template,
      { color, material, pattern, type, category },
      generationSettings
    );
    
    // Extract or estimate price
    const price = this.extractOrEstimatePrice(detectedProduct, template, generationSettings);
    
    // Generate variants
    const variants = generationSettings.generateVariants 
      ? this.generateVariants(category, { color }) 
      : [];
    
    // Generate tags
    const tags = generationSettings.includeTags
      ? this.generateTags(template, { color, material, pattern, type, category }, generationSettings.tagsCount)
      : [];
    
    // Generate translations if needed
    const translations = this.generateTranslations(
      { name, description },
      generationSettings.languages
    );
    
    // Generate specifications if needed
    const specifications = generationSettings.includeSpecifications
      ? this.generateSpecifications(template, { color, material, pattern, type })
      : undefined;
    
    // Estimate inventory if needed
    const estimatedInventory = generationSettings.inventoryEstimation
      ? this.estimateInventory(template)
      : undefined;
    
    // Generate SKU if needed
    const sku = generationSettings.generateSKU
      ? this.generateSKU(category, type, color)
      : undefined;
    
    // Create product information object
    const productInfo: ProductInformation = {
      id: `product_info_${Date.now()}`,
      sourceProductId: detectedProduct.id,
      name: {
        text: name,
        confidence: 0.85,
        source: 'generated'
      },
      description: {
        text: description,
        confidence: 0.8,
        source: 'generated'
      },
      price,
      category: {
        main: category,
        confidence: detectedProduct.attributes.category?.confidence || 0.7
      },
      attributes: {
        color: {
          value: color,
          confidence: detectedProduct.attributes.color?.confidence || 0.6
        },
        material: {
          value: material,
          confidence: detectedProduct.attributes.material?.confidence || 0.6
        },
        pattern: {
          value: pattern,
          confidence: detectedProduct.attributes.pattern?.confidence || 0.6
        },
        type: {
          value: type,
          confidence: detectedProduct.attributes.type?.confidence || 0.7
        }
      },
      variants,
      images: [{
        url: detectedProduct.image,
        type: 'main',
        confidence: 1.0
      }],
      tags,
      translations,
      specifications,
      similarProducts: detectedProduct.isSimilarTo || [],
      estimatedInventory,
      SKU: sku,
      createdAt: new Date(),
      extractedFrom: {
        frameIds: [detectedProduct.originalFrameId]
      }
    };
    
    return productInfo;
  }
  
  /**
   * Generate product name from template
   */
  private generateProductName(
    template: AttributeTemplate,
    attributes: { color: string; material: string; pattern: string; type: string; category: string },
    settings: GenerationSettings
  ): string {
    let name = template.name;
    
    // Replace template placeholders with actual values
    name = name.replace('{color}', attributes.color || '');
    name = name.replace('{material}', attributes.material || '');
    name = name.replace('{pattern}', attributes.pattern || '');
    name = name.replace('{type}', attributes.type || 'Product');
    
    // Replace category-specific placeholders
    if (attributes.category === 'Clothing') {
      const demographic = this.getRandomItem(this.demographics);
      name = name.replace('{demographic}', demographic);
    }
    
    if (attributes.category === 'Home & Decor') {
      const room = this.getRandomItem(this.roomTypes);
      name = name.replace('{room}', room);
    }
    
    if (attributes.category === 'Handicrafts') {
      const origin = this.getRandomItem(this.origins);
      name = name.replace('{origin}', origin);
    }
    
    // Add brand name if configured
    if (settings.includeBrandName && settings.businessName) {
      name = `${settings.businessName} ${name}`;
    }
    
    // Replace any unused placeholders
    name = name.replace(/{[^}]+}/g, '');
    
    // Remove extra spaces and trim
    name = name.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long
    if (settings.nameMaxLength > 0 && name.length > settings.nameMaxLength) {
      name = name.substring(0, settings.nameMaxLength - 3) + '...';
    }
    
    return name;
  }
  
  /**
   * Generate product description from template
   */
  private generateProductDescription(
    template: AttributeTemplate,
    attributes: { color: string; material: string; pattern: string; type: string; category: string },
    settings: GenerationSettings
  ): string {
    // Pick a random description template
    const descTemplate = this.getRandomItem(template.descriptions);
    
    let description = descTemplate;
    
    // Replace template placeholders with actual values
    description = description.replace(/{color}/g, attributes.color || 'premium');
    description = description.replace(/{material}/g, attributes.material || 'quality');
    description = description.replace(/{pattern}/g, attributes.pattern || 'stylish');
    description = description.replace(/{type}/g, attributes.type || 'product');
    
    // Replace business name
    description = description.replace(/{businessName}/g, settings.businessName || 'our store');
    
    // Replace category-specific placeholders
    if (attributes.category === 'Clothing' || attributes.category === 'Jewelry') {
      const occasion = this.getRandomItem(this.occasions);
      description = description.replace(/{occasion}/g, occasion);
    }
    
    if (attributes.category === 'Home & Decor') {
      const room = this.getRandomItem(this.roomTypes);
      description = description.replace(/{room}/g, room);
    }
    
    if (attributes.category === 'Electronics') {
      const feature = 'high-performance';
      const benefit = 'exceptional user experience';
      const specification = 'advanced technology';
      description = description.replace(/{feature}/g, feature);
      description = description.replace(/{benefit}/g, benefit);
      description = description.replace(/{specification}/g, specification);
    }
    
    if (attributes.category === 'Handicrafts') {
      const origin = this.getRandomItem(this.origins);
      const technique = 'traditional craftsmanship';
      const feature = 'intricate design';
      description = description.replace(/{origin}/g, origin);
      description = description.replace(/{technique}/g, technique);
      description = description.replace(/{feature}/g, feature);
    }
    
    if (attributes.category === 'Beauty') {
      const ingredient = 'natural extracts';
      const benefit = 'healthy skin';
      const effect = 'nourish and revitalize';
      description = description.replace(/{ingredient}/g, ingredient);
      description = description.replace(/{benefit}/g, benefit);
      description = description.replace(/{effect}/g, effect);
    }
    
    // Include key features if configured
    if (settings.includeKeyFeatures) {
      const features = this.generateKeyFeatures(attributes.category);
      description += `\n\nKey features:\n${features.join('\n')}`;
    }
    
    // Replace any unused placeholders
    description = description.replace(/{[^}]+}/g, '');
    
    // Remove extra spaces and trim
    description = description.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long
    if (settings.descriptionMaxLength > 0 && description.length > settings.descriptionMaxLength) {
      description = description.substring(0, settings.descriptionMaxLength - 3) + '...';
    }
    
    return description;
  }
  
  /**
   * Extract price from detected product or estimate based on category
   */
  private extractOrEstimatePrice(
    detectedProduct: DetectedProduct,
    template: AttributeTemplate,
    settings: GenerationSettings
  ): ProductInformation['price'] {
    // Check if product has price detection
    if (detectedProduct.priceDetection && settings.priceSuggestionStrategy === 'extracted') {
      return {
        value: detectedProduct.priceDetection.value,
        currency: detectedProduct.priceDetection.currency,
        confidence: detectedProduct.priceDetection.confidence,
        source: 'extracted'
      };
    }
    
    // Otherwise estimate based on category
    const [min, max] = template.priceRange;
    let multiplier = 1.0;
    
    // Adjust pricing based on strategy
    switch (settings.priceSuggestionStrategy) {
      case 'budget':
        multiplier = 0.8;
        break;
      case 'premium':
        multiplier = 1.2;
        break;
      case 'market':
      default:
        multiplier = 1.0;
        break;
    }
    
    // Generate a price in the defined range with some randomness
    const basePrice = Math.floor(min + Math.random() * (max - min));
    const adjustedPrice = Math.floor(basePrice * multiplier);
    
    // Round to nearest 9 for psychological pricing
    const roundedPrice = Math.floor(adjustedPrice / 10) * 10 + 9;
    
    return {
      value: roundedPrice,
      currency: 'INR',
      confidence: 0.7,
      source: 'estimated'
    };
  }
  
  /**
   * Generate variants based on category
   */
  private generateVariants(
    category: string,
    attributes: { color: string }
  ): ProductInformation['variants'] {
    const variants: ProductInformation['variants'] = [];
    
    // Add size variant if available for this category
    if (this.sizeVariants[category]) {
      variants.push({
        type: 'Size',
        options: this.sizeVariants[category]
      });
    }
    
    // Add color variant, including the detected color if available
    const colors = [...this.colorVariants];
    if (attributes.color && !colors.includes(attributes.color)) {
      colors.unshift(attributes.color);
    }
    
    variants.push({
      type: 'Color',
      options: colors.slice(0, 6), // Limit to 6 colors
      default: attributes.color || colors[0]
    });
    
    return variants;
  }
  
  /**
   * Generate tags for the product
   */
  private generateTags(
    template: AttributeTemplate,
    attributes: { color: string; material: string; pattern: string; type: string; category: string },
    count: number
  ): ProductInformation['tags'] {
    const possibleTags = [...template.tags];
    
    // Add attribute-based tags
    if (attributes.color) possibleTags.push(attributes.color.toLowerCase());
    if (attributes.material) possibleTags.push(attributes.material.toLowerCase());
    if (attributes.pattern) possibleTags.push(attributes.pattern.toLowerCase());
    if (attributes.type) possibleTags.push(attributes.type.toLowerCase());
    
    // Shuffle and select the requested number of tags
    const shuffled = possibleTags.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    return selected.map(tag => ({
      text: tag,
      confidence: 0.8,
      source: 'generated'
    }));
  }
  
  /**
   * Generate translations for name and description
   */
  private generateTranslations(
    content: { name: string; description: string },
    languages: Language[]
  ): ProductInformation['translations'] {
    const translations: ProductInformation['translations'] = {};
    
    // Skip English since it's the default
    const filteredLanguages = languages.filter(lang => lang !== Language.ENGLISH);
    
    // For each language, generate translations
    // In a real implementation, this would call a translation API
    filteredLanguages.forEach(language => {
      // For demonstration, we'll add a language prefix to show translation
      let namePrefix = '';
      let descPrefix = '';
      
      switch (language) {
        case Language.HINDI:
          namePrefix = 'हिंदी: ';
          descPrefix = 'हिंदी वर्णन: ';
          break;
        case Language.BENGALI:
          namePrefix = 'বাংলা: ';
          descPrefix = 'বাংলা বিবরণ: ';
          break;
        case Language.HINGLISH:
          namePrefix = 'Hinglish: ';
          descPrefix = 'Hinglish description: ';
          break;
        case Language.BANGLISH:
          namePrefix = 'Banglish: ';
          descPrefix = 'Banglish description: ';
          break;
      }
      
      translations[language] = {
        name: namePrefix + content.name,
        description: descPrefix + content.description,
        confidence: 0.7
      };
    });
    
    return translations;
  }
  
  /**
   * Generate specifications based on template and attributes
   */
  private generateSpecifications(
    template: AttributeTemplate,
    attributes: { color: string; material: string; pattern: string; type: string }
  ): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    
    // Add specifications from template with random values
    template.specifications.forEach(spec => {
      switch (spec) {
        case 'Material':
          specs[spec] = attributes.material || 'Premium quality';
          break;
        case 'Color':
          specs[spec] = attributes.color || 'Multi-color';
          break;
        case 'Pattern':
          specs[spec] = attributes.pattern || 'Solid';
          break;
        case 'Type':
          specs[spec] = attributes.type || 'Standard';
          break;
        case 'Dimensions':
          specs[spec] = `${Math.floor(Math.random() * 30) + 10}cm x ${Math.floor(Math.random() * 20) + 10}cm x ${Math.floor(Math.random() * 10) + 5}cm`;
          break;
        case 'Weight':
          specs[spec] = `${(Math.random() * 2 + 0.1).toFixed(2)} kg`;
          break;
        case 'Care Instructions':
          specs[spec] = 'Hand wash, do not bleach, do not tumble dry';
          break;
        default:
          specs[spec] = 'Standard';
      }
    });
    
    return specs;
  }
  
  /**
   * Generate key features for a product
   */
  private generateKeyFeatures(category: string): string[] {
    const features: string[] = [];
    
    // Generate 3-5 key features based on category
    switch (category) {
      case 'Clothing':
        features.push('Premium quality fabric for comfort and durability');
        features.push('Stylish design suitable for multiple occasions');
        features.push('Easy care - machine washable');
        if (Math.random() > 0.5) features.push('Available in multiple colors and sizes');
        if (Math.random() > 0.7) features.push('Sustainably sourced materials');
        break;
      
      case 'Jewelry':
        features.push('Handcrafted with attention to detail');
        features.push('Premium quality materials');
        features.push('Elegant design for all occasions');
        if (Math.random() > 0.5) features.push('Tarnish-resistant finish');
        if (Math.random() > 0.7) features.push('Comes in a gift box');
        break;
      
      case 'Electronics':
        features.push('High performance and reliability');
        features.push('Energy efficient design');
        features.push('User-friendly interface');
        if (Math.random() > 0.5) features.push('1 year warranty included');
        if (Math.random() > 0.7) features.push('Compact and portable');
        break;
      
      case 'Home & Decor':
        features.push('Enhances the aesthetics of your space');
        features.push('Durable construction for long-lasting use');
        features.push('Easy to clean and maintain');
        if (Math.random() > 0.5) features.push('Versatile - suitable for multiple rooms');
        if (Math.random() > 0.7) features.push('Eco-friendly materials');
        break;
      
      case 'Handicrafts':
        features.push('Handmade by skilled artisans');
        features.push('Unique piece with traditional craftsmanship');
        features.push('Supporting local artisans and cultural heritage');
        if (Math.random() > 0.5) features.push('Makes an excellent gift or home decor item');
        if (Math.random() > 0.7) features.push('Each piece is slightly unique due to handcrafting');
        break;
      
      case 'Beauty':
        features.push('Dermatologically tested');
        features.push('Free from harmful chemicals');
        features.push('Suitable for daily use');
        if (Math.random() > 0.5) features.push('Cruelty-free and not tested on animals');
        if (Math.random() > 0.7) features.push('Natural ingredients for gentle care');
        break;
      
      default:
        features.push('High quality product');
        features.push('Versatile and practical design');
        features.push('Great value for money');
        break;
    }
    
    return features;
  }
  
  /**
   * Estimate inventory based on category template
   */
  private estimateInventory(template: AttributeTemplate): number {
    const [min, max] = template.inventoryRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate SKU code
   */
  private generateSKU(category: string, type: string, color: string): string {
    // Category prefix (first 2 letters)
    const categoryPrefix = category.substring(0, 2).toUpperCase();
    
    // Type identifier (first 3 letters)
    const typeId = type.substring(0, 3).toUpperCase();
    
    // Color code (first letter)
    const colorCode = color ? color.substring(0, 1).toUpperCase() : 'X';
    
    // Random number
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${categoryPrefix}${typeId}${colorCode}${randomNum}`;
  }
  
  /**
   * Get a random item from an array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Generate a product information object by merging information from multiple detections
   */
  public async mergeProductInformation(
    productInfos: ProductInformation[],
    settings?: Partial<GenerationSettings>
  ): Promise<ProductInformation> {
    if (productInfos.length === 0) {
      throw new Error('No product information to merge');
    }
    
    if (productInfos.length === 1) {
      return productInfos[0];
    }
    
    // Sort by confidence descending
    const sorted = [...productInfos].sort((a, b) => {
      return (b.name.confidence + b.description.confidence) - 
             (a.name.confidence + a.description.confidence);
    });
    
    // Use the highest confidence product as the base
    const base = sorted[0];
    
    // Collect all frame IDs from all products
    const frameIds = new Set<string>();
    productInfos.forEach(info => {
      info.extractedFrom.frameIds.forEach(id => frameIds.add(id));
    });
    
    // Merge information
    const merged: ProductInformation = {
      ...base,
      id: `merged_${Date.now()}`,
      extractedFrom: {
        ...base.extractedFrom,
        frameIds: Array.from(frameIds)
      },
      createdAt: new Date()
    };
    
    // Combine all images from all products
    const allImages = productInfos.flatMap(info => info.images);
    // Remove duplicates by URL
    const uniqueImages = allImages.filter((img, index, self) => 
      index === self.findIndex(i => i.url === img.url)
    );
    merged.images = uniqueImages;
    
    // Combine all similar products
    const allSimilarProducts = new Set<string>();
    productInfos.forEach(info => {
      info.similarProducts.forEach(id => allSimilarProducts.add(id));
    });
    merged.similarProducts = Array.from(allSimilarProducts);
    
    return merged;
  }
}

export default new ProductInformationService();