#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://fbjjqwfcmzrpmytieajp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiampxd2ZjbXpycG15dGllYWpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ5MTg5NCwiZXhwIjoyMDUxMDY3ODk0fQ.o8tm3DIAvLSN4Hcuh33nw54yyNChBLmMqpSPX6vsMis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  try {
    console.log('🔍 Starting ToS Salad data export from Supabase...');

    // Create export directory
    const exportDir = path.join(__dirname, 'supabase-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // 1. Export Companies
    console.log('📊 Exporting companies data...');
    const { data: companies, error: companiesError } = await supabase
      .from('tos_analysis_companies')
      .select('*')
      .order('created_at');

    if (companiesError) throw companiesError;

    fs.writeFileSync(
      path.join(exportDir, 'companies.json'),
      JSON.stringify(companies, null, 2)
    );
    console.log(`✅ Exported ${companies.length} companies`);

    // 2. Export Documents
    console.log('📄 Exporting documents data...');
    const { data: documents, error: documentsError } = await supabase
      .from('tos_analysis_documents')
      .select('*')
      .order('created_at');

    if (documentsError) throw documentsError;

    fs.writeFileSync(
      path.join(exportDir, 'documents.json'),
      JSON.stringify(documents, null, 2)
    );
    console.log(`✅ Exported ${documents.length} documents`);

    // 3. Export Analysis Results
    console.log('🧠 Exporting analysis results...');
    const { data: results, error: resultsError } = await supabase
      .from('tos_analysis_results')
      .select('*')
      .order('created_at');

    if (resultsError) throw resultsError;

    fs.writeFileSync(
      path.join(exportDir, 'analysis_results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log(`✅ Exported ${results.length} analysis results`);

    // 4. Export Bookmarks (optional - may not exist)
    console.log('🔖 Checking for bookmarks...');
    let bookmarks = [];
    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at');

    if (bookmarksError && bookmarksError.code === '42P01') {
      console.log('ℹ️  Bookmarks table does not exist - skipping');
      bookmarks = [];
    } else if (bookmarksError) {
      throw bookmarksError;
    } else {
      bookmarks = bookmarksData || [];
    }

    fs.writeFileSync(
      path.join(exportDir, 'bookmarks.json'),
      JSON.stringify(bookmarks, null, 2)
    );
    console.log(`✅ Exported ${bookmarks.length} bookmarks`);

    // Summary
    console.log('\n📋 Export Summary:');
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Documents: ${documents.length}`);
    console.log(`- Analysis Results: ${results.length}`);
    console.log(`- Bookmarks: ${bookmarks.length}`);
    console.log(`\n✅ All data exported to: ${exportDir}`);

    return {
      companies: companies.length,
      documents: documents.length,
      results: results.length,
      bookmarks: bookmarks.length
    };

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// Run export
exportData()
  .then(counts => {
    console.log('🎉 Export completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Export failed:', error);
    process.exit(1);
  });