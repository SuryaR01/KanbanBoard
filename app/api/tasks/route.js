import pool from "@/lib/mysql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const columnId = searchParams.get('columnId');
  const boardId = searchParams.get('boardId');

  try {
    let query = 'SELECT * FROM tasks';
    let params = [];

    if (columnId) {
      query = 'SELECT * FROM tasks WHERE column_id = ? ORDER BY `order` ASC';
      params = [columnId];
    } else if (boardId) {
      query = `
        SELECT t.* FROM tasks t
        JOIN kanban_columns c ON t.column_id = c.id
        WHERE c.board_id = ?
        ORDER BY c.\`order\` ASC, t.\`order\` ASC
      `;
      params = [boardId];
    }

    const [rows] = await pool.query(query, params);
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { column_id, title, description, order, labels, due_date, subtasks, member_count, members } = body;
    const [result] = await pool.query(
      'INSERT INTO tasks (column_id, title, description, `order`, labels, due_date, subtasks, member_count, members) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        column_id, 
        title, 
        description || null, 
        order || 0, 
        labels || "[]", 
        (due_date && typeof due_date === 'string' && due_date.includes('T')) ? due_date.split('T')[0] : (due_date || null), 
        subtasks || "[]", 
        member_count || 0,
        members || "[]"
      ]
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
