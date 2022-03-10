const _ = require('lodash');
const { table } = require('../tables');

async function detailForPage(userId, { transacting } = {}) {
  const users = await table.users.find(
    { id_$in: _.isArray(userId) ? userId : [userId] },
    { transacting }
  );
  if (users.length !== (_.isArray(userId) ? userId : [userId]).length) {
    if (_.isArray(userId)) {
      throw new Error('One of users not found for the ids provided');
    } else {
      throw new Error('No user found for the id provided');
    }
  }

  return _.isArray(userId) ? users : users[0];
}

module.exports = { detailForPage };
