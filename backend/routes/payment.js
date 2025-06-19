// backend/routes/payment.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay instance with better error handling
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// 1. Create Order Endpoint
router.post('/create-order', async (req, res) => {
  try {
    console.log('Creating order with data:', req.body);
    
    const { amount, currency = 'INR', logoId, logoName } = req.body;
    
    // Enhanced validation
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    
    if (!logoId) {
      return res.status(400).json({
        success: false,
        message: 'logoId is required'
      });
    }

    // Check if Razorpay is properly initialized
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing:', {
        key_id: !!process.env.RAZORPAY_KEY_ID,
        key_secret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Create receipt (max 40 chars)
    const timestamp = Date.now().toString().slice(-8);
    const shortLogoId = logoId.toString().slice(0, 10);
    const receipt = `logo_${shortLogoId}_${timestamp}`.slice(0, 40);
    
    // Convert to paise (multiply by 100)
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    
    console.log('Order details:', {
      amount: amountInPaise,
      currency,
      receipt,
      logoId,
      logoName
    });

    // Create order with Razorpay
    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: {
        logoId: logoId.toString(),
        logoName: logoName || ''
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 2. Verify Payment Endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    console.log('Verifying payment:', req.body);
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      logoId
    } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('Signature verification:', { isAuthentic, expectedSignature, receivedSignature: razorpay_signature });

    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 3. Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Payment service is running',
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

module.exports = router;