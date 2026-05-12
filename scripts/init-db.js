const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgres://postgres.cjrzpuwdsejxcgokfpox:o0wY48JT4DU6yg81@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database!");

    // Run schema
    const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    console.log("Running schema.sql...");
    await client.query(schemaSql);
    console.log("Schema applied successfully.");

    // Run seed
    const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
    console.log("Running seed.sql...");
    await client.query(seedSql);
    console.log("Seed data applied successfully.");

  } catch (err) {
    console.error("Error executing SQL:", err.message);
  } finally {
    await client.end();
  }
}

run();
