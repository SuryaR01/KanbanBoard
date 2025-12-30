const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listUsers() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Surya@2002',
    database: process.env.MYSQL_DATABASE || 'nextjs_db',
  });

  try {
    const [rows] = await connection.query("SELECT id, name, email, role FROM users");
    console.log("Current Users:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

listUsers();
