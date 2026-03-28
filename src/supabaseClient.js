import { createClient } from '@supabase/supabase-js';

// HARDCODE THESE JUST TO TEST (Copy directly from your Supabase Dashboard)
const supabaseUrl = 'https://jmoupuqxkpkcnzyaejla.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptb3VwdXF4a3BrY256eWFlamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDI4ODMsImV4cCI6MjA5MDExODg4M30.rr5ICak5Pq8wFc65QFouVJFzEDzhENm0HwBtfxYtZgU'; // PASTE YOUR FULL ANON KEY HERE

export const supabase = createClient(supabaseUrl, supabaseAnonKey);