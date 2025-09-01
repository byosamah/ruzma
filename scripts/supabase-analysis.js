#!/usr/bin/env node

/**
 * Supabase Live Database Analysis Script
 * Connects to Ruzma's Supabase instance and analyzes the real-time schema
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://***REMOVED***.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function analyzeDatabase() {
  console.log('🔍 Analyzing Ruzma Supabase Database...\n');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    tables: {},
    storage: {},
    policies: {},
    functions: {},
    statistics: {}
  };

  try {
    // 1. Get all table information
    console.log('📊 Analyzing table structures...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }

    // 2. For each table, get columns and constraints
    for (const table of tables) {
      console.log(`  → Analyzing ${table.table_name}...`);
      
      // Get columns
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');

      // Get row count (sample)
      const { count } = await supabase
        .from(table.table_name)
        .select('*', { count: 'exact', head: true });

      analysis.tables[table.table_name] = {
        type: table.table_type,
        columns: columns || [],
        row_count: count,
      };
    }

    // 3. Get storage buckets
    console.log('🗂️  Analyzing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (!bucketsError && buckets) {
      for (const bucket of buckets) {
        const { data: files, error } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 100 });
        
        analysis.storage[bucket.name] = {
          id: bucket.id,
          name: bucket.name,
          public: bucket.public,
          file_count: files?.length || 0,
          created_at: bucket.created_at,
          updated_at: bucket.updated_at
        };
      }
    }

    // 4. Get RLS policies (using service role)
    console.log('🔒 Analyzing RLS policies...');
    try {
      const { data: policies } = await supabase
        .rpc('get_table_policies', {});
      
      analysis.policies = policies || {};
    } catch (error) {
      console.log('   Note: Could not fetch RLS policies (requires custom function)');
      analysis.policies = { note: 'RLS policies require custom function to query' };
    }

    // 5. Get database functions
    console.log('⚙️  Analyzing database functions...');
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, data_type')
      .eq('routine_schema', 'public');

    analysis.functions = functions || [];

    // 6. Generate statistics
    console.log('📈 Generating statistics...');
    const totalTables = Object.keys(analysis.tables).length;
    const totalRows = Object.values(analysis.tables).reduce((sum, table) => sum + (table.row_count || 0), 0);
    const totalBuckets = Object.keys(analysis.storage).length;

    analysis.statistics = {
      total_tables: totalTables,
      total_rows: totalRows,
      total_storage_buckets: totalBuckets,
      largest_table: Object.entries(analysis.tables)
        .sort(([,a], [,b]) => (b.row_count || 0) - (a.row_count || 0))[0]?.[0],
      analysis_date: new Date().toISOString()
    };

    // 7. Save analysis to file
    const outputPath = join(__dirname, '..', 'ruzma_understanding', 'live_database_analysis.json');
    writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    
    console.log('\n✅ Database analysis complete!');
    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('\n📊 Summary:');
    console.log(`   • ${totalTables} tables`);
    console.log(`   • ${totalRows} total rows`);
    console.log(`   • ${totalBuckets} storage buckets`);
    console.log(`   • Largest table: ${analysis.statistics.largest_table}`);

    return analysis;

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Execute analysis
analyzeDatabase()
  .then(() => {
    console.log('\n🎉 Analysis completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });