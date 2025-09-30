const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_qGUi6S1NEZar@ep-steep-sun-a5q75vzf-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function initializeDatabase() {
  console.log('🚀 Initializing Agent 47 database...');

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

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📊 Executing schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully');

    // Test basic functionality
    console.log('🧪 Testing database operations...');

    // Create a test conversation
    const conversationResult = await client.query(
      'INSERT INTO conversations (title) VALUES ($1) RETURNING id, created_at',
      ['Test Conversation']
    );

    const conversationId = conversationResult.rows[0].id;
    console.log(`✅ Created test conversation: ${conversationId}`);

    // Add a test message
    await client.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', 'Hello Agent 47!']
    );

    // Verify data
    const messageResult = await client.query(
      'SELECT * FROM messages WHERE conversation_id = $1',
      [conversationId]
    );

    console.log(`✅ Test message created: ${messageResult.rows[0].content}`);

    // Clean up test data
    await client.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
    console.log('🧹 Cleaned up test data');

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };