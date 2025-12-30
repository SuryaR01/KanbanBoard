import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createBoardMembersTable() {
  const connectionConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Surya@2002',
    database: process.env.MYSQL_DATABASE || 'nextjs_konbon_db',
  };

  const connection = await mysql.createConnection(connectionConfig);

  try {
    console.log('--- Creating board_members table ---');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS board_members (
        board_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (board_id, user_id),
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ board_members table created');

    // Make existing boards accessible to all users (temporary migration path)
    // Or maybe just link them to the first admin?
    // For now, let's just create the table. The user can create new boards.
    // If we want detailed migration, we'd need to know who created what. Since we didn't track it, we can't backfill accurately.
    // I'll leave existing boards successfully "orphaned" or public if I don't filter them out?
    // No, if I add the filter, existing boards will disappear for everyone.
    // I should probably link all existing boards to the first user found, or just leave them be (hidden).
    // Let's check if there are users in the DB.
    
    const [users] = await connection.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    if (users.length > 0) {
        const userId = users[0].id;
        const [boards] = await connection.query('SELECT id FROM boards');
        for (const board of boards) {
             try {
                await connection.query('INSERT IGNORE INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)', [board.id, userId, 'owner']);
                console.log(`🔗 Linked board ${board.id} to user ${userId}`);
             } catch (e) {
                 console.log(`Failed to link board ${board.id}: ${e.message}`);
             }
        }
    }

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createBoardMembersTable();
