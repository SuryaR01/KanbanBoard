import pool from '../lib/mysql.js';

async function updateUsersTable() {
  const connection = await pool.getConnection();
  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (columns.length === 0) {
      console.log("Adding 'role' column...");
      await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
      console.log("✅ Column 'role' added");
    } else {
      console.log("✅ Column 'role' already exists");
    }
  } catch (error) {
    console.error("❌ Failed to update users table:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

updateUsersTable();
