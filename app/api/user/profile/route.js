import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Fetch user data from database
      const [users] = await connection.query(
        'SELECT id, name, email, image, provider, created_at FROM users WHERE email = ?',
        [session.user.email]
      );

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = users[0];

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: user.provider,
            createdAt: user.created_at,
          },
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
