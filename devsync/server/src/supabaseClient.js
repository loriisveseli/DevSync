const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://jmoupuqxkpkcnzyaejla.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptb3VwdXF4a3BrY256eWFlamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDI4ODMsImV4cCI6MjA5MDExODg4M30.rr5ICak5Pq8wFc65QFouVJFzEDzhENm0HwBtfxYtZgU';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;