import React, { useState, useEffect } from 'react';
import { Star, Search, Filter } from 'lucide-react';
import LogoCard from './LogoCard';
import WatermarkPreview from './WatermarkPreview';
import { fetchLogos, updateLogoClicks, createPurchase, recordDownload } from '../services/supabase';
import { openRazorpayCheckout, createRazorpayOrder, verifyPayment } from '../services/razorpay';


const LogoGallery = ({ onBackToHome }) => {
  const [logos, setLogos] = useState([]);
  const [filteredLogos, setFilteredLogos] = useState([]);
  const [purchasedLogos, setPurchasedLogos] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceFilter, setPriceFilter] = useState('all');

  // Fetch logos from Supabase
  useEffect(() => {
    loadLogos();
  }, []);

  // Filter and sort logos
  useEffect(() => {
    let filtered = [...logos];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(logo =>
        logo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        logo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under25':
          filtered = filtered.filter(logo => logo.price < 25);
          break;
        case '25to50':
          filtered = filtered.filter(logo => logo.price >= 25 && logo.price <= 50);
          break;
        case 'over50':
          filtered = filtered.filter(logo => logo.price > 50);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.total_buy_clicks || 0) - (a.total_buy_clicks || 0));
        break;
    }

    setFilteredLogos(filtered);
  }, [logos, searchTerm, sortBy, priceFilter]);

  const loadLogos = async () => {
    setLoading(true);
    try {
      const data = await fetchLogos();
      setLogos(data);
    } catch (error) {
      console.error('Error loading logos:', error);
    }
    setLoading(false);
  };

  const handlePreviewClick = (logo) => {
    setSelectedLogo(logo);
    setShowPreview(true);
  };

// Updated LogoGallery.js - Minimal approach
const handlePurchaseClick = async (logo) => {
  try {
     console.log('Starting purchase for logo:', logo); // Debug log
    // 1. Create order via backend (no customer details needed)
    const order = await createRazorpayOrder(logo.price, logo.id, logo.name);
    console.log('Order created:', order); // Debug log
    // 2. Open Razorpay checkout with minimal details
    const paymentResponse = await openRazorpayCheckout({
      amount: order.amount,
      currency: order.currency,
      name: "LogoMarket",
      description: `Purchase ${logo.name}`,
      order_id: order.id,
      // No prefill needed - user will enter details in Razorpay popup
      theme: {
        color: "#6366F1",
      },
    });
    console.log('Payment response:', paymentResponse);
    // 3. Verify payment via backend
    const verification = await verifyPayment(paymentResponse, logo.id);
    
    if (verification.success) {
      // 4. Create purchase record with minimal data
      const purchaseData = {
        logo_id: logo.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        amount: logo.price,
        currency: 'INR',
        status: 'completed',
        // No customer details stored
      };
      console.log('Payment verified successfully');

      const purchase = await createPurchase(purchaseData);
      
      if (purchase) {
        // 5. Update logo clicks
        await updateLogoClicks(logo.id);
        
        // 6. Enable downloads immediately
        const downloadUrls = getDownloadUrls(logo);
        setPurchasedLogos(prev => new Map(prev.set(logo.id, {
          purchaseId: purchase.id,
          downloadUrls: downloadUrls
        })));
        
        setLogos(prevLogos => 
          prevLogos.map(l => 
            l.id === logo.id 
              ? { ...l, total_buy_clicks: (l.total_buy_clicks || 0) + 1 }
              : l
          )
        );

        alert('Payment successful! You can now download your logo files. We do not store any customer details for privacy so its non-refundable.');
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
    if (error.message !== 'Payment cancelled') {
      alert(`Payment failed: ${error.message}`);
    }
  }
};

  const getDownloadUrls = (logo) => {
    const urls = [];
    
    if (logo.single_format_url) {
      urls.push({
        format: (logo.available_formats && logo.available_formats[0]) || 'png',
        url: logo.single_format_url
      });
    } else if (logo.formats) {
      (logo.available_formats || []).forEach(format => {
        if (logo.formats[format]) {
          urls.push({
            format: format,
            url: logo.formats[format]
          });
        }
      });
    }
    
    return urls;
  };

  const handleDownload = async (logo, format, url) => {
    const purchaseInfo = purchasedLogos.get(logo.id);
    if (purchaseInfo) {
      await recordDownload(purchaseInfo.purchaseId, logo.id, format);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                <Star className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-800">LogoMarket</span>
            </div>
            <button
  onClick={onBackToHome}
  className="inline-flex items-center gap-2 text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 transition-all duration-300 font-medium px-4 py-2 rounded-full shadow-sm"
>
  <span className="text-lg">←</span>
  <span>Back to Home</span>
</button>

          </div>
        </div>
      </nav>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="abs_olute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search logos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="under25">Under ₹25</option>
              <option value="25to50">₹25 - ₹50</option>
              <option value="over50">Over ₹50</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-gray-600">
              <Filter size={16} className="mr-2" />
              {filteredLogos.length} logo{filteredLogos.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Gallery Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Logo Gallery</h2>
          <p className="text-gray-600">Choose from our collection of premium logo designs</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No logos found matching your criteria</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('all');
                setSortBy('newest');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          /* Logo Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLogos.map((logo) => {
              const purchaseInfo = purchasedLogos.get(logo.id);
              return (
                <LogoCard
                  key={logo.id}
                  logo={logo}
                  onPreviewClick={handlePreviewClick}
                  onPurchaseClick={handlePurchaseClick}
                  isPurchased={!!purchaseInfo}
                  downloadUrls={purchaseInfo?.downloadUrls || []}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Watermark Preview Modal */}
      <WatermarkPreview
        logo={selectedLogo}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedLogo(null);
        }}
        onPurchase={handlePurchaseClick}
        isPurchased={selectedLogo ? !!purchasedLogos.get(selectedLogo.id) : false}
        downloadUrls={selectedLogo ? purchasedLogos.get(selectedLogo.id)?.downloadUrls || [] : []}
      />
    </div>
  );
};

export default LogoGallery;