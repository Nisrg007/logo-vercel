// Watermark utility functions
export const addWatermarkToImage = async (imageUrl, watermarkText = "PREVIEW") => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        const fontSize = Math.min(img.width, img.height) / 10;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.027)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Position watermark in center
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Add text stroke and fill
        ctx.strokeText(watermarkText, x, y);
        ctx.fillText(watermarkText, x, y);
        
        // Add diagonal watermarks
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.font = `bold ${fontSize * 0.6}px Arial`;
        
        const spacing = fontSize * 2;
        for (let i = -canvas.width; i < canvas.width * 2; i += spacing) {
          for (let j = -canvas.height; j < canvas.height * 2; j += spacing) {
            ctx.fillText(watermarkText, i, j);
          }
        }
        ctx.restore();
        
        // Convert to blob URL
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/png', 0.9);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };
  
  // Generate watermark preview URL
  export const generateWatermarkPreview = async (originalUrl, logoName) => {
    try {
      const watermarkText = `${logoName.toUpperCase()}\nPREVIEW`;
      return await addWatermarkToImage(originalUrl, watermarkText);
    } catch (error) {
      console.error('Error generating watermark:', error);
      return originalUrl; // Fallback to original
    }
  };
  
  // Clean up blob URLs to prevent memory leaks
  export const cleanupBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };