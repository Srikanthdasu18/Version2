import { supabase } from '../lib/supabase';
import type { Vendor } from '../types';

export const vendorService = {
  async createVendor(userId: string, vendorData: Partial<Vendor>) {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        ...vendorData,
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Vendor;
  },

  async getVendor(userId: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Vendor | null;
  },

  async updateVendor(vendorId: string, updates: Partial<Vendor>) {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;
    return data as Vendor;
  },

  async getVendorProducts(vendorId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(name)
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getVendorStats(vendorId: string) {
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('total_orders, total_revenue, rating')
      .eq('id', vendorId)
      .single();

    if (vendorError) throw vendorError;

    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true);

    if (productError) throw productError;

    const { count: lowStockCount, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .lte('stock_quantity', 10);

    if (lowStockError) throw lowStockError;

    return {
      ...vendor,
      product_count: productCount || 0,
      low_stock_count: lowStockCount || 0,
    };
  },

  async getNearbyVendors(
    latitude: number,
    longitude: number,
    productId?: string,
    maxDistance: number = 50
  ) {
    const { data, error } = await supabase.rpc('get_nearby_vendors', {
      user_lat: latitude,
      user_lon: longitude,
      max_distance_km: maxDistance,
      product_id: productId || null,
    });

    if (error) {
      console.error('Error fetching nearby vendors:', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('vendors')
        .select(`
          *,
          user:users(name, city, latitude, longitude)
        `)
        .eq('is_approved', true);

      if (fallbackError) throw fallbackError;
      return fallbackData as Vendor[];
    }

    return data as Vendor[];
  },
};
