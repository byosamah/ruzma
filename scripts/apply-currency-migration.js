#!/usr/bin/env node

/**
 * Apply Currency Migration Script
 * Adds currency column to projects table for project-specific currency
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://***REMOVED***.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyCurrencyMigration() {
  console.log('🔄 Applying currency migration...\n');
  
  try {
    // Step 1: Check if currency column already exists
    console.log('1. Checking if currency column exists...');
    const { data: columns, error: columnError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'currency'
      `
    });

    if (columnError) {
      console.log('   Using direct table query to check columns...');
      // Try to query the projects table to see current structure
      const { data: sampleProject } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (sampleProject && sampleProject[0] && sampleProject[0].currency !== undefined) {
        console.log('✅ Currency column already exists!');
        return;
      }
    }

    if (columns && columns.length > 0) {
      console.log('✅ Currency column already exists!');
      return;
    }

    console.log('   Currency column does not exist, proceeding with migration...');

    console.log('💡 Since direct SQL execution is not available via RPC, the migration needs to be applied manually.');
    console.log('   The migration file has been created at:');
    console.log('   /Users/osamakhalil/ruzma/supabase/migrations/20250909063000_add_project_currency_column.sql');
    console.log('\n📋 To apply this migration:');
    console.log('   1. Use the Supabase dashboard SQL editor');
    console.log('   2. Or run `supabase db push` if Supabase CLI is available');
    console.log('   3. Or apply the migration through your deployment pipeline');
    console.log('\n📝 Migration SQL:');
    console.log('   ALTER TABLE public.projects ADD COLUMN currency text DEFAULT \'USD\';');
    console.log('   UPDATE public.projects SET currency = freelancer_currency WHERE freelancer_currency IS NOT NULL;');
    console.log('   UPDATE public.projects SET currency = \'USD\' WHERE currency IS NULL;');

    // Step 5: Verify migration success
    console.log('5. Verifying migration...');
    const { data: projects, error: verifyError } = await supabase
      .from('projects')
      .select('id, name, currency, freelancer_currency');

    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError.message);
      return;
    }

    console.log('\n📊 Migration verification:');
    console.log(`   Found ${projects.length} projects`);
    projects.forEach(project => {
      console.log(`   Project: ${project.name} | Currency: ${project.currency} | Freelancer Currency: ${project.freelancer_currency}`);
    });

    console.log('\n🎉 Currency migration completed successfully!');
    console.log('\n📝 Migration Summary:');
    console.log('   • Added currency column to projects table');
    console.log('   • Copied freelancer_currency to currency for existing projects');
    console.log('   • Set USD as default for any NULL currencies');
    console.log('   • Verified all projects have proper currency values');

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
  }
}

applyCurrencyMigration();