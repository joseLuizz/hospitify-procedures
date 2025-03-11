
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const supabaseUrl = 'https://bhqhpmqchwcseeqcaifv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocWhwbXFjaHdjc2VlcWNhaWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NTk5MjMsImV4cCI6MjA1NzIzNTkyM30.3hzxXSw3W-uNwy5S0BDo1oVfUzafnE7Y0_ZJnT7iz7g';

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

// Function to create the user_profiles table if it doesn't exist
// and set admin@teste.com as admin
export async function initializeDatabase() {
  // Check if the table exists first
  const { error: checkError } = await supabase
    .from('user_profiles')
    .select('count')
    .limit(1)
    .single();
  
  // If table doesn't exist, we need to create it using SQL
  if (checkError && checkError.message.includes('does not exist')) {
    // Create the user_profiles table
    const { error: createError } = await supabase.rpc('create_user_profiles_table');
    
    if (createError) {
      console.error('Error creating table:', createError);
      
      // If the RPC function doesn't exist, we'll need to create it first
      const createTableSql = `
        create table if not exists public.user_profiles (
          id uuid primary key references auth.users,
          email text not null,
          role text not null,
          name text not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `;
      
      // Create the table using SQL (requires supabase service_role key or stored procedure)
      // Since we don't have service_role key available here, we'll need to handle this in the UI
      console.log('Table needs to be created manually in Supabase dashboard.');
    }
  }
  
  // Get the user ID for admin@teste.com
  const { data: userData, error: userError } = await supabase.auth.admin
    .getUserByEmail('admin@teste.com');
  
  if (userError) {
    console.error('Error finding user:', userError);
    return { success: false, error: userError };
  }
  
  if (!userData?.user) {
    console.error('User not found');
    return { success: false, error: new Error('User not found') };
  }
  
  // Check if user profile exists
  const { data: existingProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();
    
  if (profileError && !profileError.message.includes('does not exist')) {
    console.error('Error checking profile:', profileError);
    
    // Create profile for admin user
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        id: userData.user.id,
        email: 'admin@teste.com',
        role: 'admin',
        name: 'Administrator',
        created_at: new Date().toISOString()
      }]);
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return { success: false, error: insertError };
    }
  } else if (existingProfile) {
    // Update existing profile to admin
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', userData.user.id);
      
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: updateError };
    }
  }
  
  return { success: true };
}
