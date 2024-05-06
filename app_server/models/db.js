 
const { Pool } = require("pg");

// Create a new PostgreSQL pool instance
const pool = new Pool({
  connectionString:  "postgres://default:QyRCvrz1AdT5@ep-sweet-credit-a4g9jbx1-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
});

// Connect to the PostgreSQL database using the pool
pool.connect()
  .then(client => {
    console.log("Connected to database");

    // Define the schema by executing SQL statements
    const createSchemaQuery = `
      CREATE SCHEMA IF NOT EXISTS task_management;
      CREATE TABLE IF NOT EXISTS task_management.users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS task_management.tasks (
        task_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES task_management.users(user_id),
        task_name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      );
    `;

    // Execute the query using the client
    return client.query(createSchemaQuery)
      .then(() => {
        console.log("Schema created successfully");
        client.release(); // Release the client back to the pool
      })
      .catch(error => {
        console.error("Error creating schema:", error);
        client.release(); // Release the client back to the pool
        throw error; // Rethrow the error
      });
  })
  .catch(error => {
    console.error("Error connecting to database:", error);
    // Close the pool in case of error
    pool.end();
    throw error; // Rethrow the error
  });

module.exports = pool;
