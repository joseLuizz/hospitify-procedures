
import { createClient } from '@supabase/supabase-js';

// Use environment variables for better security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  role: 'tec enfermagem' | 'enfermeiro' | 'medico' | 'admin';
  name: string;
  createdAt: string;
}

// Authentication functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string, role: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        name,
      }
    }
  });
  
  if (authError) return { data: null, error: authError };
  
  // Create profile entry in user_profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .insert([
      { 
        id: authData.user?.id, 
        email, 
        role, 
        name,
        created_at: new Date().toISOString() 
      }
    ]);
    
  return { data: { auth: authData, profile: profileData }, error: profileError };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { profile: data as UserProfile, error };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
    
  return { users: data as UserProfile[], error };
}

export async function updateUserRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId);
    
  return { data, error };
}

export async function deleteUser(userId: string) {
  // This would require admin privileges in a real app
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);
    
  return { error };
}
