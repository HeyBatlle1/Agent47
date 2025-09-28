#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// NeonDB configuration
const neonDbUrl = 'postgresql://neondb_owner:npg_N8SU2rbhfViZ@ep-solitary-dawn-aedihqsd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function importData() {
  const client = new Client({ connectionString: neonDbUrl });

  try {
    await client.connect();
    console.log('🔗 Connected to NeonDB');

    const exportDir = path.join(__dirname, 'supabase-export');

    // 1. Import Companies
    console.log('📊 Importing companies...');
    const companies = JSON.parse(fs.readFileSync(path.join(exportDir, 'companies.json'), 'utf8'));

    for (const company of companies) {
      const query = `
        INSERT INTO tos_analysis_companies (
          id, name, domain, industry, headquarters, founded_year,
          employee_count_range, revenue_range, stock_symbol, business_model,
          primary_services, tos_url, privacy_policy_url, data_policy_url,
          community_guidelines_url, corporate_website, last_scraped_at,
          last_analyzed_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          industry = EXCLUDED.industry,
          headquarters = EXCLUDED.headquarters,
          updated_at = EXCLUDED.updated_at
      `;

      await client.query(query, [
        company.id, company.name, company.domain, company.industry,
        company.headquarters, company.founded_year, company.employee_count_range,
        company.revenue_range, company.stock_symbol, company.business_model,
        company.primary_services, company.tos_url, company.privacy_policy_url,
        company.data_policy_url, company.community_guidelines_url,
        company.corporate_website, company.last_scraped_at, company.last_analyzed_at,
        company.created_at, company.updated_at
      ]);
    }
    console.log(`✅ Imported ${companies.length} companies`);

    // 2. Import Documents
    console.log('📄 Importing documents...');
    const documents = JSON.parse(fs.readFileSync(path.join(exportDir, 'documents.json'), 'utf8'));

    for (const doc of documents) {
      const query = `
        INSERT INTO tos_analysis_documents (
          id, company_id, document_type, title, url, raw_content,
          cleaned_content, content_hash, scraped_at, http_status,
          content_length, content_type, last_modified_header, etag,
          is_analyzed, analysis_version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          raw_content = EXCLUDED.raw_content,
          cleaned_content = EXCLUDED.cleaned_content,
          updated_at = EXCLUDED.updated_at
      `;

      await client.query(query, [
        doc.id, doc.company_id, doc.document_type, doc.title, doc.url,
        doc.raw_content, doc.cleaned_content, doc.content_hash, doc.scraped_at,
        doc.http_status, doc.content_length, doc.content_type,
        doc.last_modified_header, doc.etag, doc.is_analyzed,
        doc.analysis_version, doc.created_at, doc.updated_at
      ]);
    }
    console.log(`✅ Imported ${documents.length} documents`);

    // 3. Import Analysis Results
    console.log('🧠 Importing analysis results...');
    const results = JSON.parse(fs.readFileSync(path.join(exportDir, 'analysis_results.json'), 'utf8'));

    for (const result of results) {
      const query = `
        INSERT INTO tos_analysis_results (
          id, document_id, company_id, transparency_score, user_friendliness_score,
          privacy_score, manipulation_risk_score, data_collection_risk,
          data_sharing_risk, account_termination_risk, legal_jurisdiction_risk,
          concerning_clauses, manipulation_tactics, user_rights_analysis,
          data_retention_analysis, third_party_sharing, gdpr_compliance_status,
          ccpa_compliance_status, coppa_compliance_status, regulatory_notes,
          ai_model_used, analysis_version, analyzed_at, analysis_duration_ms,
          executive_summary, key_concerns, recommendations, red_flags,
          summary, full_analysis, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
        ON CONFLICT (id) DO UPDATE SET
          transparency_score = EXCLUDED.transparency_score,
          privacy_score = EXCLUDED.privacy_score,
          full_analysis = EXCLUDED.full_analysis
      `;

      await client.query(query, [
        result.id, result.document_id, result.company_id, result.transparency_score,
        result.user_friendliness_score, result.privacy_score, result.manipulation_risk_score,
        result.data_collection_risk, result.data_sharing_risk, result.account_termination_risk,
        result.legal_jurisdiction_risk, JSON.stringify(result.concerning_clauses),
        JSON.stringify(result.manipulation_tactics), JSON.stringify(result.user_rights_analysis),
        JSON.stringify(result.data_retention_analysis), JSON.stringify(result.third_party_sharing),
        result.gdpr_compliance_status, result.ccpa_compliance_status, result.coppa_compliance_status,
        result.regulatory_notes, result.ai_model_used, result.analysis_version,
        result.analyzed_at, result.analysis_duration_ms, result.executive_summary,
        result.key_concerns, result.recommendations, JSON.stringify(result.red_flags),
        result.summary, result.full_analysis, result.created_at
      ]);
    }
    console.log(`✅ Imported ${results.length} analysis results`);

    // Summary
    console.log('\n📋 Import Summary:');
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Documents: ${documents.length}`);
    console.log(`- Analysis Results: ${results.length}`);
    console.log('\n✅ All data imported to NeonDB successfully!');

    return {
      companies: companies.length,
      documents: documents.length,
      results: results.length
    };

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run import
importData()
  .then(counts => {
    console.log('🎉 Import completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });