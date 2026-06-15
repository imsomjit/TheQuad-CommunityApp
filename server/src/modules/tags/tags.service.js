"use strict";

const { sql } = require("drizzle-orm");
const { db } = require("../../db/index");
const { postTags, resourceTags, questionTags } = require("../../db/schema/index");

const getAllUniqueTags = async () => {
  // Use UNION to get distinct tags from all three tables
  const query = sql`
    SELECT tag FROM ${postTags}
    UNION
    SELECT tag FROM ${resourceTags}
    UNION
    SELECT tag FROM ${questionTags}
  `;
  
  const result = await db.execute(query);
  
  // result format differs slightly depending on the pg driver (postgres vs pg)
  // Usually, db.execute returns an array of objects.
  if (Array.isArray(result)) {
    return result.map(row => row.tag);
  } else if (result.rows) {
    return result.rows.map(row => row.tag);
  }
  return [];
};

module.exports = {
  getAllUniqueTags
};
