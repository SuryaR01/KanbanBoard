import pool from "@/lib/mysql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  
  if (!boardId) {
    return Response.json({ error: 'boardId is required' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY `order` ASC',
      [boardId]
    );
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { board_id, name, order } = body;
    const [result] = await pool.query(
      'INSERT INTO kanban_columns (board_id, name, `order`) VALUES (?, ?, ?)',
      [board_id, name, order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM kanban_columns WHERE id = ?', [result.insertId]);
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
