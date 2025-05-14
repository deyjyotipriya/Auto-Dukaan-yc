import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CropIcon, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Undo, 
  Redo, 
  Check, 
  X, 
  ImageIcon,
  Save,
  RefreshCw,
  Eraser,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import DatabaseService, { CapturedFrameRecord } from '../../services/DatabaseService';

interface ImageEditorProps {
  frame: CapturedFrameRecord;
  onSave: (editedFrame: CapturedFrameRecord) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ frame, onSave, onCancel }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  // Load the image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      imageRef.current = img;
      setIsLoading(false);
      
      if (canvasRef.current) {
        // Set canvas dimensions to match image aspect ratio
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Initial render of the image
        renderCanvas();
        
        // Save initial state for undo
        saveCanvasState();
      }
    };
    img.onerror = () => {
      console.error('Failed to load image');
      setIsLoading(false);
    };
    
    // Use the edited image if available, otherwise use the original
    img.src = frame.editedImageUrl || frame.imageUrl;
  }, [frame]);
  
  // Render the canvas with current settings
  const renderCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for transformations
    ctx.save();
    
    // Move to canvas center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply zoom
    ctx.scale(zoom, zoom);
    
    // Draw image centered
    ctx.drawImage(
      imageRef.current,
      -imageRef.current.width / 2,
      -imageRef.current.height / 2,
      imageRef.current.width,
      imageRef.current.height
    );
    
    // Restore context
    ctx.restore();
    
    // Apply filters
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyFilters(imageData, brightness, contrast, saturation);
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Draw crop area if active
    if (isCropping && cropArea) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw resize handles
      ctx.fillStyle = '#ffffff';
      const handleSize = 8;
      
      // Draw corner handles
      [
        [cropArea.x, cropArea.y], // Top-left
        [cropArea.x + cropArea.width, cropArea.y], // Top-right
        [cropArea.x, cropArea.y + cropArea.height], // Bottom-left
        [cropArea.x + cropArea.width, cropArea.y + cropArea.height], // Bottom-right
      ].forEach(([x, y]) => {
        ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      });
    }
  };
  
  // Apply image filters
  const applyFilters = (
    imageData: ImageData,
    brightness: number,
    contrast: number,
    saturation: number
  ) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to HSL, modify saturation, convert back
      let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      
      // Apply saturation
      s = s * (saturation / 100);
      s = Math.max(0, Math.min(1, s));
      
      // Apply brightness to lightness
      l = l * (brightness / 100);
      l = Math.max(0, Math.min(1, l));
      
      // Convert back to RGB
      const [r, g, b] = hslToRgb(h, s, l);
      
      // Apply contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      data[i] = factor * (r - 128) + 128;
      data[i + 1] = factor * (g - 128) + 128;
      data[i + 2] = factor * (b - 128) + 128;
    }
  };
  
  // RGB to HSL conversion
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return [h, s, l];
  };
  
  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };
  
  // Save the current canvas state for undo
  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9);
    setUndoStack(prev => [...prev, imageData]);
    setRedoStack([]);
  };
  
  // Undo the last action
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    loadImageFromDataUrl(previousState);
  };
  
  // Redo the last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, nextState]);
    setRedoStack(prev => prev.slice(0, -1));
    
    loadImageFromDataUrl(nextState);
  };
  
  // Load image from data URL
  const loadImageFromDataUrl = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      if (canvasRef.current) {
        // Reset canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };
    img.src = dataUrl;
  };
  
  // Start crop operation
  const startCrop = () => {
    setIsCropping(true);
    setCropArea(null);
    setCropStart(null);
  };
  
  // Apply the crop
  const applyCrop = () => {
    if (!canvasRef.current || !cropArea) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Draw the cropped portion to the temporary canvas
    tempCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );
    
    // Save the current state before applying crop
    saveCanvasState();
    
    // Update the main canvas with the cropped image
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Reset cropping state
    setIsCropping(false);
    setCropArea(null);
    
    // Update image reference
    const img = new Image();
    img.src = canvas.toDataURL('image/jpeg', 0.9);
    img.onload = () => {
      imageRef.current = img;
    };
  };
  
  // Cancel cropping
  const cancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
    renderCanvas();
  };
  
  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (isCropping) {
      setCropStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
      setIsDragging(true);
    }
  };
  
  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isDragging || !cropStart) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (isCropping) {
      // Update crop area
      setCropArea({
        x: Math.min(cropStart.x, x),
        y: Math.min(cropStart.y, y),
        width: Math.abs(x - cropStart.x),
        height: Math.abs(y - cropStart.y),
      });
      
      // Redraw canvas with updated crop area
      renderCanvas();
    }
  };
  
  // Mouse up handler
  const handleMouseUp = () => {
    if (isDragging && isCropping) {
      setIsDragging(false);
    }
  };
  
  // Rotate the image
  const rotateImage = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    
    if (newRotation === 0 || newRotation === 180) {
      // No need to swap canvas dimensions
    } else {
      // Maybe swap canvas dimensions for 90/270 degrees later if needed
    }
    
    saveCanvasState();
    renderCanvas();
  };
  
  // Zoom in
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
    renderCanvas();
  };
  
  // Zoom out
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
    renderCanvas();
  };
  
  // Reset image
  const resetImage = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Reset canvas dimensions
      canvas.width = imageRef.current.width;
      canvas.height = imageRef.current.height;
      
      // Draw original image
      ctx.drawImage(imageRef.current, 0, 0);
      
      saveCanvasState();
    }
  };
  
  // Handle brightness change
  const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(Number(event.target.value));
    renderCanvas();
  };
  
  // Handle contrast change
  const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContrast(Number(event.target.value));
    renderCanvas();
  };
  
  // Handle saturation change
  const handleSaturationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaturation(Number(event.target.value));
    renderCanvas();
  };
  
  // Apply all filters
  const applyFiltersToCanvas = () => {
    saveCanvasState();
    renderCanvas();
  };
  
  // Save the edited image
  const handleSave = async () => {
    if (!canvasRef.current) return;
    
    // Get final image as data URL
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    
    // Update frame with edited image
    const updatedFrame: CapturedFrameRecord = {
      ...frame,
      isEdited: true,
      editedImageUrl: dataUrl,
      cropInfo: cropArea || frame.cropInfo,
    };
    
    // Save to database
    try {
      await DatabaseService.update('capturedFrames', updatedFrame);
      
      // Notify parent
      onSave(updatedFrame);
    } catch (error) {
      console.error('Failed to save edited image:', error);
    }
  };
  
  useEffect(() => {
    // Re-render canvas when component updates
    renderCanvas();
  }, [zoom, rotation, brightness, contrast, saturation, cropArea]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-medium mb-4">{t('livestream.imageEditor.title')}</h2>
      
      {/* Image Editor Container */}
      <div ref={containerRef} className="relative mb-6">
        {isLoading ? (
          <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[60vh]">
            <canvas
              ref={canvasRef}
              className={`border rounded ${isCropping ? 'cursor-crosshair' : 'cursor-move'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        )}
      </div>
      
      {/* Editor Controls */}
      <div className="space-y-4">
        {/* Main actions */}
        <div className="flex flex-wrap gap-2">
          {isCropping ? (
            <>
              <Button onClick={applyCrop} variant="default" disabled={!cropArea}>
                <Check className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.applyCrop')}
              </Button>
              <Button onClick={cancelCrop} variant="outline">
                <X className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.cancelCrop')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={startCrop} variant="outline">
                <CropIcon className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.crop')}
              </Button>
              <Button onClick={rotateImage} variant="outline">
                <RotateCcw className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.rotate')}
              </Button>
              <Button onClick={zoomIn} variant="outline">
                <ZoomIn className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.zoomIn')}
              </Button>
              <Button onClick={zoomOut} variant="outline">
                <ZoomOut className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.zoomOut')}
              </Button>
              <Button 
                onClick={handleUndo} 
                variant="outline" 
                disabled={undoStack.length <= 1}
              >
                <Undo className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.undo')}
              </Button>
              <Button 
                onClick={handleRedo} 
                variant="outline" 
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.redo')}
              </Button>
              <Button onClick={resetImage} variant="outline">
                <RefreshCw className="w-4 h-4 mr-1" />
                {t('livestream.imageEditor.reset')}
              </Button>
            </>
          )}
        </div>
        
        {/* Image adjustments */}
        {!isCropping && (
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-3 flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {t('livestream.imageEditor.adjustments')}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="brightness" className="block text-sm mb-1">
                  {t('livestream.imageEditor.brightness')}: {brightness}%
                </label>
                <input
                  id="brightness"
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={handleBrightnessChange}
                  onMouseUp={applyFiltersToCanvas}
                  onTouchEnd={applyFiltersToCanvas}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="contrast" className="block text-sm mb-1">
                  {t('livestream.imageEditor.contrast')}: {contrast}%
                </label>
                <input
                  id="contrast"
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={handleContrastChange}
                  onMouseUp={applyFiltersToCanvas}
                  onTouchEnd={applyFiltersToCanvas}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="saturation" className="block text-sm mb-1">
                  {t('livestream.imageEditor.saturation')}: {saturation}%
                </label>
                <input
                  id="saturation"
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={handleSaturationChange}
                  onMouseUp={applyFiltersToCanvas}
                  onTouchEnd={applyFiltersToCanvas}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 mr-1" />
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-1" />
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;