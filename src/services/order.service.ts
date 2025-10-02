import { supabase } from '../lib/supabase';
import type { Order } from '../types';

export interface CreateOrderData {
  customer_id: string;
  items: Array<{
    product_id: string;
    vendor_id: string;
    quantity: number;
    unit_price: number;
    product_name: string;
    product_image?: string;
  }>;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_phone?: string;
  notes?: string;
}

export const orderService = {
  async createOrder(orderData: CreateOrderData) {
    const { items, ...orderInfo } = orderData;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...orderInfo,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      ...item,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order as Order;
  },

  async getOrders(userId: string, role: 'customer' | 'vendor', limit = 50) {
    let query = supabase.from('orders').select(`
      id,
      order_number,
      status,
      total_amount,
      created_at,
      customer:users(name)
    `);

    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      query = query.eq('order_items.vendor_id', userId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Order[];
  },

  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(name, email, phone),
        order_items(
          *,
          product:products(name, image_urls, description),
          vendor:vendors(id, shop_name, user:users(phone, city))
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Order not found');
    return data as Order;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updatePaymentIntent(orderId: string, paymentIntentId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId,
        status: 'paid',
        payment_method: 'card',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },
};
