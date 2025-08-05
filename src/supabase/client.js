import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vysvmnjbwgjkpwukkhfh.supabase.co'; // reemplazá esto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5c3Ztbmpid2dqa3B3dWtraGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0Mjk4NzksImV4cCI6MjA3MDAwNTg3OX0.QfOE_Q3Cc-tOnhaFFOBu7Wwab5gsI9Mg0bsOUbw6kUI'; // reemplazá esto

export const supabase = createClient(supabaseUrl, supabaseKey);
