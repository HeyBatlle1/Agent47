const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDbClient } = require('./_shared/db-helper');

exports.handler = async (event, context) => {
  // Enable keep-alive for connection reuse
  context.callbackWaitsForEmptyEventLoop = false;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    dbClient = await getDbClient();

    if (event.httpMethod === 'GET') {
      // Check current user count
      const result = await dbClient.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
      const userCount = parseInt(result.rows[0].count);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          userCount,
          maxUsers: 10,
          signupEnabled: userCount < 10
        })
      };

    } else if (event.httpMethod === 'POST') {
      // User registration
      const { email, password } = JSON.parse(event.body || '{}');

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Email and password are required' })
        };
      }

      // Check if user already exists
      const existingUser = await dbClient.query('SELECT id FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: 'User already exists' })
        };
      }

      // Check user limit (this will trigger the database constraint)
      const userCount = await dbClient.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');

      if (parseInt(userCount.rows[0].count) >= 10) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'User limit reached. Maximum 10 users allowed for MVP.' })
        };
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await dbClient.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
      );

      const user = newUser.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret-change-in-production',
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'User created successfully',
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.created_at
          },
          token
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('Auth signup error:', error);

    if (error.message.includes('User limit reached')) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: error.message })
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