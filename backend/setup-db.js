const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create a connection to MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '8125754668', // Use your actual MySQL password
  multipleStatements: true // Allow multiple statements in a single query
});

// Read the SQL file
const sqlFile = path.join(__dirname, 'setup-db.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Execute the SQL file
connection.query(sql, (err, results) => {
  if (err) {
    console.error('Error executing SQL file:', err);
    return;
  }
  console.log('Database setup completed successfully!');
  connection.end();
}); 