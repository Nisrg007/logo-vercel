// services/razorpay.js
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_cFZWuayhMjG0hc';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('Razorpay Service Config:', {
  key_id: RAZORPAY_KEY_ID,
  api_url: API_BASE_URL
});

// Initialize Razorpay SDK
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay order via backend
export const createRazorpayOrder = async (amount, logoId, logoName) => {
  try {
    console.log('Creating order:', { amount, logoId, logoName });
    
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    if (!logoId) {
      throw new Error('Logo ID is required');
    }

    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency: 'INR',
        logoId: logoId,
        logoName: logoName || ''
      }),
    });

    console.log('Order response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Order creation failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Order created successfully:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    return data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Open Razorpay checkout
export const openRazorpayCheckout = async (options) => {
  try {
    console.log('Opening Razorpay checkout with options:', options);
    
    const isRazorpayLoaded = await initializeRazorpay();

    if (!isRazorpayLoaded) {
      throw new Error("Razorpay SDK failed to load");
    }

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        ...options,
        handler: function (response) {
          console.log('Payment successful:', response);
          resolve(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            reject(new Error('Payment cancelled'));
          },
          escape: false,
          animation: true
        }
      });

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        reject(new Error(response.error.description || 'Payment failed'));
      });

      rzp.open();
    });
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

// Verify payment via backend
export const verifyPayment = async (paymentData, logoId) => {
  try {
    console.log('Verifying payment:', { paymentData, logoId });
    
    const response = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        logoId: logoId
      }),
    });

    console.log('Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment verification failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Payment verification result:', data);

    if (!data.success) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/health`);
    const data = await response.json();
    console.log('API Health Check:', data);
    return data;
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
};