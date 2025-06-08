import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all logos
export const fetchLogos = async () => {
  try {
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
};

// Update logo click count
export const updateLogoClicks = async (logoId) => {
  try {
    const { error } = await supabase.rpc('increment_clicks', {
      logo_id: logoId
    });

    if (error) {
      console.error('Error updating clicks:', error);
    }
  } catch (error) {
    console.error('Error updating clicks:', error);
  }
};

// Create purchase record
export const createPurchase = async (purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating purchase:', error);
    return null;
  }
};

// Check if logo is purchased
export const checkPurchase = async (logoId, paymentId) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('logo_id', logoId)
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
};

// Record download
export const recordDownload = async (purchaseId, logoId, format) => {
  try {
    const { error } = await supabase
      .from('downloads')
      .insert([{
        purchase_id: purchaseId,
        logo_id: logoId,
        format: format
      }]);

    if (error) {
      console.error('Error recording download:', error);
    }
  } catch (error) {
    console.error('Error recording download:', error);
  }
};

// Get user purchases (you might want to implement user authentication)
export const getUserPurchases = async (userEmail) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        logos (*)
      `)
      .eq('customer_email', userEmail)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
};

// Create increment function in Supabase (run this in SQL editor)
/*
CREATE OR REPLACE FUNCTION increment_clicks(logo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE logos 
  SET total_buy_clicks = total_buy_clicks + 1,
      updated_at = NOW()
  WHERE id = logo_id;
END;
$$ LANGUAGE plpgsql;
*/