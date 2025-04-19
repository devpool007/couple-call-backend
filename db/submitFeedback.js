import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const submitFeedback = async (name, email, message) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ name, email, message }]);

  if (error) {
    console.error('Error inserting feedback:', error);
    return { success: false, error };
  }

  return { success: true, data };
};