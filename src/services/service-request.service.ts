import { supabase } from '../lib/supabase';
import type { ServiceRequest, ServicePart } from '../types';

export interface CreateServiceRequestData {
  customer_id: string;
  vehicle_type: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  issue_description: string;
  latitude: number;
  longitude: number;
  address: string;
  image_urls?: string[];
}

export const serviceRequestService = {
  async createServiceRequest(data: CreateServiceRequestData) {
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .insert({
        ...data,
        status: 'pending',
      })
      .select(`
        *,
        customer:users(name, phone),
        mechanic:mechanics(
          id,
          user:users(name, phone)
        )
      `)
      .single();

    if (error) throw error;
    return serviceRequest as ServiceRequest;
  },

  async getServiceRequests(userId: string, role: 'customer' | 'mechanic') {
    let query = supabase.from('service_requests').select(`
      *,
      customer:users(name, phone, city),
      mechanic:mechanics(
        id,
        user:users(name, phone, rating)
      )
    `);

    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      query = query.eq('mechanic.user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as ServiceRequest[];
  },

  async getServiceRequest(id: string) {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        customer:users(name, phone, city, address),
        mechanic:mechanics(
          id,
          expertise,
          hourly_rate,
          rating,
          user:users(name, phone, city, latitude, longitude)
        ),
        service_parts(
          *,
          product:products(
            *,
            vendor:vendors(
              id,
              shop_name,
              user:users(phone, city, latitude, longitude)
            )
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Service request not found');
    return data as ServiceRequest;
  },

  async updateServiceRequest(
    id: string,
    updates: Partial<ServiceRequest>
  ) {
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ServiceRequest;
  },

  async addRecommendedPart(
    serviceRequestId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
    notes?: string
  ) {
    const { data, error } = await supabase
      .from('service_parts')
      .insert({
        service_request_id: serviceRequestId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        notes,
      })
      .select(`
        *,
        product:products(
          *,
          vendor:vendors(shop_name)
        )
      `)
      .single();

    if (error) throw error;
    return data as ServicePart;
  },

  async removeRecommendedPart(partId: string) {
    const { error } = await supabase
      .from('service_parts')
      .delete()
      .eq('id', partId);

    if (error) throw error;
  },

  async completeService(serviceRequestId: string, finalCost?: number) {
    const { data, error } = await supabase
      .from('service_requests')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
        final_cost: finalCost,
      })
      .eq('id', serviceRequestId)
      .select()
      .single();

    if (error) throw error;
    return data as ServiceRequest;
  },
};
