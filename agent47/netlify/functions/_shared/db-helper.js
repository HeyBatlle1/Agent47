const { Client } = require('pg');

// Standardized database connection helper for all functions
async function getDbClient() {
  // Priority order: NEON_DATABASE_URL (primary) -> DATABASE_URL (fallback)
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Database URL not found. Please set NEON_DATABASE_URL environment variable.');
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000,
    query_timeout: 30000,
    statement_timeout: 30000
  });

  await client.connect();
  return client;
}

module.exports = { getDbClient };