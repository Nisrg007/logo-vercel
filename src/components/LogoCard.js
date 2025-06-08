import { Download, Star, Sparkles, TrendingUp, Eye, ShoppingCart } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';




const LogoCard = ({ logo, onPreviewClick, onPurchaseClick, isPurchased, downloadUrls }) => {
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      slider.current?.next();
    }, 3500);
    return () => clearInterval(interval);
  }, [slider]);
  

  // Get tag based on click count
  const getLogoTag = (totalBuyClicks) => {
    if (totalBuyClicks > 50) {
      return { text: "Trending", icon: TrendingUp, color: "bg-red-500" };
    } else if (totalBuyClicks < 20) {
      return { text: "New", icon: Sparkles, color: "bg-green-500" };
    }
    return null;
  };

  // Get additional formats message
  const getAdditionalFormatsMessage = (logo) => {
    const hiddenFormats = (logo.available_formats || []).filter(
      format => !(logo.display_formats || []).includes(format)
    );
    
    if (hiddenFormats.length > 0) {
      return `+ ${hiddenFormats.length} more format${hiddenFormats.length > 1 ? 's' : ''} on purchase`;
    }
    return null;
  };

  // Get display image URL
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
    
    return logo.watermark_url || "https://via.placeholder.com/300x200/gray/white?text=No+Image";
  };

  const tag = getLogoTag(logo.total_buy_clicks || 0);
  const additionalFormats = getAdditionalFormatsMessage(logo);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Image Container */}
      <div className="relative overflow-hidden" onClick={() => onPreviewClick(logo)}>
     

      {(logo.display_formats || []).length > 1 ? (
  // 🔁 Slider when multiple formats exist
  <div ref={sliderRef} className="keen-slider h-48 overflow-hidden" onClick={() => onPreviewClick(logo)}>
    {(logo.display_formats || []).map((format) => {
      const imageUrl = logo.formats?.[format];
      return (
        <div
          key={format}
          className="keen-slider__slide flex justify-center items-center bg-white"
        >
          <img
            src={imageUrl}
            alt={`${logo.name} - ${format}`}
            className="h-48 w-full object-cover"
          />
        </div>
      );
    })}
  </div>
) : (
  // 🖼️ Static image when only one or no display format
  <div className="relative overflow-hidden" onClick={() => onPreviewClick(logo)}>
    <img
      src={getDisplayImageUrl(logo)}
      alt={logo.name}
      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
    />
    
    {/* Tag */}
    {tag && (
      <div className={`absolute top-3 left-3 ${tag.color} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <tag.icon size={12} />
        {tag.text}
      </div>
    )}
    
    {/* Preview overlay */}
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
        <Eye className="text-gray-800" size={24} />
      </div>
    </div>
  </div>
)}
        
        {/* Tag */}
        {tag && (
          <div className={`absolute top-3 left-3 ${tag.color} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
            <tag.icon size={12} />
            {tag.text}
          </div>
        )}
        
        {/* Preview overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
            <Eye className="text-gray-800" size={24} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{logo.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{logo.description}</p>
        
        {/* Additional formats info */}
        {additionalFormats && !isPurchased && (
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-xs font-medium">
                <Star className="inline w-3 h-3 mr-1" />
                {additionalFormats}
              </p>
            </div>
          </div>
        )}

        {/* Available formats preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {(logo.display_formats || []).map((format) => (
              <span
                key={format}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium"
              >
                {format.toUpperCase()}
              </span>
            ))}
            {additionalFormats && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                +{(logo.available_formats || []).length - (logo.display_formats || []).length} more
              </span>
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">
            ₹{logo.price}
          </div>
          
          {!isPurchased ? (
            <button
              onClick={() => onPurchaseClick(logo)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              Buy Now
            </button>
          ) : (
            <div className="text-green-600 font-semibold">Purchased ✓</div>
          )}
        </div>

        {/* Download buttons (shown after purchase) */}
        {isPurchased && downloadUrls && downloadUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Download Files:</h4>
            <div className="flex flex-wrap gap-2">
              {downloadUrls.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  download={`${logo.name.replace(/\s+/g, '_')}.${item.format}`}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Download size={12} />
                  {item.format.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoCard;