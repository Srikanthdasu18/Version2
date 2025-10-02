import { supabase } from '../lib/supabase';
import type { Mechanic } from '../types';

export const mechanicService = {
  async createMechanic(userId: string, mechanicData: Partial<Mechanic>) {
    const { data, error } = await supabase
      .from('mechanics')
      .insert({
        user_id: userId,
        ...mechanicData,
        is_approved: false,
        is_available: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async getMechanic(userId: string) {
    const { data, error } = await supabase
      .from('mechanics')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Mechanic | null;
  },

  async updateMechanic(mechanicId: string, updates: Partial<Mechanic>) {
    const { data, error } = await supabase
      .from('mechanics')
      .update(updates)
      .eq('id', mechanicId)
      .select()
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async toggleAvailability(mechanicId: string, isAvailable: boolean) {
    const { data, error } = await supabase
      .from('mechanics')
      .update({ is_available: isAvailable })
      .eq('id', mechanicId)
      .select()
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async getMechanicStats(mechanicId: string) {
    const { data: mechanic, error: mechanicError } = await supabase
      .from('mechanics')
      .select('total_services, rating, hourly_rate')
      .eq('id', mechanicId)
      .single();

    if (mechanicError) throw mechanicError;

    const { count: pendingCount, error: pendingError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('mechanic_id', mechanicId)
      .in('status', ['assigned', 'in_progress']);

    if (pendingError) throw pendingError;

    const { count: completedCount, error: completedError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('mechanic_id', mechanicId)
      .eq('status', 'completed');

    if (completedError) throw completedError;

    const { data: earnings, error: earningsError } = await supabase
      .from('service_requests')
      .select('final_cost')
      .eq('mechanic_id', mechanicId)
      .eq('status', 'completed');

    if (earningsError) throw earningsError;

    const totalEarnings = earnings?.reduce(
      (sum, req) => sum + (req.final_cost || 0),
      0
    ) || 0;

    return {
      ...mechanic,
      pending_services: pendingCount || 0,
      completed_services: completedCount || 0,
      total_earnings: totalEarnings,
    };
  },

  async getAvailableMechanics() {
    const { data, error } = await supabase
      .from('mechanics')
      .select(`
        *,
        user:users(name, city, latitude, longitude)
      `)
      .eq('is_available', true)
      .eq('is_approved', true)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data as Mechanic[];
  },
};
