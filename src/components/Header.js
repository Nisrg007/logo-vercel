import React from 'react';
import { Star, Download, Sparkles } from 'lucide-react';


const Header = ({ onExploreClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl mr-4"> 
              <Star className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">LogoMarket</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover premium logo designs for your brand or startup. High-quality logos in multiple formats, 
            ready for instant download after purchase,logos starts from ₹0.
          </p>
          
          <button
            onClick={onExploreClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explore Logos
          </button>
        </div>
      </header>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Download</h3>
            <p className="text-gray-600">Get your logos immediately after purchase in multiple formats</p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
            <p className="text-gray-600">Professional designs for startup and established brands</p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Multiple Formats</h3>
            <p className="text-gray-600">PNG, JPG, SVG, and GIF formats included</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;