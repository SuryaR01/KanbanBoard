import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { hashPassword } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if user already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert new user
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, provider) VALUES (?, ?, ?, ?)',
        [name || email.split('@')[0], email, hashedPassword, 'credentials']
      );

      return NextResponse.json(
        {
          success: true,
          message: 'User registered successfully',
          user: {
            id: result.insertId,
            name: name || email.split('@')[0],
            email,
          },
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
