#!/usr/bin/env node

/**
 * Check actual count of invited_guests in database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCount() {
  try {
    const { data, error, count } = await supabase
      .from('invited_guests')
      .select('*', { count: 'exact', head: false });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Actual count in database: ${count || data.length}`);
    console.log(`📋 Total entries: ${data.length}`);
    
    // Also check what the admin API would return
    const { data: adminData, error: adminError } = await supabase
      .from('invited_guests')
      .select('id, guest_name, email, allowed_party_size')
      .order('guest_name');
    
    if (!adminError) {
      console.log(`📋 Admin API would return: ${adminData.length} entries`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCount();
