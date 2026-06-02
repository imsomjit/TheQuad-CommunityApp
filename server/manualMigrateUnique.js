const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    console.log("Connected to DB.");

    try {
        await client.query(`ALTER TABLE questions ADD CONSTRAINT questions_public_id_unique UNIQUE (public_id);`);
        console.log("Added unique constraint to questions");
        
        await client.query(`ALTER TABLE resources ADD CONSTRAINT resources_public_id_unique UNIQUE (public_id);`);
        console.log("Added unique constraint to resources");
        
        await client.query(`ALTER TABLE posts ADD CONSTRAINT posts_public_id_unique UNIQUE (public_id);`);
        console.log("Added unique constraint to posts");
        
        await client.query(`ALTER TABLE opportunities ADD CONSTRAINT opportunities_public_id_unique UNIQUE (public_id);`);
        console.log("Added unique constraint to opportunities");
        
    } catch (e) {
        console.error("Error running manual migrations:", e);
    } finally {
        await client.end();
    }
}

main();
