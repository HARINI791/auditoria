const mysql = require('mysql2');
const dbConfig = require('./db.config');

// Create a connection pool with the correct authentication settings
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DATABASE,
  port: dbConfig.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add these options to handle the authentication issue
  authPlugins: {
    mysql_native_password: () => () => Buffer.from([0])
  }
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database.');
  connection.release();
});

module.exports = promisePool; 