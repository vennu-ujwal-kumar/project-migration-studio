import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type Profile = Tables<"profiles">;
export type AppRole = Tables<"user_roles">["role"];

export async function getOwnProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, email, created_at")
    .eq("id", authData.user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function getOwnRole() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.role ?? null;
}

export async function updateOwnUsername(username: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Your session has expired. Please sign in again.");

  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", authData.user.id)
    .select("id, username, email, created_at")
    .single();
  if (error) throw error;
  return data;
}