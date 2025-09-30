const { getDbClient } = require('./_shared/db-helper');

exports.handler = async (event, context) => {
  // Enable keep-alive for connection reuse
  context.callbackWaitsForEmptyEventLoop = false;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    dbClient = await getDbClient();

    if (event.httpMethod === 'GET') {
      // Get all conversations with message counts
      const result = await dbClient.query(`
        SELECT
          c.id,
          c.title,
          c.created_at,
          c.updated_at,
          COUNT(m.id) as message_count,
          COALESCE(
            (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC LIMIT 1),
            'New Conversation'
          ) as first_message
        FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id
        GROUP BY c.id, c.title, c.created_at, c.updated_at
        ORDER BY c.updated_at DESC
        LIMIT 50
      `);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          conversations: result.rows,
          timestamp: new Date().toISOString()
        })
      };

    } else if (event.httpMethod === 'POST') {
      // Create new conversation
      const { title = 'New Conversation' } = JSON.parse(event.body || '{}');

      const result = await dbClient.query(
        'INSERT INTO conversations (title) VALUES ($1) RETURNING *',
        [title]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          conversation: result.rows[0],
          timestamp: new Date().toISOString()
        })
      };

    } else if (event.httpMethod === 'DELETE') {
      // Delete conversation
      const conversationId = event.path.split('/').pop();

      if (!conversationId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Conversation ID is required' })
        };
      }

      await dbClient.query('DELETE FROM conversations WHERE id = $1', [conversationId]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Conversation deleted successfully',
          timestamp: new Date().toISOString()
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('Conversations function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
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