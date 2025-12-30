const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const emailArg = process.argv[2];

async function makeAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Surya@2002',
    database: process.env.MYSQL_DATABASE || 'nextjs_db',
  });

  try {
    let emailToPromote = emailArg;

    if (!emailToPromote) {
        console.log("No email provided. Fetching the first user...");
        const [users] = await connection.query("SELECT email FROM users LIMIT 1");
        if (users.length > 0) {
            emailToPromote = users[0].email;
            console.log(`Found user: ${emailToPromote}`);
        } else {
            console.error("No users found in database. Please register a user first.");
            process.exit(1);
        }
    }

    const [result] = await connection.query(
      "UPDATE users SET role = 'admin' WHERE email = ?",
      [emailToPromote]
    );

    if (result.affectedRows > 0) {
      console.log(`SUCCESS: User '${emailToPromote}' is now an ADMIN.`);
    } else {
      console.log(`User '${emailToPromote}' not found.`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

makeAdmin();
