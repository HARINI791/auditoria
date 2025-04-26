require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "mysql",
  DATABASE: process.env.DB_NAME || "auditoria",
  PORT: process.env.DB_PORT || 3306,
  // Add these options to handle the authentication issue
  authPlugins: {
    mysql_native_password: () => () => Buffer.from([0])
  }
}; 