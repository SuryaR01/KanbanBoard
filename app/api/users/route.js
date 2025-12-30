import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, name, email, image FROM users ORDER BY name ASC'
      );
      return NextResponse.json({ users });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
