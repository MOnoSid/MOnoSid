import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmrrayuwmyzgeicnvgoq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnJheXV3bXl6Z2VpY252Z29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMzgxMDIsImV4cCI6MjA1MzYxNDEwMn0.noQLFU3AXRxU_LtVzwBWikxfgLhDgl5gNviqMHKKuvU';

export const supabase = createClient(supabaseUrl, supabaseKey);