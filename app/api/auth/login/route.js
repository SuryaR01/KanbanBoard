import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { comparePassword, generateToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.query(
        'SELECT id, name, email, password, image, provider FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = users[0];

      // Check if user registered with credentials
      if (user.provider !== 'credentials' || !user.password) {
        return NextResponse.json(
          { error: 'Please use OAuth login for this account' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Return user data and token
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
