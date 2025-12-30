import pool from "@/lib/mysql";

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    console.log("PATCH Task Request Body:", body);
    
    // Ensure id is treated as an integer for the query
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
        return Response.json({ error: 'Invalid Task ID' }, { status: 400 });
    }

    const fields = [];
    const values = [];
    const { title, description, column_id, order, labels, due_date, subtasks, member_count, members } = body;
    
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (column_id !== undefined && column_id !== null) { 
        const val = parseInt(column_id);
        if (!isNaN(val)) {
            fields.push('column_id = ?'); 
            values.push(val); 
        }
    }
    if (order !== undefined && order !== null) { 
        const val = parseInt(order);
        if (!isNaN(val)) {
            fields.push('`order` = ?'); 
            values.push(val); 
        }
    }
    if (labels !== undefined) { fields.push('labels = ?'); values.push(labels || "[]"); }
    if (due_date !== undefined) { 
        fields.push('due_date = ?'); 
        let dateValue = due_date || null;
        if (dateValue && typeof dateValue === 'string' && dateValue.includes('T')) {
            dateValue = dateValue.split('T')[0];
        }
        values.push(dateValue); 
    }
    if (subtasks !== undefined) { fields.push('subtasks = ?'); values.push(subtasks || "[]"); }
    
    if (members !== undefined) { 
        const membersData = members || "[]";
        fields.push('members = ?'); 
        values.push(membersData); 
        
        let count = 0;
        try {
            const parsed = JSON.parse(membersData);
            count = Array.isArray(parsed) ? parsed.length : 0;
        } catch (e) {
            console.error("Failed to parse members for count in PATCH:", e);
        }
        fields.push('member_count = ?');
        values.push(count);
    } else if (member_count !== undefined && member_count !== null) { 
        const val = parseInt(member_count);
        if (!isNaN(val)) {
            fields.push('member_count = ?'); 
            values.push(val); 
        }
    }
    
    if (fields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    values.push(taskId);
    
    console.log("Executing SQL Query:", query);
    console.log("With Values:", values);

    await pool.query(query, values);
    
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) {
        return Response.json({ error: 'Task not found after update' }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (error) {
    console.error("PATCH Task Full Error:", error);
    return Response.json({ 
        error: error.message, 
        sqlMessage: error.sqlMessage,
        code: error.code 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return Response.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
