import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createKanbanTables() {
  const connectionConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Surya@2002',
  };

  const dbName = process.env.MYSQL_DATABASE || 'nextjs_konbon_db';
  
  const connection = await mysql.createConnection(connectionConfig);
  
  try {
    console.log('--- Starting Kanban Database Migration ---');

    // 0. Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database ${dbName} ensured`);
    
    await connection.query(`USE \`${dbName}\``);

    // 1. Create boards table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Boards table created');

    // 2. Create kanban_columns table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS kanban_columns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        board_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        \`order\` INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Columns table created');

    // 3. Create tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        column_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        \`order\` INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tasks table created');

    // 4. Seed default board and columns if empty
    const [boards] = await connection.query('SELECT id FROM boards LIMIT 1');
    if (boards.length === 0) {
      const [boardResult] = await connection.query('INSERT INTO boards (name) VALUES (?)', ['Main Board']);
      const boardId = boardResult.insertId;
      console.log('🌱 Seeded default board');

      const defaultColumns = ['TO DO', 'IN PROGRESS', 'DONE', 'APPROVED'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await connection.query(
          'INSERT INTO kanban_columns (board_id, name, \`order\`) VALUES (?, ?, ?)',
          [boardId, defaultColumns[i], i]
        );
      }
      console.log('🌱 Seeded default columns');
    }

    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createKanbanTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
