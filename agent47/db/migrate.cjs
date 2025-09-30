const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_qGUi6S1NEZar@ep-steep-sun-a5q75vzf-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrateDatabase() {
  console.log('🚀 Migrating to Author\'s Studio schema...');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database successfully');

    // Check if we need to migrate
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'documents', 'bot_activity')
    `);

    if (tablesCheck.rows.length === 0) {
      console.log('📊 Creating new Author\'s Studio schema...');

      // Drop existing simple tables if they exist
      console.log('🧹 Cleaning up old schema...');
      await client.query('DROP TABLE IF EXISTS generated_images CASCADE');
      await client.query('DROP TABLE IF EXISTS user_preferences CASCADE');
      await client.query('DROP TABLE IF EXISTS messages CASCADE');
      await client.query('DROP TABLE IF EXISTS conversations CASCADE');

      // Create new schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      await client.query(schema);
      console.log('✅ New schema created successfully');
    } else {
      console.log('✅ Author\'s Studio schema already exists');
    }

    // Test the new schema
    console.log('🧪 Testing schema...');

    // Check table structure
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Available tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrateDatabase().catch(console.error);
}

module.exports = { migrateDatabase };