#!/usr/bin/env node

/**
 * Check count of seating_assignments vs invited_guests
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCounts() {
  try {
    const { data: invited, count: invitedCount } = await supabase
      .from('invited_guests')
      .select('*', { count: 'exact', head: false });
    
    const { data: seating, count: seatingCount } = await supabase
      .from('seating_assignments')
      .select('*', { count: 'exact', head: false });
    
    console.log(`📊 invited_guests: ${invitedCount || invited.length} entries`);
    console.log(`📊 seating_assignments: ${seatingCount || seating.length} entries`);
    console.log(`\n📋 Difference: ${(seatingCount || seating.length) - (invitedCount || invited.length)} extra entries in seating_assignments`);
    
    if (seating.length > invited.length) {
      console.log('\n🔍 Checking for entries in seating_assignments not in invited_guests...');
      const invitedNames = new Set(invited.map(g => g.guest_name.toLowerCase().trim()));
      const extra = seating.filter(s => {
        const name = s.guest_name?.toLowerCase().trim();
        return name && !invitedNames.has(name);
      });
      
      if (extra.length > 0) {
        console.log(`\n❌ Found ${extra.length} entries in seating_assignments not in invited_guests:`);
        extra.forEach(e => {
          console.log(`   - ${e.guest_name} (email: ${e.email || 'none'})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCounts();
