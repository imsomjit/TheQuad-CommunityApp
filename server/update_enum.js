const { db } = require('./src/db');
const { sql } = require('drizzle-orm');

async function main() {
  try {
    await db.execute(sql`ALTER TYPE auth_provider ADD VALUE IF NOT EXISTS 'both'`);
    console.log('Enum updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating enum:', error);
    process.exit(1);
  }
}

main();
