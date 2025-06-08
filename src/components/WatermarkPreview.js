import React, { useState, useEffect } from 'react';
import { X, Download, Eye } from 'lucide-react';
import { generateWatermarkPreview, cleanupBlobUrl } from '../utils/watermark';

const WatermarkPreview = ({ logo, isOpen, onClose, onPurchase, isPurchased, downloadUrls }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && logo && !isPurchased) {
      generatePreviewWithWatermark();
    }
    
    return () => {
      // Cleanup blob URL when component unmounts
      if (previewUrl) {
        cleanupBlobUrl(previewUrl);
      }
    };
  }, [isOpen, logo, isPurchased]);

  const generatePreviewWithWatermark = async () => {
    setLoading(true);
    try {
      const originalUrl = getDisplayImageUrl(logo);
      const watermarkedUrl = await generateWatermarkPreview(originalUrl, logo.name);
      setPreviewUrl(watermarkedUrl);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewUrl(getDisplayImageUrl(logo));
    }
    setLoading(false);
  };

  const getDisplayImageUrl = (logo) => {
    if (logo.single_format_url) {
      return logo.single_format_url;
    }
    
    // Return first available display format
    for (const format of logo.display_formats || []) {
      if (logo.formats && logo.formats[format]) {
        return logo.formats[format];
      }
    }
    
    return logo.watermark_url || "https://via.placeholder.com/400x300/gray/white?text=No+Image";
  };

  const getAdditionalFormatsMessage = (logo) => {
    const hiddenFormats = (logo.available_formats || []).filter(
      format => !(logo.display_formats || []).includes(format)
    );
    
    if (hiddenFormats.length > 0) {
      return `Includes other formats on purchase (${hiddenFormats.map(f => f.toUpperCase()).join(', ')})`;
    }
    return null;
  };

  if (!isOpen || !logo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{logo.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="relative">
                {loading ? (
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                    <div className="text-gray-500">Generating preview...</div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={isPurchased ? getDisplayImageUrl(logo) : (previewUrl || getDisplayImageUrl(logo))}
                      alt={logo.name}
                      className="w-full aspect-square object-cover rounded-lg shadow-lg"
                    />
                    {!isPurchased && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Eye size={14} />
                        Preview
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Format Info */}
              {!isPurchased && getAdditionalFormatsMessage(logo) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm font-medium">
                    ✨ {getAdditionalFormatsMessage(logo)}
                  </p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{logo.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Available Formats</h3>
                <div className="flex flex-wrap gap-2">
                  {(logo.available_formats || []).map((format) => (
                    <span
                      key={format}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isPurchased 
                          ? 'bg-green-100 text-green-700'
                          : (logo.display_formats || []).includes(format)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {format.toUpperCase()}
                      {!isPurchased && !(logo.display_formats || []).includes(format) && ' 🔒'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    ₹{logo.price}
                  </div>
                  <div className="text-sm text-red-500">
                     limited time offer!
                  </div>
                </div>

                {!isPurchased ? (
                  <button
                    onClick={() => onPurchase(logo)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Buy & Download Now
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-green-600 font-semibold text-center py-2">
                      ✅ Purchased Successfully!
                    </div>
                    
                    {downloadUrls && downloadUrls.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Download Your Files:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {downloadUrls.map((item, index) => (
                            <a
                              key={index}
                              href={item.url}
                              download={`${logo.name.replace(/\s+/g, '_')}.${item.format}`}
                              className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              {item.format.toUpperCase()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkPreview;