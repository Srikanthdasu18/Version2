import { supabase } from '../lib/supabase';
import type { Product, ProductCategory } from '../types';

export const productService = {
  async getProducts(filters?: {
    category?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(
          id,
          shop_name,
          logo_url,
          rating,
          user:users(city, latitude, longitude)
        ),
        category:product_categories(id, name, slug)
      `)
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(
          id,
          shop_name,
          logo_url,
          rating,
          user:users(name, city, phone, latitude, longitude)
        ),
        category:product_categories(id, name, slug)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Product not found');

    await supabase
      .from('products')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    return data as Product;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as ProductCategory[];
  },

  async createProduct(vendorId: string, productData: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        ...productData,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;
  },

  async getFeaturedProducts(limit = 6) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(shop_name, logo_url),
        category:product_categories(name)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit)
      .order('view_count', { ascending: false });

    if (error) throw error;
    return data as Product[];
  },
};
