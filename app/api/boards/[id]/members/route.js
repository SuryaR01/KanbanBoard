import pool from "@/lib/mysql";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

export async function GET(request, { params }) {
    const { id } = await params; // boardId
    
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.image, u.email, bm.role
            FROM board_members bm
            JOIN users u ON bm.user_id = u.id
            WHERE bm.board_id = ?
        `, [id]);
        
        return Response.json(rows);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { id } = await params; // boardId
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check if user is already a member
        const [existing] = await pool.query(
            'SELECT * FROM board_members WHERE board_id = ? AND user_id = ?',
            [id, userId]
        );

        if (existing.length > 0) {
            return Response.json({ message: "User is already a member" });
        }

        // Add user to board
        await pool.query(
            'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
            [id, userId, 'member']
        );

        // Fetch the added user details to return
        const [newUser] = await pool.query(
            'SELECT id, name, image, email FROM users WHERE id = ?',
            [userId]
        );

        return Response.json({ ...newUser[0], role: 'member' });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params; // boardId
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

       

        await pool.query(
            'DELETE FROM board_members WHERE board_id = ? AND user_id = ?',
            [id, userId]
        );

        return Response.json({ message: "Member removed" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
