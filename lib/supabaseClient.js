import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://eaxzcobkrcgrceojrqed.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheHpjb2JrcmNncmNlb2pycWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NjU2MTcsImV4cCI6MjA1NjE0MTYxN30.FWWBfJ9Vh7B-nDWffBLa7YzbOB0-QL67_RP6cn67leg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
