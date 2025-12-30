const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Surya@2002',
    database: process.env.MYSQL_DATABASE || 'nextjs_db',
  });

  try {
    console.log('Connected to database.');

    // Check if column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'role'"
    );

    if (columns.length === 0) {
      console.log("Adding 'role' column to 'users' table...");
      await connection.query(
        "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'"
      );
      console.log("Column 'role' added successfully.");
      
      // Optional: Set a specific user as admin for testing if needed
      // await connection.query("UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com'");
    } else {
      console.log("'role' column already exists.");
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
