"use strict";

const { sql } = require("drizzle-orm");
const { db } = require("../../db/index");
const { postTags, resourceTags, questionTags } = require("../../db/schema/index");

const getAllUniqueTags = async () => {
  // Use UNION ALL to get all tags from all tables, then count and order them
  const query = sql`
    SELECT tag, COUNT(*) as count
    FROM (
      SELECT tag FROM ${postTags}
      UNION ALL
      SELECT tag FROM ${resourceTags}
      UNION ALL
      SELECT tag FROM ${questionTags}
    ) as combined_tags
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 15
  `;
  
  const result = await db.execute(query);
  
  if (Array.isArray(result)) {
    // some drivers return array directly
    return result.map(row => ({ tag: row.tag, count: Number(row.count) }));
  } else if (result.rows) {
    // pg driver returns an object with rows property
    return result.rows.map(row => ({ tag: row.tag, count: Number(row.count) }));
  }
  return [];
};

module.exports = {
  getAllUniqueTags
};
