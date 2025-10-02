import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { email, password, name, role, ...userData } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      role,
      phone: userData.phone || null,
      city: userData.city || null,
      pincode: userData.pincode || null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null,
      address: userData.address || null,
      is_active: true,
      is_verified: false,
    });

    if (userError) {
      await supabase.auth.signOut();
      throw userError;
    }

    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error fetching user:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
