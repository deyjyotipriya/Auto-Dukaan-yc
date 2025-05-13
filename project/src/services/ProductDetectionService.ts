/**
 * ProductDetectionService
 * 
 * A sophisticated AI-powered product detection and recognition service
 * that analyzes video frames to identify products, extract attributes,
 * and prepare catalog entries.
 */

import { CapturedFrame } from './LivestreamRecordingService';

// Product detection result
export interface DetectedProduct {
  id: string;
  timestamp: Date;
  boundingBox: {
    x: number;  // Normalized coordinates (0-1)
    y: number;
    width: number;
    height: number;
  };
  confidence: number;         // Detection confidence (0-1)
  image: string;              // Cropped product image (data URL)
  originalFrameId: string;    // ID of the source frame
  attributes: {               // Detected attributes with confidence scores
    category?: {
      value: string;
      confidence: number;
    };
    color?: {
      value: string;
      confidence: number;
    };
    pattern?: {
      value: string;
      confidence: number;
    };
    type?: {
      value: string;
      confidence: number;
    };
    material?: {
      value: string;
      confidence: number;
    };
    [key: string]: {
      value: string;
      confidence: number;
    } | undefined;
  };
  priceDetection?: {          // Price detected in the frame
    value: number;
    currency: string;
    confidence: number;
    text: string;             // Raw text detected
    position: {               // Position in frame
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  textElements?: {            // Other text elements detected
    text: string;
    confidence: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    type?: 'title' | 'description' | 'price' | 'unknown';
  }[];
  groupId?: string;           // ID to group multiple detections of the same product
  isSimilarTo?: string[];     // IDs of similar product detections
  ocr?: {                     // OCR results for text in the product area
    raw: string;
    structured: {
      key: string;
      value: string;
      confidence: number;
    }[];
  };
}

// Product tracking information (for following products across frames)
interface TrackedProduct {
  id: string;
  detections: DetectedProduct[];
  lastSeen: Date;
  representative: DetectedProduct; // Best/clearest detection
  averageConfidence: number;
}

// Category and attribute collections
type CategoryDefinition = {
  name: string;
  attributes: string[];
  patterns?: string[];
  materials?: string[];
  keywords: string[];
};

// Model inference settings
export interface DetectionSettings {
  minConfidence: number;              // Minimum confidence for detection (0-1)
  maxProductsPerFrame: number;        // Maximum products to detect in a frame
  trackingThreshold: number;          // IoU threshold for product tracking
  similarityThreshold: number;        // Threshold for considering products similar
  frameSamplingRate: number;          // Process 1 in every N frames
  prioritizeCategories?: string[];    // Categories to prioritize in detection
  enableOCR: boolean;                 // Enable text detection
  includeFramesWithoutProducts: boolean; // Process frames without products
  enhanceImageQuality: boolean;       // Enhance image quality before detection
  detectGroupedProducts: boolean;     // Detect multiple products in a single area
  strictAttributeDetection: boolean;  // Strict matching for attributes
  enableFaceBlurring: boolean;        // Blur faces in detected images
}

// Processing statistics
export interface ProcessingStats {
  totalFrames: number;
  processedFrames: number;
  detectedProducts: number;
  uniqueProducts: number;
  totalProcessingTime: number;
  processingTimePerFrame: number;
  averageConfidence: number;
  frameProcessingRate: number; // Frames per second
  detectionRate: number;       // Products detected per frame
}

class ProductDetectionService {
  private defaultSettings: DetectionSettings = {
    minConfidence: 0.5,
    maxProductsPerFrame: 5,
    trackingThreshold: 0.5,
    similarityThreshold: 0.7,
    frameSamplingRate: 3,
    enableOCR: true,
    includeFramesWithoutProducts: false,
    enhanceImageQuality: true,
    detectGroupedProducts: true,
    strictAttributeDetection: false,
    enableFaceBlurring: true,
  };
  
  private categoryDefinitions: CategoryDefinition[] = [
    {
      name: 'Clothing',
      attributes: ['shirt', 'tshirt', 'kurta', 'pants', 'jeans', 'dress', 'saree', 'skirt', 'jacket', 'sweater', 'hoodie', 'blouse', 'suit'],
      patterns: ['solid', 'striped', 'checked', 'floral', 'printed', 'embroidered'],
      materials: ['cotton', 'silk', 'wool', 'linen', 'polyester', 'denim', 'leather', 'rayon'],
      keywords: ['sleeve', 'collar', 'button', 'zipper', 'pocket', 'neckline', 'hem', 'cuff', 'wear']
    },
    {
      name: 'Jewelry',
      attributes: ['necklace', 'earrings', 'bracelet', 'ring', 'pendant', 'anklet', 'bangle', 'chain'],
      materials: ['gold', 'silver', 'platinum', 'brass', 'copper', 'bronze', 'pearl', 'diamond', 'ruby', 'emerald', 'sapphire', 'crystal', 'bead'],
      keywords: ['gemstone', 'setting', 'clasp', 'stone', 'stud', 'hoop', 'carat', 'karat', 'jewel']
    },
    {
      name: 'Electronics',
      attributes: ['smartphone', 'laptop', 'tablet', 'headphones', 'earbuds', 'charger', 'speaker', 'smartwatch', 'camera', 'microphone'],
      keywords: ['wireless', 'battery', 'charging', 'device', 'technology', 'gadget', 'screen', 'power', 'storage', 'memory', 'processor']
    },
    {
      name: 'Home & Decor',
      attributes: ['pillow', 'cushion', 'bedsheet', 'curtain', 'vase', 'lamp', 'rug', 'carpet', 'blanket', 'frame', 'statue', 'mirror', 'clock'],
      materials: ['wood', 'glass', 'ceramic', 'fabric', 'plastic', 'metal', 'clay', 'bamboo', 'jute'],
      keywords: ['decoration', 'interior', 'furniture', 'living', 'bedroom', 'kitchen', 'bathroom', 'home', 'house', 'decor']
    },
    {
      name: 'Handicrafts',
      attributes: ['pottery', 'basket', 'sculpture', 'carving', 'painting', 'embroidery', 'weaving', 'tapestry', 'handmade', 'artisan'],
      materials: ['clay', 'wood', 'fabric', 'thread', 'bamboo', 'paper', 'wool', 'jute', 'metal', 'stone'],
      keywords: ['traditional', 'craft', 'handcrafted', 'artisanal', 'indigenous', 'folk', 'culture', 'heritage', 'authentic']
    },
    {
      name: 'Beauty',
      attributes: ['lipstick', 'nail polish', 'eyeshadow', 'mascara', 'foundation', 'powder', 'eyeliner', 'blush', 'moisturizer', 'serum', 'cream', 'lotion', 'shampoo'],
      keywords: ['makeup', 'cosmetic', 'skincare', 'haircare', 'beauty', 'fragrance', 'perfume', 'cologne', 'treatment', 'care']
    }
  ];
  
  private colorList: string[] = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
    'gray', 'beige', 'navy', 'teal', 'maroon', 'olive', 'mint', 'lavender', 'turquoise',
    'gold', 'silver', 'bronze', 'khaki', 'cream', 'ivory', 'tan', 'coral', 'indigo', 'violet'
  ];
  
  private patternList: string[] = [
    'solid', 'striped', 'checked', 'plaid', 'floral', 'printed', 'embroidered', 'polka dot',
    'geometric', 'abstract', 'paisley', 'animal print', 'chevron', 'tie-dye', 'camouflage',
    'tribal', 'tartan', 'herringbone', 'gingham', 'houndstooth', 'checkered', 'pinstripe'
  ];
  
  private materialList: string[] = [
    'cotton', 'silk', 'wool', 'linen', 'polyester', 'nylon', 'leather', 'suede', 'satin',
    'velvet', 'denim', 'chiffon', 'canvas', 'flannel', 'corduroy', 'tweed', 'jersey',
    'rayon', 'spandex', 'lycra', 'bamboo', 'microfiber', 'acrylic', 'cashmere', 'modal'
  ];
  
  private trackedProducts: Map<string, TrackedProduct> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  constructor() {
    // Initialize canvas for image processing
    this.initializeCanvas();
  }
  
  /**
   * Initialize canvas for image processing
   */
  private initializeCanvas() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }
  
  /**
   * Process a batch of frames to detect products
   */
  public async processFrames(
    frames: CapturedFrame[],
    settings?: Partial<DetectionSettings>,
    categories?: string[]
  ): Promise<{ 
    detectedProducts: DetectedProduct[],
    stats: ProcessingStats
  }> {
    const startTime = Date.now();
    
    // Combine settings with defaults
    const processingSettings: DetectionSettings = {
      ...this.defaultSettings,
      ...settings
    };
    
    // Filter priority categories if provided
    if (categories && categories.length > 0) {
      processingSettings.prioritizeCategories = categories;
    }
    
    // Apply frame sampling
    const framesToProcess = processingSettings.frameSamplingRate > 1
      ? frames.filter((_, i) => i % processingSettings.frameSamplingRate === 0)
      : frames;
    
    // Process each frame
    const allDetectedProducts: DetectedProduct[] = [];
    let processedFrameCount = 0;
    let totalProcessingTime = 0;
    
    for (const frame of framesToProcess) {
      const frameStartTime = Date.now();
      
      // Detect products in frame
      const productsInFrame = await this.detectProductsInFrame(frame, processingSettings);
      
      // Track products across frames
      if (productsInFrame.length > 0) {
        this.trackProducts(productsInFrame);
        allDetectedProducts.push(...productsInFrame);
      }
      
      // Calculate frame processing time
      const frameProcessingTime = Date.now() - frameStartTime;
      totalProcessingTime += frameProcessingTime;
      processedFrameCount++;
      
      // Dispatch progress event
      this.dispatchProgressEvent(processedFrameCount, framesToProcess.length);
    }
    
    // Post-process detections to group similar products
    const processedProducts = this.postProcessDetections(allDetectedProducts, processingSettings);
    
    // Calculate processing statistics
    const endTime = Date.now();
    const stats: ProcessingStats = {
      totalFrames: frames.length,
      processedFrames: processedFrameCount,
      detectedProducts: allDetectedProducts.length,
      uniqueProducts: processedProducts.length,
      totalProcessingTime: endTime - startTime,
      processingTimePerFrame: totalProcessingTime / processedFrameCount,
      averageConfidence: this.calculateAverageConfidence(processedProducts),
      frameProcessingRate: 1000 / (totalProcessingTime / processedFrameCount),
      detectionRate: allDetectedProducts.length / processedFrameCount
    };
    
    return {
      detectedProducts: processedProducts,
      stats
    };
  }
  
  /**
   * Dispatch progress event
   */
  private dispatchProgressEvent(current: number, total: number) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('productDetectionProgress', {
        detail: { current, total, percentage: Math.round((current / total) * 100) }
      });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Detect products in a single frame
   */
  private async detectProductsInFrame(
    frame: CapturedFrame,
    settings: DetectionSettings
  ): Promise<DetectedProduct[]> {
    // Create the image element from data URL
    const image = new Image();
    image.src = frame.dataUrl;
    
    // Wait for image to load
    await new Promise<void>(resolve => {
      image.onload = () => resolve();
    });
    
    // TODO: In a real implementation, this would call a computer vision API
    // For this demo, we'll simulate product detection with random values
    
    // Simulate finding 0-3 products
    const numProducts = Math.min(
      Math.floor(Math.random() * 4),
      settings.maxProductsPerFrame
    );
    
    const detectedProducts: DetectedProduct[] = [];
    
    // Only proceed if we "found" products or we're including frames without products
    if (numProducts === 0 && !settings.includeFramesWithoutProducts) {
      return detectedProducts;
    }
    
    // Create detections
    for (let i = 0; i < numProducts; i++) {
      // Generate random bounding box
      const x = 0.1 + Math.random() * 0.7; // 10-80% from left
      const y = 0.1 + Math.random() * 0.7; // 10-80% from top
      const width = 0.1 + Math.random() * 0.3; // 10-40% width
      const height = 0.1 + Math.random() * 0.3; // 10-40% height
      
      // Generate confidence score
      const confidence = Math.max(settings.minConfidence, 0.5 + Math.random() * 0.5);
      
      // Select a random category
      const categoryIndex = Math.floor(Math.random() * this.categoryDefinitions.length);
      const category = this.categoryDefinitions[categoryIndex];
      
      // Select a random attribute from the category
      const attributeIndex = Math.floor(Math.random() * category.attributes.length);
      const attributeValue = category.attributes[attributeIndex];
      
      // Select a random color
      const colorIndex = Math.floor(Math.random() * this.colorList.length);
      const colorValue = this.colorList[colorIndex];
      
      // Select a random pattern if applicable
      let patternValue = undefined;
      if (category.patterns && Math.random() > 0.5) {
        const patternIndex = Math.floor(Math.random() * category.patterns.length);
        patternValue = category.patterns[patternIndex];
      }
      
      // Select a random material if applicable
      let materialValue = undefined;
      if (category.materials && Math.random() > 0.5) {
        const materialIndex = Math.floor(Math.random() * category.materials.length);
        materialValue = category.materials[materialIndex];
      }
      
      // Crop the product image
      const croppedImage = this.cropProductImage(
        frame.dataUrl,
        { x, y, width, height },
        settings.enableFaceBlurring
      );
      
      // Generate a product detection
      const productDetection: DetectedProduct = {
        id: `product_${Date.now()}_${i}`,
        timestamp: new Date(frame.timestamp),
        boundingBox: { x, y, width, height },
        confidence,
        image: croppedImage,
        originalFrameId: frame.id,
        attributes: {
          category: {
            value: category.name,
            confidence: 0.7 + Math.random() * 0.3
          },
          type: {
            value: attributeValue,
            confidence: 0.6 + Math.random() * 0.4
          },
          color: {
            value: colorValue,
            confidence: 0.6 + Math.random() * 0.4
          }
        }
      };
      
      // Add pattern if selected
      if (patternValue) {
        productDetection.attributes.pattern = {
          value: patternValue,
          confidence: 0.5 + Math.random() * 0.5
        };
      }
      
      // Add material if selected
      if (materialValue) {
        productDetection.attributes.material = {
          value: materialValue,
          confidence: 0.5 + Math.random() * 0.5
        };
      }
      
      // Add price detection with 60% probability
      if (Math.random() > 0.4) {
        const price = Math.floor(Math.random() * 10000) + 100; // 100-10099
        productDetection.priceDetection = {
          value: price,
          currency: 'INR',
          confidence: 0.6 + Math.random() * 0.4,
          text: `₹${price}`,
          position: {
            x: x + width * 0.1,
            y: y + height * 0.8,
            width: width * 0.4,
            height: height * 0.15
          }
        };
      }
      
      // Add OCR results with 70% probability
      if (settings.enableOCR && Math.random() > 0.3) {
        // Generate some fake text that would make sense for the product
        const textParts = [];
        
        // Add type and color
        textParts.push(`${colorValue} ${attributeValue}`);
        
        // Maybe add pattern and material
        if (patternValue) textParts.push(patternValue);
        if (materialValue) textParts.push(materialValue);
        
        // Add some product-specific keywords
        for (let j = 0; j < 2; j++) {
          if (category.keywords.length > 0) {
            const keywordIndex = Math.floor(Math.random() * category.keywords.length);
            textParts.push(category.keywords[keywordIndex]);
          }
        }
        
        // Create OCR result
        productDetection.ocr = {
          raw: textParts.join(' '),
          structured: [
            {
              key: 'product_name',
              value: textParts.slice(0, 3).join(' '),
              confidence: 0.7 + Math.random() * 0.3
            },
            {
              key: 'description',
              value: textParts.join(' '),
              confidence: 0.6 + Math.random() * 0.4
            }
          ]
        };
        
        // Add price to OCR if detected
        if (productDetection.priceDetection) {
          productDetection.ocr.structured.push({
            key: 'price',
            value: productDetection.priceDetection.text,
            confidence: productDetection.priceDetection.confidence
          });
        }
      }
      
      detectedProducts.push(productDetection);
    }
    
    return detectedProducts;
  }
  
  /**
   * Track products across frames
   */
  private trackProducts(newDetections: DetectedProduct[]) {
    for (const detection of newDetections) {
      let matched = false;
      
      // Check if this product matches any tracked product
      for (const [id, tracked] of this.trackedProducts.entries()) {
        // Skip if tracked product hasn't been seen recently (10 frames gap)
        if (detection.timestamp.getTime() - tracked.lastSeen.getTime() > 10000) {
          continue;
        }
        
        // Check if the products are the same based on location and appearance
        if (this.isSameProduct(detection, tracked.representative)) {
          // Add to existing tracked product
          tracked.detections.push(detection);
          tracked.lastSeen = detection.timestamp;
          
          // Update average confidence
          tracked.averageConfidence = tracked.detections.reduce(
            (sum, det) => sum + det.confidence, 0
          ) / tracked.detections.length;
          
          // Check if this detection should become the new representative
          if (detection.confidence > tracked.representative.confidence) {
            tracked.representative = detection;
          }
          
          // Update detection with tracking info
          detection.groupId = id;
          
          matched = true;
          break;
        }
      }
      
      // If not matched, create a new tracked product
      if (!matched) {
        const trackId = `track_${Date.now()}_${detection.id}`;
        this.trackedProducts.set(trackId, {
          id: trackId,
          detections: [detection],
          lastSeen: detection.timestamp,
          representative: detection,
          averageConfidence: detection.confidence
        });
        
        // Update detection with tracking info
        detection.groupId = trackId;
      }
    }
  }
  
  /**
   * Check if two product detections are likely the same product
   */
  private isSameProduct(
    detection1: DetectedProduct,
    detection2: DetectedProduct
  ): boolean {
    // Check overlap using IoU (Intersection over Union)
    const iou = this.calculateIoU(detection1.boundingBox, detection2.boundingBox);
    
    // Check category and attributes match
    const categoryMatch = detection1.attributes.category?.value === 
                          detection2.attributes.category?.value;
    
    // Check color similarity (if both have color)
    const colorMatch = detection1.attributes.color?.value === 
                       detection2.attributes.color?.value;
    
    // Combined score
    const overlapScore = iou > 0.3 ? 0.6 : 0.2;
    const categoryScore = categoryMatch ? 0.3 : 0;
    const colorScore = colorMatch ? 0.1 : 0;
    
    const totalScore = overlapScore + categoryScore + colorScore;
    
    return totalScore > 0.5;
  }
  
  /**
   * Calculate IoU (Intersection over Union) for two bounding boxes
   */
  private calculateIoU(box1: any, box2: any): number {
    // Calculate coordinates
    const x1_1 = box1.x;
    const y1_1 = box1.y;
    const x2_1 = box1.x + box1.width;
    const y2_1 = box1.y + box1.height;
    
    const x1_2 = box2.x;
    const y1_2 = box2.y;
    const x2_2 = box2.x + box2.width;
    const y2_2 = box2.y + box2.height;
    
    // Calculate intersection area
    const x1_i = Math.max(x1_1, x1_2);
    const y1_i = Math.max(y1_1, y1_2);
    const x2_i = Math.min(x2_1, x2_2);
    const y2_i = Math.min(y2_1, y2_2);
    
    // Return 0 if there's no intersection
    if (x2_i < x1_i || y2_i < y1_i) {
      return 0;
    }
    
    const intersection = (x2_i - x1_i) * (y2_i - y1_i);
    
    // Calculate areas
    const area1 = (x2_1 - x1_1) * (y2_1 - y1_1);
    const area2 = (x2_2 - x1_2) * (y2_2 - y1_2);
    
    // Calculate IoU
    return intersection / (area1 + area2 - intersection);
  }
  
  /**
   * Post-process detections to group similar products and remove duplicates
   */
  private postProcessDetections(
    detections: DetectedProduct[],
    settings: DetectionSettings
  ): DetectedProduct[] {
    // Group by tracking ID
    const groupedById = new Map<string, DetectedProduct[]>();
    
    for (const detection of detections) {
      if (!detection.groupId) continue;
      
      if (!groupedById.has(detection.groupId)) {
        groupedById.set(detection.groupId, []);
      }
      
      groupedById.get(detection.groupId)?.push(detection);
    }
    
    // For each group, select the best representative
    const representatives: DetectedProduct[] = [];
    
    for (const group of groupedById.values()) {
      if (group.length === 0) continue;
      
      // Sort by confidence
      group.sort((a, b) => b.confidence - a.confidence);
      
      // Take the highest confidence detection as representative
      representatives.push(group[0]);
    }
    
    // Find similar products among representatives
    for (let i = 0; i < representatives.length; i++) {
      const product1 = representatives[i];
      product1.isSimilarTo = [];
      
      for (let j = 0; j < representatives.length; j++) {
        if (i === j) continue;
        
        const product2 = representatives[j];
        
        // Check if they're similar but not the same
        if (this.areSimilarProducts(product1, product2, settings.similarityThreshold)) {
          product1.isSimilarTo.push(product2.id);
        }
      }
    }
    
    return representatives;
  }
  
  /**
   * Check if two products are similar but not the same
   */
  private areSimilarProducts(
    product1: DetectedProduct,
    product2: DetectedProduct,
    threshold: number
  ): boolean {
    let similarityScore = 0;
    
    // Check category
    if (
      product1.attributes.category?.value === product2.attributes.category?.value
    ) {
      similarityScore += 0.3;
    }
    
    // Check type
    if (
      product1.attributes.type?.value === product2.attributes.type?.value
    ) {
      similarityScore += 0.2;
    }
    
    // Check color
    if (
      product1.attributes.color?.value === product2.attributes.color?.value
    ) {
      similarityScore += 0.2;
    }
    
    // Check pattern if both have it
    if (
      product1.attributes.pattern && 
      product2.attributes.pattern &&
      product1.attributes.pattern.value === product2.attributes.pattern.value
    ) {
      similarityScore += 0.15;
    }
    
    // Check material if both have it
    if (
      product1.attributes.material && 
      product2.attributes.material &&
      product1.attributes.material.value === product2.attributes.material.value
    ) {
      similarityScore += 0.15;
    }
    
    return similarityScore >= threshold;
  }
  
  /**
   * Crop a product image from a frame
   */
  private cropProductImage(
    imageDataUrl: string,
    boundingBox: { x: number; y: number; width: number; height: number },
    blurFaces: boolean = false
  ): string {
    if (!this.canvas || !this.ctx) {
      return imageDataUrl; // Return original if canvas not available
    }
    
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions
        this.canvas!.width = img.width * boundingBox.width;
        this.canvas!.height = img.height * boundingBox.height;
        
        // Draw the cropped portion
        this.ctx!.drawImage(
          img,
          img.width * boundingBox.x,
          img.height * boundingBox.y,
          img.width * boundingBox.width,
          img.height * boundingBox.height,
          0, 0,
          this.canvas!.width,
          this.canvas!.height
        );
        
        // TODO: If blurFaces is true, detect and blur faces in the image
        
        // Convert to data URL
        const croppedDataUrl = this.canvas!.toDataURL('image/jpeg', 0.9);
        resolve(croppedDataUrl);
      };
      img.src = imageDataUrl;
    });
  }
  
  /**
   * Calculate average confidence of all product detections
   */
  private calculateAverageConfidence(products: DetectedProduct[]): number {
    if (products.length === 0) return 0;
    
    const sum = products.reduce((acc, product) => acc + product.confidence, 0);
    return sum / products.length;
  }
  
  /**
   * Get detailed detection information for a specific product
   */
  public getProductDetails(productId: string, allProducts: DetectedProduct[]): {
    product: DetectedProduct | null;
    similarProducts: DetectedProduct[];
    allDetections: DetectedProduct[];
  } {
    // Find the main product
    const product = allProducts.find(p => p.id === productId) || null;
    
    if (!product) {
      return {
        product: null,
        similarProducts: [],
        allDetections: []
      };
    }
    
    // Find similar products
    const similarProducts = product.isSimilarTo
      ? allProducts.filter(p => product.isSimilarTo?.includes(p.id))
      : [];
    
    // Find all detections of this product
    const allDetections = allProducts.filter(p => p.groupId === product.groupId);
    
    return {
      product,
      similarProducts,
      allDetections
    };
  }
}

export default new ProductDetectionService();