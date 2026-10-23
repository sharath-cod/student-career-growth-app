const AppError = require('./AppError');
const asyncHandler = require('./asyncHandler');

const studentOf = (req) => {
  if (!req.user.studentId) throw new AppError('No student profile is linked to this account.', 400);
  return req.user.studentId;
};

// Generic owner-scoped CRUD. Every query includes { student }, so a student can only touch their own rows.
function crud(Model, { fields, dateFields = [], keyOf, duplicateMessage, afterSave, onDelete }) {
  const clean = (body) => {
    const out = {};
    fields.forEach((f) => {
      if (body[f] === undefined) return;
      out[f] = dateFields.includes(f) && (body[f] === '' || body[f] === null) ? null : body[f];
    });
    return out;
  };

  async function assertUnique(student, data, ignoreId) {
    if (!keyOf) return undefined;
    const key = keyOf(data);
    const q = { student, key };
    if (ignoreId) q._id = { $ne: ignoreId };
    if (await Model.exists(q)) throw new AppError(duplicateMessage(data), 409);
    return key;
  }

  return {
    list: asyncHandler(async (req, res) => {
      const items = await Model.find({ student: studentOf(req) }).sort({ updatedAt: -1 });
      res.json({ success: true, items });
    }),

    create: asyncHandler(async (req, res) => {
      const student = studentOf(req);
      const data = clean(req.body);
      const key = await assertUnique(student, data);
      const doc = await Model.create({ ...data, ...(key ? { key } : {}), student });
      if (afterSave) await afterSave(doc, req);
      res.status(201).json({ success: true, item: doc });
    }),

    update: asyncHandler(async (req, res) => {
      const student = studentOf(req);
      const doc = await Model.findOne({ _id: req.params.id, student });
      if (!doc) throw new AppError('Record not found.', 404);
      const data = clean(req.body);
      const key = await assertUnique(student, { ...doc.toObject(), ...data }, doc._id);
      Object.assign(doc, data);
      if (key) doc.key = key;
      await doc.save();
      if (afterSave) await afterSave(doc, req);
      res.json({ success: true, item: doc });
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, student: studentOf(req) });
      if (!doc) throw new AppError('Record not found.', 404);
      if (onDelete) await onDelete(doc);
      res.json({ success: true });
    }),
  };
}

module.exports = { crud, studentOf };
