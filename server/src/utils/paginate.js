"use strict";

/**
 * Offset-based pagination helper.
 *
 * Usage in a service:
 *   const { limit, offset, meta } = paginate(req.query);
 *   const rows = await db.query.table.findMany({ limit, offset });
 *   res.json({ data: rows, pagination: meta(totalCount) });
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @param {{ page?: string|number, limit?: string|number }} query
 * @returns {{ limit: number, offset: number, page: number, meta: (total: number) => object }}
 */
const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  const meta = (total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  });

  return { limit, offset, page, meta };
};

module.exports = paginate;
