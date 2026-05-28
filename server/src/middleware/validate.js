"use strict";

/**
 * validate(schema) — Zod middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 *
 * Validates req.body against the Zod schema.
 * On failure, throws a ZodError which the global error handler converts to a 400.
 */
const validate = (schema) => (req, _res, next) => {
  // parseAsync supports async refinements (e.g., DB uniqueness checks)
  schema
    .parseAsync(req.body)
    .then((parsed) => {
      // Replace body with the parsed (and potentially transformed) value
      req.body = parsed;
      next();
    })
    .catch(next);
};

module.exports = validate;
