const { body, param } = require('express-validator');

// Optional date: '' / missing -> null, otherwise must be ISO date.
const optDate = (f, label) =>
  body(f).customSanitizer((v) => (v === '' || v === undefined ? null : v)).optional({ values: 'null' }).isISO8601().withMessage(`${label} must be a valid date`).toDate();
const reqDate = (f, label) => body(f).isISO8601().withMessage(`${label} is required`).toDate();
const optUrl = (f, label) => body(f).optional({ values: 'falsy' }).trim().isURL({ require_protocol: true }).withMessage(`${label} must be a full link starting with https://`);
const optText = (f, max) => body(f).optional().trim().isLength({ max }).withMessage(`Too long (maximum ${max} characters)`);
const stringList = (f, max = 30) => [
  body(f).optional().isArray({ max }).withMessage(`Maximum ${max} items`),
  body(`${f}.*`).trim().isLength({ min: 1, max: 100 }).withMessage('Each item must be 1 to 100 characters'),
];
const idParam = param('id').isMongoId().withMessage('Invalid id');

module.exports = { optDate, reqDate, optUrl, optText, stringList, idParam };
