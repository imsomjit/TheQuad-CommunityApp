const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query(`
      INSERT INTO chat_rooms (name, type, description)
      VALUES 
        ('Web Development Lounge', 'global', 'Discuss React, Node, CSS, and more'),
        ('Placements & Internships', 'global', 'Share opportunities and interview prep'),
        ('General Chat', 'global', 'Hangout and chill')
      ON CONFLICT DO NOTHING;
    `);
    console.log('Seed success');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

main();
