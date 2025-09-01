#!/usr/bin/env node

/**
 * Direct Supabase Schema Query
 * Uses PostgreSQL system catalogs to analyze the database
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://***REMOVED***.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function queryDatabase() {
  console.log('🔍 Querying Ruzma Database Schema...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tables: {},
    sample_data: {},
    storage: {},
    auth_users_count: 0
  };

  try {
    // 1. Query known tables directly
    const knownTables = [
      'profiles', 'projects', 'milestones', 'clients', 
      'invoices', 'invoice_items', 'project_templates',
      'freelancer_branding', 'notifications', 'activity_logs',
      'client_project_tokens', 'user_plan_limits'
    ];

    console.log('📊 Checking tables and getting sample data...');
    
    for (const tableName of knownTables) {
      try {
        // Get row count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`  ✅ ${tableName}: ${count || 0} rows`);
          results.tables[tableName] = { 
            exists: true, 
            row_count: count || 0 
          };

          // Get sample data (first few rows)
          if (count && count > 0) {
            const { data: sampleData } = await supabase
              .from(tableName)
              .select('*')
              .limit(3);
            
            results.sample_data[tableName] = sampleData || [];
          }
        } else {
          console.log(`  ❌ ${tableName}: Table doesn't exist or no access`);
          results.tables[tableName] = { 
            exists: false, 
            error: countError.message 
          };
        }
      } catch (error) {
        console.log(`  ⚠️  ${tableName}: ${error.message}`);
        results.tables[tableName] = { 
          exists: false, 
          error: error.message 
        };
      }
    }

    // 2. Check auth.users count (if accessible)
    console.log('\n👥 Checking auth users...');
    try {
      const { count: authCount } = await supabase.auth.admin.listUsers();
      results.auth_users_count = authCount || 0;
      console.log(`  📊 Total users: ${results.auth_users_count}`);
    } catch (error) {
      console.log(`  ⚠️  Could not access auth.users: ${error.message}`);
    }

    // 3. Check storage buckets
    console.log('\n🗂️  Checking storage buckets...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError && buckets) {
        for (const bucket of buckets) {
          console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
          
          // Try to list files in bucket
          const { data: files, error: filesError } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 10 });
          
          results.storage[bucket.name] = {
            id: bucket.id,
            name: bucket.name,
            public: bucket.public,
            file_count: files?.length || 0,
            sample_files: files?.slice(0, 3) || [],
            created_at: bucket.created_at,
            updated_at: bucket.updated_at,
            error: filesError?.message
          };
          
          console.log(`     → ${files?.length || 0} files found`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not access storage: ${error.message}`);
    }

    // 4. Test some specific queries to understand data relationships
    console.log('\n🔗 Analyzing data relationships...');
    
    try {
      // Get a sample project with related data
      const { data: projectSample } = await supabase
        .from('projects')
        .select(`
          id, name, status, user_id, client_id,
          milestones!inner(id, title, status, price),
          clients(id, name, email)
        `)
        .limit(1)
        .single();
      
      if (projectSample) {
        console.log('  ✅ Project relationships working');
        results.sample_relationships = {
          project_with_milestones: !!projectSample.milestones?.length,
          project_with_client: !!projectSample.clients,
          milestone_count: projectSample.milestones?.length || 0
        };
      }
    } catch (error) {
      console.log(`  ⚠️  Relationship query failed: ${error.message}`);
    }

    // 5. Generate summary
    const existingTables = Object.entries(results.tables)
      .filter(([, table]) => table.exists)
      .length;
    
    const totalRows = Object.values(results.tables)
      .filter(table => table.exists)
      .reduce((sum, table) => sum + (table.row_count || 0), 0);

    results.summary = {
      existing_tables: existingTables,
      total_application_rows: totalRows,
      storage_buckets: Object.keys(results.storage).length,
      analysis_timestamp: new Date().toISOString()
    };

    // Save results
    const outputPath = join(__dirname, '..', 'ruzma_understanding', 'live_schema_analysis.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log('\n✅ Schema analysis complete!');
    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('\n📊 Summary:');
    console.log(`   • ${existingTables} tables accessible`);
    console.log(`   • ${totalRows} total application rows`);
    console.log(`   • ${Object.keys(results.storage).length} storage buckets`);
    console.log(`   • ${results.auth_users_count} registered users`);

    return results;

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Execute analysis
queryDatabase()
  .then(() => {
    console.log('\n🎉 Database analysis completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });