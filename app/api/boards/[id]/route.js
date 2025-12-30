import pool from "@/lib/mysql";

export async function DELETE(request, { params }) {
    const { id } = await params;
    if (!id) {
        return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        // Delete tasks associated with the board first (via columns)
        await pool.query(`
            DELETE t FROM tasks t
            JOIN kanban_columns c ON t.column_id = c.id
            WHERE c.board_id = ?
        `, [id]);

        // Delete columns associated with the board
        await pool.query('DELETE FROM kanban_columns WHERE board_id = ?', [id]);

        // Finally, delete the board
        const [result] = await pool.query('DELETE FROM boards WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return Response.json({ error: 'Board not found' }, { status: 404 });
        }

        return Response.json({ message: 'Board deleted successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
