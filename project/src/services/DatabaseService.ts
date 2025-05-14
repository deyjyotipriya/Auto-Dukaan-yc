/**
 * DatabaseService
 * 
 * A service for storing and retrieving application data using IndexedDB
 */

// Database schema
export interface DBSchema {
  products: ProductRecord[];
  capturedFrames: CapturedFrameRecord[];
  catalogs: CatalogRecord[];
  users: UserRecord[];
  orders: OrderRecord[];
  sessions: SessionRecord[];
  settings: SettingsRecord[];
}

// Product record
export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];  // URLs to product images
  category: string;
  subcategory?: string;
  tags: string[];
  attributes: { [key: string]: any };
  variants: ProductVariant[];
  inventory: number;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  isDeleted: boolean;
  catalogId?: string;  // Reference to catalog
  vendorId: string;    // Reference to user (vendor)
}

// Product variant (like different sizes, colors)
export interface ProductVariant {
  id: string;
  name: string;
  attributes: { [key: string]: any };
  price?: number;  // Override base price if specified
  inventory: number;
  images?: string[];
}

// Captured frame from livestream/recording
export interface CapturedFrameRecord {
  id: string;
  sessionId: string;  // Reference to the session
  timestamp: Date;
  imageUrl: string;   // URL to the captured image
  thumbnailUrl?: string;  // URL to thumbnail for faster loading
  isProcessed: boolean;
  isEdited: boolean;
  editedImageUrl?: string;  // URL to edited version
  cropInfo?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  productDetected?: string;  // Product ID if linked to a product
  metadata: { [key: string]: any };
}

// Catalog (collection of products)
export interface CatalogRecord {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  products: string[];  // Array of product IDs
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  vendorId: string;    // Reference to user (vendor)
  sessionIds: string[];  // Sessions used to create this catalog
}

// User record
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'seller' | 'buyer';
  businessName?: string;
  businessAddress?: string;
  profileImage?: string;
  settings: { [key: string]: any };
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Order record
export interface OrderRecord {
  id: string;
  customerId: string;  // Reference to user (buyer)
  vendorId: string;    // Reference to user (seller)
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Order item
export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Address
export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Recording/livestream session
export interface SessionRecord {
  id: string;
  type: 'livestream' | 'recording' | 'upload';
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;  // In seconds
  status: 'pending' | 'active' | 'completed' | 'failed';
  visibility: 'public' | 'private' | 'unlisted';
  vendorId: string;  // Reference to user (vendor)
  frameCount: number;
  settings: { [key: string]: any };
  metadata: { [key: string]: any };
  catalogId?: string;  // Catalog created from this session
}

// App settings
export interface SettingsRecord {
  id: string;  // e.g., 'global', 'user_1234', etc.
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  captureSettings: {
    interval: number;  // In milliseconds
    quality: number;   // 0-1
    resolution: {
      width: number;
      height: number;
    };
  };
  storageSettings: {
    maxFramesPerSession: number;
    autoDeleteAfterDays: number;
  };
  userPreferences: { [key: string]: any };
}

/**
 * Database service for storing and retrieving data
 */
class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'AutoDukaanDB';
  private readonly DB_VERSION = 1;
  
  /**
   * Initialize the database
   */
  public async initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Failed to open database:', event);
        reject(new Error('Failed to open database'));
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database initialized');
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('catalogId', 'catalogId', { unique: false });
          productStore.createIndex('vendorId', 'vendorId', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('isPublished', 'isPublished', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('capturedFrames')) {
          const framesStore = db.createObjectStore('capturedFrames', { keyPath: 'id' });
          framesStore.createIndex('sessionId', 'sessionId', { unique: false });
          framesStore.createIndex('timestamp', 'timestamp', { unique: false });
          framesStore.createIndex('isProcessed', 'isProcessed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('catalogs')) {
          const catalogsStore = db.createObjectStore('catalogs', { keyPath: 'id' });
          catalogsStore.createIndex('vendorId', 'vendorId', { unique: false });
          catalogsStore.createIndex('isPublished', 'isPublished', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('role', 'role', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('customerId', 'customerId', { unique: false });
          ordersStore.createIndex('vendorId', 'vendorId', { unique: false });
          ordersStore.createIndex('status', 'status', { unique: false });
          ordersStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('vendorId', 'vendorId', { unique: false });
          sessionsStore.createIndex('status', 'status', { unique: false });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }
  
  /**
   * Generic method to add an item to a store
   */
  public async add<T>(storeName: keyof DBSchema, item: T): Promise<string> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      
      request.onsuccess = () => {
        resolve(request.result as string);
      };
      
      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        reject(new Error(`Failed to add item to ${storeName}`));
      };
    });
  }
  
  /**
   * Generic method to update an item in a store
   */
  public async update<T>(storeName: keyof DBSchema, item: T): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        reject(new Error(`Failed to update item in ${storeName}`));
      };
    });
  }
  
  /**
   * Generic method to get an item from a store by ID
   */
  public async get<T>(storeName: keyof DBSchema, id: string): Promise<T | null> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result as T || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        reject(new Error(`Failed to get item from ${storeName}`));
      };
    });
  }
  
  /**
   * Generic method to delete an item from a store by ID
   */
  public async delete(storeName: keyof DBSchema, id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        reject(new Error(`Failed to delete item from ${storeName}`));
      };
    });
  }
  
  /**
   * Generic method to get all items from a store
   */
  public async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting all items from ${storeName}:`, event);
        reject(new Error(`Failed to get all items from ${storeName}`));
      };
    });
  }
  
  /**
   * Query items using an index
   */
  public async query<T>(
    storeName: keyof DBSchema, 
    indexName: string, 
    value: any
  ): Promise<T[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        console.error(`Error querying items from ${storeName}:`, event);
        reject(new Error(`Failed to query items from ${storeName}`));
      };
    });
  }
  
  /**
   * Clear a store
   */
  public async clear(storeName: keyof DBSchema): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Error clearing ${storeName}:`, event);
        reject(new Error(`Failed to clear ${storeName}`));
      };
    });
  }
  
  /**
   * Save a captured frame
   */
  public async saveCapturedFrame(frame: CapturedFrameRecord): Promise<string> {
    return this.add<CapturedFrameRecord>('capturedFrames', frame);
  }
  
  /**
   * Get frames for a session
   */
  public async getSessionFrames(sessionId: string): Promise<CapturedFrameRecord[]> {
    return this.query<CapturedFrameRecord>('capturedFrames', 'sessionId', sessionId);
  }
  
  /**
   * Create a new product from a captured frame
   */
  public async createProductFromFrame(
    frame: CapturedFrameRecord,
    product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt' | 'images'>
  ): Promise<string> {
    const now = new Date();
    const productId = `product_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newProduct: ProductRecord = {
      ...product,
      id: productId,
      images: [frame.editedImageUrl || frame.imageUrl],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    
    // Save the product
    await this.add<ProductRecord>('products', newProduct);
    
    // Update the frame to link it to the product
    frame.productDetected = productId;
    await this.update<CapturedFrameRecord>('capturedFrames', frame);
    
    return productId;
  }
  
  /**
   * Create a catalog from frames
   */
  public async createCatalog(
    catalog: Omit<CatalogRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = new Date();
    const catalogId = `catalog_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newCatalog: CatalogRecord = {
      ...catalog,
      id: catalogId,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save the catalog
    await this.add<CatalogRecord>('catalogs', newCatalog);
    
    return catalogId;
  }
  
  /**
   * Get products for a catalog
   */
  public async getCatalogProducts(catalogId: string): Promise<ProductRecord[]> {
    return this.query<ProductRecord>('products', 'catalogId', catalogId);
  }
  
  /**
   * Save user settings
   */
  public async saveSettings(settings: SettingsRecord): Promise<boolean> {
    return this.update<SettingsRecord>('settings', settings);
  }
  
  /**
   * Get user settings
   */
  public async getSettings(id: string): Promise<SettingsRecord | null> {
    return this.get<SettingsRecord>('settings', id);
  }
  
  /**
   * Export database as JSON
   */
  public async exportDatabase(): Promise<string> {
    if (!this.db) await this.initialize();
    
    const data: Partial<DBSchema> = {};
    
    // Export each store
    for (const storeName of this.db!.objectStoreNames) {
      const storeData = await this.getAll(storeName as keyof DBSchema);
      data[storeName as keyof DBSchema] = storeData as any;
    }
    
    return JSON.stringify(data);
  }
  
  /**
   * Import database from JSON
   */
  public async importDatabase(jsonData: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    try {
      const data = JSON.parse(jsonData) as Partial<DBSchema>;
      
      // Import each store
      for (const storeName in data) {
        // Clear existing data
        await this.clear(storeName as keyof DBSchema);
        
        // Add new data
        const items = data[storeName as keyof DBSchema] || [];
        for (const item of items) {
          await this.add(storeName as keyof DBSchema, item);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing database:', error);
      return false;
    }
  }
}

export default new DatabaseService();