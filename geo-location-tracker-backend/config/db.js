require('dotenv').config(); // Import dotenv to access environment variables
console.log("DB CONFIG:", {
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQLUSER,
});
console.log(process.env.MYSQLHOST);
console.log(process.env.MYSQLPORT);
const { Sequelize } = require('sequelize');

// Create a Sequelize instance and connect to the MySQL database
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    dialect: "mysql",
    logging: false,
  }
);

// Function to test the database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully with Sequelize');
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = { sequelize, connectDB };
