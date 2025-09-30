const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDbClient } = require('./_shared/db-helper');

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

    const { prompt, conversationId } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image prompt is required' })
      };
    }

    console.log('Processing image generation request:', { promptLength: prompt.length, conversationId });

    // Connect to database
    dbClient = await getDbClient();

    // Generate image with Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
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
            }
          ]
        }
      ]
    });

    // Create image generation prompt
    const imagePrompt = `Generate a detailed, high-quality image based on this description: ${prompt}`;

    const result = await model.generateContent(imagePrompt);
    const response = await result.response;

    // Extract image data (this is a placeholder - actual implementation would depend on Gemini's image generation API)
    let imageData = null;
    const candidates = response.candidates;

    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    // Save generated image to database
    const imageResult = await dbClient.query(
      'INSERT INTO generated_images (conversation_id, prompt, image_data) VALUES ($1, $2, $3) RETURNING id',
      [conversationId, prompt, imageData]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageId: imageResult.rows[0].id,
        imageData: imageData,
        prompt: prompt,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Image generation function error:', error);

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