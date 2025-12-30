import pool from "@/lib/mysql";

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: 'Column ID is required' }, { status: 400 });
  }

  try {
    // Check if column exists
    const [existing] = await pool.query('SELECT * FROM kanban_columns WHERE id = ?', [id]);
    if (existing.length === 0) {
      return Response.json({ error: 'Column not found' }, { status: 404 });
    }

    // Delete tasks associated with this column
    await pool.query('DELETE FROM tasks WHERE column_id = ?', [id]);

    // Delete the column
    await pool.query('DELETE FROM kanban_columns WHERE id = ?', [id]);

    return Response.json({ message: 'Column deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, order } = body;
        
        let query = 'UPDATE kanban_columns SET ';
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (order !== undefined) {
            updates.push('`order` = ?');
            values.push(order);
        }

        if (updates.length === 0) {
            return Response.json({ error: 'No fields to update' }, { status: 400 });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        values.push(id);

        await pool.query(query, values);
        
        const [rows] = await pool.query('SELECT * FROM kanban_columns WHERE id = ?', [id]);
        return Response.json(rows[0]);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
