
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mtgdssrgtayuihrypdem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Z2Rzc3JndGF5dWlocnlwZGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjIwOTUsImV4cCI6MjA4NjM5ODA5NX0.J5ZHMvVpaEqiyHs6_9WR0LkIFieTG3XA_HBfEFLMsGU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
