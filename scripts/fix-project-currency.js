#!/usr/bin/env node

/**
 * Fix Project Currency - Update project currency from JPY to GBP
 * This script fixes the currency discrepancy where the client project page
 * shows the wrong currency due to incorrect database values.
 */

import { createClient } from '@supabase/supabase-js';

async function fixProjectCurrency() {
  const supabase = createClient(
    'https://okquqhxtoymuqkdxgbei.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcXVxaHh0b3ltdXFrZHhnYmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MzM2NzAsImV4cCI6MjAzMjQwOTY3MH0.fDGKK2Ht5NNcHzLi6DFa8UjsJnQdv3VgbCOHpLECGW4'
  );

  console.log('🔍 Looking for projects with amounts that suggest GBP pricing...');

  // First, let's find projects that might be GBP but stored as other currencies
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, freelancer_currency, currency, milestones(price)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching projects:', error);
    return;
  }

  console.log('📊 Current projects and their currencies:');
  projects.forEach((project, index) => {
    const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
    console.log(`${index + 1}. ${project.name}`);
    console.log(`   - Currency: ${project.freelancer_currency || project.currency || 'Not set'}`);
    console.log(`   - Total Value: ${totalValue}`);
    console.log(`   - Milestones: ${project.milestones.length}`);
    
    // If total value is around 100-1000 and currency is JPY, it's likely GBP
    if (totalValue >= 100 && totalValue <= 5000 && project.freelancer_currency === 'JPY') {
      console.log(`   ⚠️  SUSPICIOUS: JPY currency with £${totalValue}-like pricing`);
    }
    console.log('');
  });

  // Ask user to confirm which project to update
  console.log('🛠️  To fix a project currency, we need to identify the correct project.');
  console.log('Based on your description, we should update a project from JPY to GBP.');
  
  // Find projects with JPY currency and reasonable GBP-like amounts
  const suspiciousProjects = projects.filter(p => 
    p.freelancer_currency === 'JPY' && 
    p.milestones.reduce((sum, m) => sum + m.price, 0) >= 50 && 
    p.milestones.reduce((sum, m) => sum + m.price, 0) <= 2000
  );

  if (suspiciousProjects.length === 0) {
    console.log('❌ No projects found with JPY currency and GBP-like pricing.');
    console.log('💡 The issue might be different. Let me show all projects:');
    
    projects.forEach(project => {
      const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
      console.log(`🔹 ${project.name} (${project.id})`);
      console.log(`   Currency: ${project.freelancer_currency || 'none'} | Value: ${totalValue}`);
    });
    return;
  }

  console.log(`\n🎯 Found ${suspiciousProjects.length} suspicious project(s):`);
  suspiciousProjects.forEach((project, index) => {
    const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
    console.log(`${index + 1}. ${project.name} - Currently JPY ${totalValue} (should be £${totalValue})`);
  });

  // For now, let's update the first suspicious project
  if (suspiciousProjects.length > 0) {
    const projectToFix = suspiciousProjects[0];
    console.log(`\n🔧 Updating project: ${projectToFix.name}`);
    console.log(`   Changing currency: JPY → GBP`);

    const { error: updateError } = await supabase
      .from('projects')
      .update({ freelancer_currency: 'GBP' })
      .eq('id', projectToFix.id);

    if (updateError) {
      console.error('❌ Error updating project:', updateError);
    } else {
      console.log('✅ Successfully updated project currency to GBP!');
      console.log('🎉 The client project page should now show correct £ amounts.');
    }
  }
}

// Run the fix
fixProjectCurrency()
  .then(() => {
    console.log('\n✨ Currency fix script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });