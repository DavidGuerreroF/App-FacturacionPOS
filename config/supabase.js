require("dotenv").config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
