require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false } // RDS requires SSL by default
});

client.connect()
  .then(() => {
    console.log('✅ Connected to RDS Postgres!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Current time from DB:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
  });