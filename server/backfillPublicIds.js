const { db } = require("./src/db/index");
const { questions, resources, posts, opportunities } = require("./src/db/schema/index");
const { nanoid } = require("nanoid");
const { isNull, eq } = require("drizzle-orm");

async function main() {
    console.log("Starting backfill...");
    
    // Backfill Questions
    const qs = await db.select({ id: questions.id }).from(questions).where(isNull(questions.publicId));
    console.log(`Found ${qs.length} questions to backfill`);
    for (const q of qs) {
        await db.update(questions).set({ publicId: nanoid(12) }).where(eq(questions.id, q.id));
    }
    
    // Backfill Resources
    const rs = await db.select({ id: resources.id }).from(resources).where(isNull(resources.publicId));
    console.log(`Found ${rs.length} resources to backfill`);
    for (const r of rs) {
        await db.update(resources).set({ publicId: nanoid(12) }).where(eq(resources.id, r.id));
    }

    // Backfill Posts
    const ps = await db.select({ id: posts.id }).from(posts).where(isNull(posts.publicId));
    console.log(`Found ${ps.length} posts to backfill`);
    for (const p of ps) {
        await db.update(posts).set({ publicId: nanoid(12) }).where(eq(posts.id, p.id));
    }

    // Backfill Opportunities
    const os = await db.select({ id: opportunities.id }).from(opportunities).where(isNull(opportunities.publicId));
    console.log(`Found ${os.length} opportunities to backfill`);
    for (const o of os) {
        await db.update(opportunities).set({ publicId: nanoid(12) }).where(eq(opportunities.id, o.id));
    }

    console.log("Backfill complete!");
    process.exit(0);
}

main().catch(console.error);
