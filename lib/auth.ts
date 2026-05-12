import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

// ── Get current auth session user ─────────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ── Get user profile from users table ─────────────────────────────────────────
export async function getUserProfile(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error || !data) return null;
  return data as User;
}

// ── Get user role ──────────────────────────────────────────────────────────────
export async function getUserRole(): Promise<'admin' | 'teacher' | null> {
  const profile = await getUserProfile();
  return profile?.role ?? null;
}

// ── Guard: require any authenticated user ────────────────────────────────────
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

// ── Guard: require admin role ─────────────────────────────────────────────────
export async function requireAdmin() {
  const role = await getUserRole();
  if (role !== 'admin') redirect('/login');
  return role;
}

// ── Guard: require teacher role ───────────────────────────────────────────────
export async function requireTeacher() {
  const role = await getUserRole();
  if (role !== 'teacher' && role !== 'admin') redirect('/login');
  return role;
}
