// Razorpay integration service
export const RAZORPAY_KEY_ID = 'rzp_test_5DIzn0FmHf2KvG';
export const RAZORPAY_KEY_SECRET = 'NWKXBIXQPoFAjOqEr4l2Wavg';

// Initialize Razorpay SDK
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order (you'll need a backend for this in production)
export const createRazorpayOrder = async (amount, currency = 'INR') => {
  // In production, this should be a backend API call
  // For now, we'll create the order directly in the frontend
  // Note: This is not secure for production use
  
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: orderId,
    amount: amount * 100, // Convert to paise
    currency: currency,
    status: 'created'
  };
};

// Open Razorpay checkout
export const openRazorpayCheckout = async (options) => {
  const isRazorpayLoaded = await initializeRazorpay();
  
  if (!isRazorpayLoaded) {
    throw new Error("Razorpay SDK failed to load");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      ...options,
      handler: function (response) {
        resolve(response);
      },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled'));
        }
      }
    });

    rzp.open();
  });
};

// Verify payment (in production, this should be done on backend)
export const verifyPayment = async (paymentData) => {
  // In production, verify the payment signature on your backend
  // For demo purposes, we'll assume payment is valid
  
  return {
    verified: true,
    payment_id: paymentData.razorpay_payment_id,
    order_id: paymentData.razorpay_order_id,
    signature: paymentData.razorpay_signature
  };
};