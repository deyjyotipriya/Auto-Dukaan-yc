// ProductRecognitionService.ts
// This service simulates AI-based product recognition and classification

import { generateConfidenceScore } from '../utils/helpers';

// Product category attributes
export interface ProductAttribute {
  name: string;
  value: string;
  confidence: number; // 0-100
}

export interface RecognizedProduct {
  id: string;
  name: string;
  category: string;
  attributes: ProductAttribute[];
  suggestedPrice: number;
  confidence: number; // 0-100
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Simulates different product categories for demo
const CLOTHING_ATTRIBUTES = [
  { name: 'material', options: ['cotton', 'silk', 'wool', 'polyester', 'linen'] },
  { name: 'color', options: ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple'] },
  { name: 'size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
  { name: 'pattern', options: ['solid', 'striped', 'floral', 'checked', 'printed'] },
  { name: 'sleeve', options: ['full', 'half', 'sleeveless', '3/4th'] },
];

const JEWELRY_ATTRIBUTES = [
  { name: 'material', options: ['gold', 'silver', 'platinum', 'brass', 'copper'] },
  { name: 'gemstone', options: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'none'] },
  { name: 'style', options: ['traditional', 'modern', 'antique', 'fusion'] },
  { name: 'weight', options: ['light', 'medium', 'heavy'] },
];

const HANDICRAFT_ATTRIBUTES = [
  { name: 'material', options: ['wood', 'clay', 'fabric', 'metal', 'glass'] },
  { name: 'technique', options: ['handwoven', 'handpainted', 'embroidered', 'carved', 'molded'] },
  { name: 'origin', options: ['Rajasthan', 'Gujarat', 'Bengal', 'Kerala', 'Kashmir'] },
  { name: 'type', options: ['decorative', 'functional', 'wearable'] },
];

const ELECTRONICS_ATTRIBUTES = [
  { name: 'type', options: ['smartphone', 'laptop', 'tablet', 'headphones', 'speaker'] },
  { name: 'brand', options: ['Apple', 'Samsung', 'Mi', 'Sony', 'JBL'] },
  { name: 'color', options: ['black', 'white', 'silver', 'gold', 'blue'] },
  { name: 'condition', options: ['new', 'like new', 'good', 'fair'] },
];

// Sample product templates for different categories
const PRODUCT_TEMPLATES = {
  'Clothing & Accessories': [
    { name: 'Traditional Saree', priceRange: [1200, 5000] },
    { name: 'Cotton Kurta', priceRange: [600, 1800] },
    { name: 'Casual Shirt', priceRange: [500, 1500] },
    { name: 'Formal Pants', priceRange: [800, 2000] },
    { name: 'Designer Dupatta', priceRange: [400, 1200] },
  ],
  'Jewelry & Accessories': [
    { name: 'Handcrafted Earrings', priceRange: [500, 2500] },
    { name: 'Traditional Necklace', priceRange: [1500, 8000] },
    { name: 'Silver Anklet', priceRange: [800, 3000] },
    { name: 'Statement Ring', priceRange: [400, 1500] },
    { name: 'Wedding Jewelry Set', priceRange: [5000, 25000] },
  ],
  'Handicrafts': [
    { name: 'Handwoven Carpet', priceRange: [1500, 8000] },
    { name: 'Wooden Sculpture', priceRange: [700, 3000] },
    { name: 'Embroidered Wall Hanging', priceRange: [400, 2000] },
    { name: 'Ceramic Pottery', priceRange: [300, 1500] },
    { name: 'Brass Decor Item', priceRange: [600, 2500] },
  ],
  'Electronics': [
    { name: 'Smartphone', priceRange: [8000, 50000] },
    { name: 'Bluetooth Earbuds', priceRange: [1500, 8000] },
    { name: 'Portable Speaker', priceRange: [1000, 5000] },
    { name: 'Tablet', priceRange: [15000, 60000] },
    { name: 'Smart Watch', priceRange: [2000, 25000] },
  ],
};

// AI product recognition simulation
export class ProductRecognitionService {
  // Simulates analyzing an image to detect products
  static analyzeImage(imageUrl: string, count: number = 1): Promise<RecognizedProduct[]> {
    return new Promise(resolve => {
      // Simulate processing time
      setTimeout(() => {
        const products: RecognizedProduct[] = [];
        
        // Generate random products based on count
        for (let i = 0; i < count; i++) {
          products.push(this.generateRandomProduct(i, count));
        }
        
        resolve(products);
      }, 1500); // Simulate 1.5s processing time
    });
  }
  
  // Generates a random product with attributes for demo purposes
  private static generateRandomProduct(index: number, totalProducts: number): RecognizedProduct {
    // Select a random category
    const categories = Object.keys(PRODUCT_TEMPLATES);
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Select a random product template from the category
    const templates = PRODUCT_TEMPLATES[category as keyof typeof PRODUCT_TEMPLATES];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate a price within the range
    const price = Math.floor(
      Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]
    );
    
    // Generate random attributes based on category
    const attributes = this.generateAttributes(category);
    
    // Generate a bounding box if multiple products
    let boundingBox = undefined;
    if (totalProducts > 1) {
      // Create non-overlapping boxes
      const boxWidth = 0.8 / Math.ceil(Math.sqrt(totalProducts));
      const boxHeight = 0.8 / Math.ceil(Math.sqrt(totalProducts));
      const boxesPerRow = Math.ceil(Math.sqrt(totalProducts));
      
      const row = Math.floor(index / boxesPerRow);
      const col = index % boxesPerRow;
      
      boundingBox = {
        x: 0.1 + col * boxWidth,
        y: 0.1 + row * boxHeight,
        width: boxWidth,
        height: boxHeight
      };
    }
    
    return {
      id: `rec_${Date.now()}_${index}`,
      name: template.name,
      category,
      attributes,
      suggestedPrice: price,
      confidence: generateConfidenceScore(),
      boundingBox
    };
  }
  
  // Generate appropriate attributes based on category
  private static generateAttributes(category: string): ProductAttribute[] {
    let attributeSet;
    
    switch (category) {
      case 'Clothing & Accessories':
        attributeSet = CLOTHING_ATTRIBUTES;
        break;
      case 'Jewelry & Accessories':
        attributeSet = JEWELRY_ATTRIBUTES;
        break;
      case 'Handicrafts':
        attributeSet = HANDICRAFT_ATTRIBUTES;
        break;
      case 'Electronics':
        attributeSet = ELECTRONICS_ATTRIBUTES;
        break;
      default:
        attributeSet = CLOTHING_ATTRIBUTES;
    }
    
    // Generate 2-4 random attributes
    const attributes: ProductAttribute[] = [];
    const numAttributes = Math.floor(Math.random() * 3) + 2; // 2-4 attributes
    
    // Shuffle array to pick random attributes
    const shuffled = [...attributeSet].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numAttributes && i < shuffled.length; i++) {
      const attribute = shuffled[i];
      const value = attribute.options[Math.floor(Math.random() * attribute.options.length)];
      attributes.push({
        name: attribute.name,
        value,
        confidence: generateConfidenceScore()
      });
    }
    
    return attributes;
  }
  
  // Generates a product description based on recognized attributes
  static generateDescription(product: RecognizedProduct): string {
    // Get attribute values as an object for easier access
    const attrs: Record<string, string> = {};
    product.attributes.forEach(attr => {
      attrs[attr.name] = attr.value;
    });
    
    // Category-specific templates
    const templates: Record<string, string[]> = {
      'Clothing & Accessories': [
        `Beautiful ${attrs.color || ''} ${product.name} made from premium ${attrs.material || 'fabric'}. ${attrs.pattern ? `Features a stylish ${attrs.pattern} pattern.` : ''} ${attrs.sleeve ? `Has ${attrs.sleeve} sleeves.` : ''} Perfect for any occasion.`,
        `Elegant ${product.name} crafted with high-quality ${attrs.material || 'fabric'}. ${attrs.color ? `Available in ${attrs.color}.` : ''} ${attrs.pattern ? `Showcases a ${attrs.pattern} design.` : ''} Ideal for both casual and formal wear.`,
      ],
      'Jewelry & Accessories': [
        `Exquisite ${attrs.material || ''} ${product.name} ${attrs.gemstone && attrs.gemstone !== 'none' ? `adorned with ${attrs.gemstone}.` : ''} ${attrs.style ? `Features a ${attrs.style} design.` : ''} Perfect for adding elegance to any outfit.`,
        `Stunning ${product.name} made from premium ${attrs.material || 'metal'}. ${attrs.gemstone && attrs.gemstone !== 'none' ? `Set with beautiful ${attrs.gemstone}.` : ''} ${attrs.style ? `Crafted in ${attrs.style} style.` : ''} An ideal gift for someone special.`,
      ],
      'Handicrafts': [
        `Authentic ${attrs.material || ''} ${product.name} ${attrs.technique ? `that is ${attrs.technique} by skilled artisans.` : ''} ${attrs.origin ? `Originates from ${attrs.origin}.` : ''} A perfect addition to your home decor.`,
        `Traditional ${product.name} handcrafted from ${attrs.material || 'natural materials'}. ${attrs.technique ? `Features intricate ${attrs.technique} work.` : ''} ${attrs.origin ? `Sourced from the artistic traditions of ${attrs.origin}.` : ''} Brings cultural richness to any space.`,
      ],
      'Electronics': [
        `Premium ${attrs.brand || ''} ${product.name} in ${attrs.color || 'sleek design'}. ${attrs.condition ? `Product is in ${attrs.condition} condition.` : ''} Features the latest technology for an enhanced user experience.`,
        `High-quality ${product.name} from ${attrs.brand || 'a trusted brand'}. ${attrs.color ? `Available in ${attrs.color}.` : ''} ${attrs.condition ? `Offered in ${attrs.condition} condition.` : ''} Designed for optimal performance and reliability.`,
      ]
    };
    
    // Select templates for the category or use a default template
    const categoryTemplates = templates[product.category] || [
      `High-quality ${product.name} with excellent craftsmanship. Perfect for daily use.`,
      `Premium ${product.name} designed for durability and style. A must-have item.`
    ];
    
    // Select a random template from the category
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }
  
  // Generate search-friendly tags based on product data
  static generateTags(product: RecognizedProduct): string[] {
    const tags: string[] = [];
    
    // Add product name as tags (split by spaces)
    product.name.split(' ').forEach(word => {
      if (word.length > 2) tags.push(word.toLowerCase());
    });
    
    // Add category as tag
    tags.push(product.category.toLowerCase());
    
    // Add all attribute values as tags
    product.attributes.forEach(attr => {
      tags.push(attr.value.toLowerCase());
    });
    
    // Add more generalized tags based on category
    switch (product.category) {
      case 'Clothing & Accessories':
        tags.push('fashion', 'apparel', 'clothing', 'wear');
        break;
      case 'Jewelry & Accessories':
        tags.push('jewelry', 'accessories', 'ornament', 'adornment');
        break; 
      case 'Handicrafts':
        tags.push('handicraft', 'handmade', 'artisan', 'craft');
        break;
      case 'Electronics':
        tags.push('electronics', 'gadget', 'device', 'tech');
        break;
    }
    
    // Remove duplicates and return
    return [...new Set(tags)];
  }
}

export default ProductRecognitionService;