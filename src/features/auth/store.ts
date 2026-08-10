import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  
  initialize: async () => {
    try {
      if (import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL) {
        console.warn('Supabase is not configured. Authentication is disabled.');
        set({ isLoading: false });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user || null });

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile });
      }
    } catch (error) {
      console.error("Error during auth initialization:", error);
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      set({ session: newSession, user: newSession?.user || null });
      if (newSession?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          set({ profile });
        } catch (error) {
           console.error("Error fetching profile on auth change:", error);
        }
      } else {
        set({ profile: null });
      }
    });
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  }
}));
