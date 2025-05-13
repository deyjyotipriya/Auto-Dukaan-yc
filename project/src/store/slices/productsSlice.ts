import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  values: string[];
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [
    {
      id: '1',
      name: 'Cotton Kurti',
      price: 599,
      description: 'Beautiful cotton kurti with traditional hand embroidery.',
      images: ['https://images.pexels.com/photos/4956771/pexels-photo-4956771.jpeg'],
      category: 'Clothing',
      tags: ['Women', 'Traditional', 'Summer'],
      stock: 15,
      variants: [
        {
          id: 'size',
          name: 'Size',
          values: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'color',
          name: 'Color',
          values: ['Red', 'Blue', 'Green']
        }
      ],
      createdAt: '2023-05-10T10:30:00Z',
      updatedAt: '2023-05-10T10:30:00Z'
    },
    {
      id: '2',
      name: 'Handmade Jhumkas',
      price: 299,
      description: 'Beautiful handcrafted jhumkas with intricate design.',
      images: ['https://images.pexels.com/photos/13992207/pexels-photo-13992207.jpeg'],
      category: 'Jewelry',
      tags: ['Women', 'Traditional', 'Handmade'],
      stock: 8,
      createdAt: '2023-05-15T14:20:00Z',
      updatedAt: '2023-05-15T14:20:00Z'
    },
    {
      id: '3',
      name: 'Handwoven Saree',
      price: 1499,
      description: 'Premium quality handwoven saree with traditional design.',
      images: ['https://images.pexels.com/photos/12592595/pexels-photo-12592595.jpeg'],
      category: 'Clothing',
      tags: ['Women', 'Traditional', 'Premium'],
      stock: 5,
      variants: [
        {
          id: 'color',
          name: 'Color',
          values: ['Red', 'Blue', 'Green', 'Yellow']
        }
      ],
      createdAt: '2023-06-01T09:15:00Z',
      updatedAt: '2023-06-01T09:15:00Z'
    },
    {
      id: '4',
      name: 'Silver Anklet',
      price: 399,
      description: 'Sterling silver anklet with traditional bells.',
      images: ['https://images.pexels.com/photos/10605196/pexels-photo-10605196.jpeg'],
      category: 'Jewelry',
      tags: ['Women', 'Silver', 'Handmade'],
      stock: 12,
      createdAt: '2023-06-10T11:45:00Z',
      updatedAt: '2023-06-10T11:45:00Z'
    }
  ],
  loading: false,
  error: null,
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; product: Partial<Product> }>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...action.payload.product,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.stock -= action.payload.quantity;
        product.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { addProduct, updateProduct, deleteProduct, updateStock } = productsSlice.actions;

// Alias updateStock as updateStockQuantity for backward compatibility
export const updateStockQuantity = updateStock;

export const selectAllProducts = (state: RootState) => state.products.products;
export const selectProductById = (id: string) => (state: RootState) => 
  state.products.products.find(product => product.id === id);
export const selectLowStockProducts = (state: RootState) => 
  state.products.products.filter(product => product.stock < 5);

export default productsSlice.reducer;