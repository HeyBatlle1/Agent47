const jwt = require('jsonwebtoken');
const { getDbClient } = require('./_shared/db-helper');

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  let dbClient;

  try {
    // Get user from token
    const userId = getUserFromToken(event.headers.authorization);

    const { filename, content, fileType, fileSize } = JSON.parse(event.body || '{}');

    if (!filename || !content || !fileType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Filename, content, and fileType are required' })
      };
    }

    // Validate file type
    const allowedTypes = ['pdf', 'txt', 'md', 'docx'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Invalid file type. Supported types: PDF, TXT, MD, DOCX',
          allowedTypes
        })
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize && fileSize > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'File too large. Maximum size: 10MB',
          maxSize
        })
      };
    }

    dbClient = await getDbClient();

    // Check if document with same name already exists for this user
    const existing = await dbClient.query(
      'SELECT id FROM documents WHERE user_id = $1 AND filename = $2',
      [userId, filename]
    );

    if (existing.rows.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'Document with this filename already exists' })
      };
    }

    // TODO: Generate vector embedding for semantic search
    // For now, we'll store without embedding and add it later
    const embedding = null;

    // Insert document
    const result = await dbClient.query(`
      INSERT INTO documents (user_id, filename, content, file_type, file_size, embedding)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, filename, file_type, file_size, uploaded_at
    `, [userId, filename, content, fileType.toLowerCase(), fileSize || content.length, embedding]);

    const document = result.rows[0];

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          filename: document.filename,
          fileType: document.file_type,
          fileSize: document.file_size,
          uploadedAt: document.uploaded_at
        }
      })
    };

  } catch (error) {
    console.error('Document upload error:', error);

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