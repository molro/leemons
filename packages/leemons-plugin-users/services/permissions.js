const permissions = require('../src/services/permissions');
const itemPermissions = require('../src/services/item-permissions');

module.exports = {
  add: permissions.add,
  addMany: permissions.addMany,
  update: permissions.update,
  updateMany: permissions.updateMany,
  delete: permissions.remove,
  deleteMany: permissions.removeMany,
  exist: permissions.exist,
  existMany: permissions.existMany,
  hasAction: permissions.hasAction,
  hasActionMany: permissions.hasActionMany,
  manyPermissionsHasManyActions: permissions.manyPermissionsHasManyActions,
  addActionMany: permissions.addActionMany,
  addAction: permissions.addAction,
  // Item permissions
  addItem: itemPermissions.add,
  countItems: itemPermissions.count,
  findItems: itemPermissions.find,
  removeItems: itemPermissions.remove,
  existItems: itemPermissions.exist,
};
