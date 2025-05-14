import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import DatabaseService, { CapturedFrameRecord, ProductRecord } from '../../services/DatabaseService';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ImageEditor from './ImageEditor';

interface ProductCreatorProps {
  frameId?: string;
  initialFrame?: CapturedFrameRecord;
  onClose?: () => void;
  onSuccess?: (productId: string) => void;
}

const ProductCreator: React.FC<ProductCreatorProps> = ({
  frameId,
  initialFrame,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [frame, setFrame] = useState<CapturedFrameRecord | null>(initialFrame || null);
  const [editedImageUrl, setEditedImageUrl] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  
  // Product form state
  const [productData, setProductData] = useState<Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Uncategorized',
    tags: [],
    attributes: {},
    variants: [],
    inventory: 0,
    isPublished: false,
    isDeleted: false,
    vendorId: 'current_user', // In a real app, use the actual user ID
    images: [] // This will be populated with the frame image
  });
  
  // Load frame data if only frameId is provided
  useEffect(() => {
    const loadFrame = async () => {
      if (frameId && !initialFrame) {
        try {
          setIsLoading(true);
          const loadedFrame = await DatabaseService.getCapturedFrame(frameId);
          if (loadedFrame) {
            setFrame(loadedFrame);
            setEditedImageUrl(loadedFrame.editedImageUrl || loadedFrame.imageUrl);
          }
        } catch (error) {
          console.error('Error loading frame:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadFrame();
  }, [frameId, initialFrame]);
  
  // Set initial image from frame
  useEffect(() => {
    if (frame) {
      setEditedImageUrl(frame.editedImageUrl || frame.imageUrl);
      
      // Update product with a default name based on timestamp
      setProductData(prev => ({
        ...prev,
        name: `Product ${new Date(frame.timestamp).toLocaleString()}`,
        images: [{
          url: frame.editedImageUrl || frame.imageUrl,
          alt: `Product image captured on ${new Date(frame.timestamp).toLocaleString()}`,
          isDefault: true
        }]
      }));
    }
  }, [frame]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleToggleChange = (name: string, checked: boolean) => {
    setProductData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    setProductData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };
  
  const handleEditImage = () => {
    setShowEditor(true);
  };
  
  const handleSaveEdit = (editedUrl: string) => {
    setEditedImageUrl(editedUrl);
    
    // Update product images with the new edited image
    setProductData(prev => ({
      ...prev,
      images: [{
        url: editedUrl,
        alt: `Product image captured on ${frame ? new Date(frame.timestamp).toLocaleString() : 'unknown date'}`,
        isDefault: true
      }]
    }));
    
    // Update frame record with edited image URL
    if (frame) {
      const updatedFrame = {
        ...frame,
        isEdited: true,
        editedImageUrl: editedUrl
      };
      
      // Save the updated frame
      DatabaseService.updateCapturedFrame(updatedFrame)
        .then(() => {
          setFrame(updatedFrame);
        })
        .catch(error => {
          console.error('Error updating frame with edited image:', error);
        });
    }
    
    setShowEditor(false);
  };
  
  const handleCancelEdit = () => {
    setShowEditor(false);
  };
  
  const handleCreateProduct = async () => {
    if (!frame) return;
    
    try {
      setIsLoading(true);
      
      // Create the product in the database
      const productId = await DatabaseService.createProduct(productData);
      
      // Link the frame to the product
      await DatabaseService.updateCapturedFrame({
        ...frame,
        productDetected: productId
      });
      
      console.log('Created product:', productId);
      
      if (onSuccess) {
        onSuccess(productId);
      } else {
        // Navigate to product edit page
        navigate(`/products/${productId}`);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsLoading(false);
      if (onClose) onClose();
    }
  };
  
  if (isLoading && !frame) {
    return <div className="p-6 text-center">Loading frame data...</div>;
  }
  
  if (!frame) {
    return <div className="p-6 text-center">Frame not found or not provided.</div>;
  }
  
  if (showEditor && frame) {
    return (
      <ImageEditor
        imageUrl={frame.editedImageUrl || frame.imageUrl}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Product from Screenshot</h2>
      
      <Tabs defaultValue="basic" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="image">Product Image</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name</label>
            <Input
              id="name"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={productData.price}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <Input
              id="category"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              placeholder="Category"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <div className="mb-4">
            <div className="relative aspect-square max-w-md mx-auto border rounded-md overflow-hidden">
              <img
                src={editedImageUrl}
                alt="Product screenshot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleEditImage} variant="outline" className="mr-2">
              Edit Image
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              id="tags"
              name="tags"
              value={productData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div>
            <label htmlFor="inventory" className="block text-sm font-medium mb-1">Inventory</label>
            <Input
              id="inventory"
              name="inventory"
              type="number"
              min="0"
              value={productData.inventory}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="isPublished" 
              checked={productData.isPublished}
              onCheckedChange={(checked) => handleToggleChange('isPublished', checked)} 
            />
            <label htmlFor="isPublished" className="text-sm font-medium">
              Publish immediately
            </label>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 mt-6">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button onClick={handleCreateProduct} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCreator;