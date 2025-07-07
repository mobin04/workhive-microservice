
// Plugin to add virtual 'id' field
const addIdVirtual = (schema) => {
  schema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
};

module.exports = addIdVirtual;