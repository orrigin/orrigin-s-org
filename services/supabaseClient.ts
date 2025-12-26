
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncqapceypbguxbfhonag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcWFwY2V5cGJndXhiZmhvbmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzA1MDgsImV4cCI6MjA4MjI0NjUwOH0.nymElJpBldVyKzqrR7qhIXQQ_7Mf2zhN69rxdwDjaZg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
