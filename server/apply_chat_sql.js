const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const sql = fs.readFileSync('./drizzle/0016_daily_kylun.sql', 'utf-8');
    const statements = sql.split('--> statement-breakpoint');
    
    for (const statement of statements) {
      const cleanStatement = statement.trim();
      if (cleanStatement) {
        console.log('Executing:', cleanStatement);
        await pool.query(cleanStatement);
      }
    }
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
