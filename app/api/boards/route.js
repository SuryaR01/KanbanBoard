import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;
    const [result] = await pool.query('INSERT INTO boards (name) VALUES (?)', [name]);
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [result.insertId]);
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
