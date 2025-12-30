import pool from "@/lib/mysql";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchTerm = `%${session.user.name}%`;
    const [rows] = await pool.query(`
      SELECT DISTINCT b.* 
      FROM boards b
      LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = ?
      LEFT JOIN kanban_columns c ON b.id = c.board_id
      LEFT JOIN tasks t ON c.id = t.column_id
      WHERE 
        bm.role = 'owner' 
        OR 
        t.members LIKE ?
      ORDER BY b.created_at DESC
    `, [session.user.id, searchTerm]);
    
    return Response.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query('INSERT INTO boards (name) VALUES (?)', [name]);
      const boardId = result.insertId;

      await connection.query(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
        [boardId, session.user.id, 'owner']
      );

      await connection.commit();

      const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [boardId]);
      return Response.json(rows[0]);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
