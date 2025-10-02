import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';

export const cartService = {
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        product:products(
          *,
          vendor:vendors(id, shop_name, user:users(city, latitude, longitude))
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CartItem[];
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(cartItemId: string) {
    const { error } = await supabase.from('cart').delete().eq('id', cartItemId);

    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase.from('cart').delete().eq('user_id', userId);

    if (error) throw error;
  },
};
