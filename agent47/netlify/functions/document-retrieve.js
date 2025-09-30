const { Client } = require('pg');
const jwt = require('jsonwebtoken');

// Database connection helper
async function getDbClient() {
  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Database URL not found');
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

// Extract user ID from JWT token
function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
  return decoded.userId;
}

exports.handler = async (event, context) => {
  // Enable keep-alive for connection reuse
  context.callbackWaitsForEmptyEventLoop = false;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  let dbClient;

  try {
    // Get user from token
    const userId = getUserFromToken(event.headers.authorization);

    dbClient = await getDbClient();

    if (event.httpMethod === 'GET') {
      // List all documents for the user
      const result = await dbClient.query(`
        SELECT id, filename, file_type, file_size, uploaded_at,
               LEFT(content, 200) as preview
        FROM documents
        WHERE user_id = $1
        ORDER BY uploaded_at DESC
      `, [userId]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          documents: result.rows,
          count: result.rows.length
        })
      };

    } else if (event.httpMethod === 'POST') {
      // Search/retrieve specific document
      const { query, documentId } = JSON.parse(event.body || '{}');

      if (documentId) {
        // Get specific document by ID
        const result = await dbClient.query(
          'SELECT * FROM documents WHERE user_id = $1 AND id = $2',
          [userId, documentId]
        );

        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Document not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            document: result.rows[0]
          })
        };

      } else if (query) {
        // Search documents by filename or content
        const searchQuery = `%${query.toLowerCase()}%`;
        const result = await dbClient.query(`
          SELECT id, filename, file_type, file_size, uploaded_at,
                 LEFT(content, 500) as excerpt
          FROM documents
          WHERE user_id = $1
          AND (LOWER(filename) LIKE $2 OR LOWER(content) LIKE $2)
          ORDER BY
            CASE WHEN LOWER(filename) LIKE $2 THEN 1 ELSE 2 END,
            uploaded_at DESC
          LIMIT 10
        `, [userId, searchQuery]);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            documents: result.rows,
            query: query,
            count: result.rows.length
          })
        };

      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Query or documentId is required for search' })
        };
      }

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('Document retrieve error:', error);

    if (error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  } finally {
    if (dbClient) {
      try {
        await dbClient.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
};