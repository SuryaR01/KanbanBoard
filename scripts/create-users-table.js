import pool from '../lib/mysql.js';

/**
 * Create users table if it doesn't exist
 */
async function createUsersTable() {
  const connection = await pool.getConnection();
  
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        image VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        provider VARCHAR(50) DEFAULT 'credentials',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.query(createTableQuery);
    console.log('✅ Users table created or already exists');
    
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the table creation
createUsersTable()
  .then(() => {
    console.log('Database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
