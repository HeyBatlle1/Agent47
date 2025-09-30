const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Client } = require('pg');

// Database connection helper
async function getDbClient() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL environment variable is required');
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

exports.handler = async (event, context) => {
  // Enable keep-alive for connection reuse
  context.callbackWaitsForEmptyEventLoop = false;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let dbClient;

  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'GOOGLE_GENAI_API_KEY environment variable is required'
        })
      };
    }

    const { message, conversationId } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    console.log('Processing chat request:', { messageLength: message.length, conversationId });

    // Connect to database
    dbClient = await getDbClient();

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversation = await dbClient.query(
        'INSERT INTO conversations (title) VALUES ($1) RETURNING id',
        ['New Conversation']
      );
      currentConversationId = newConversation.rows[0].id;
    }

    // Get conversation history for context
    const historyResult = await dbClient.query(
      'SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 20',
      [currentConversationId]
    );

    // Save user message
    await dbClient.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [currentConversationId, 'user', message]
    );

    // Generate AI response with bot-specific model
    const genAI = new GoogleGenerativeAI(apiKey);

    // Bot 1 uses image preview model, others use standard flash
    const modelName = botNumber === 1 ? "gemini-2.5-flash-image-preview" : "gemini-2.5-flash";

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 1.1,
        topP: 0.9,
      },
      tools: [
        // Google Search grounding
        { googleSearchRetrieval: {} },
        // Function declarations for document retrieval and cross-bot awareness
        {
          functionDeclarations: [
            {
              name: 'retrieve_document',
              description: 'Retrieves uploaded document content by filename or semantic search',
              parameters: {
                type: 'OBJECT',
                properties: {
                  query: {
                    type: 'STRING',
                    description: 'Search query or exact filename'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'check_other_bots',
              description: 'Check what other bots are currently discussing',
              parameters: {
                type: 'OBJECT',
                properties: {
                  bot_number: {
                    type: 'NUMBER',
                    description: 'Which bot to check (1-4)'
                  }
                },
                required: ['bot_number']
              }
            }
          ]
        }
      ]
    });

    // Build conversation context
    let prompt = message;
    if (historyResult.rows.length > 0) {
      const context = historyResult.rows
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      prompt = `Previous conversation:\n${context}\n\nUser: ${message}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save AI response
    await dbClient.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [currentConversationId, 'assistant', text]
    );

    // Update conversation timestamp
    await dbClient.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [currentConversationId]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: text,
        conversationId: currentConversationId,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Chat function error:', error);

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