const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    console.log("Connected to DB.");

    try {
        await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS public_id varchar(12);`);
        console.log("Added public_id to questions");
        
        await client.query(`ALTER TABLE resources ADD COLUMN IF NOT EXISTS public_id varchar(12);`);
        console.log("Added public_id to resources");
        
        await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS public_id varchar(12);`);
        console.log("Added public_id to posts");
        
        await client.query(`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS public_id varchar(12);`);
        console.log("Added public_id to opportunities");
        
    } catch (e) {
        console.error("Error running manual migrations:", e);
    } finally {
        await client.end();
    }
}

main();
