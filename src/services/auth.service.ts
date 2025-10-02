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

interface AuthError {
  message: string;
  status?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

function isRetryableError(error: any): boolean {
  const retryableCodes = ['PGRST301', 'ETIMEDOUT', 'ECONNRESET'];
  const errorMessage = error?.message || '';
  return retryableCodes.some(code => errorMessage.includes(code)) ||
         errorMessage.includes('network') ||
         errorMessage.includes('timeout');
}

export const authService = {
  async signUp(data: SignUpData): Promise<User> {
    const { email, password, name, role, ...userData } = data;

    return retryOperation(async () => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            role,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message || 'Failed to create account');
      }
      if (!authData.user) {
        throw new Error('User creation failed');
      }

      const userRecord = {
        id: authData.user.id,
        name: name.trim(),
        role,
        phone: userData.phone?.trim() || null,
        city: userData.city?.trim() || null,
        pincode: userData.pincode?.trim() || null,
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
        address: userData.address?.trim() || null,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      const { data: insertedUser, error: userError } = await supabase
        .from('users')
        .insert(userRecord)
        .select('id, name, role, phone, city, avatar_url, is_active, is_verified, created_at')
        .single();

      if (userError) {
        console.error('User insert error:', userError);
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Cleanup signOut failed:', signOutError);
        }

        if (userError.message?.includes('duplicate')) {
          throw new Error('An account with this email already exists');
        }
        throw new Error(userError.message || 'Failed to create user profile');
      }

      return insertedUser as User;
    });
  },

  async signIn(data: SignInData): Promise<User> {
    return retryOperation(async () => {
      const startTime = Date.now();

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address');
        }
        throw new Error(error.message || 'Sign in failed');
      }

      if (!authData.user) {
        throw new Error('Sign in failed - no user data');
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, role, phone, city, pincode, avatar_url, address, latitude, longitude, is_active, is_verified, created_at')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
        throw new Error('Failed to load user profile');
      }

      if (!user) {
        throw new Error('User profile not found');
      }

      if (!user.is_active) {
        await supabase.auth.signOut();
        throw new Error('Your account has been deactivated');
      }

      supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id)
        .then(() => {
          const duration = Date.now() - startTime;
          console.log(`Sign in completed in ${duration}ms`);
        })
        .catch(err => console.error('Last login update failed:', err));

      return user as User;
    });
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, phone, city, pincode, avatar_url, address, latitude, longitude, is_active, is_verified, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Get current user error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('getCurrentUser failed:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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
          console.error('Error fetching user in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
