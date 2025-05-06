// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and Key
const supabaseUrl = 'https://fmfeivzeszqyoxljvbir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZmVpdnplc3pxeW94bGp2YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDI5MTEsImV4cCI6MjA2MjA3ODkxMX0.Gf7Xn-xZxNSNn6yRFTH3HwAxINClDn54V9GfF2WkmY8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
