const Bookshelf = require('bookshelf');
const { initKnex } = require('./knex');

module.exports = (leemons) => {
  function init() {
    // Get connections made with bookshelf
    const bookshelfConnections = Object.entries(leemons.config.get('database.connections'))
      .map(([name, value]) => ({ ...value, name }))
      .filter(({ connector }) => connector === 'bookshelf');

    // Initialize knex, all the connections in leemons.connections
    initKnex(leemons, bookshelfConnections);

    bookshelfConnections.map((connection) => {
      // TODO: Let the user have a pre-initialization function

      // Initialize the ORM
      const ORM = new Bookshelf(leemons.connections[connection.name]);
      console.log(ORM);
    });
  }
  return {
    init,
  };
};

// const knexConnection = knex({
//   client: "mysql",
//   connection: {
//     host: "127.0.0.1",
//     user: "test",
//     password: "root",
//     database: "bookshelf",
//     charset: "utf8",
//   },
// });

// const ORM = new Bookshelf(knexConnection);

// const User = ORM.model("User", {
//   tableName: "Users",
// });
//  /*
// //   BOOKSHELF - KNEX

// //   1) You need to initialize a knek object
// //   2) You need to initialize Bookshelf with knek object
// //   3) In order to use ORM models, the DB must be created
// //     3.1) Create a table with ORM.knex.schema.createTable (SEE https://knexjs.org/#Schema-createTable for more info)
// //     3.2) On the callback, create the attributes (SEE https://knexjs.org/#Schema-Building for more info)
// //   4) Create a model (SEE https://bookshelfjs.org/api.html#section-Model for more info)
// //   5) You can start building queries (STRAPI: strapi-connector-bookshelf/lib/queries.js)

// */
// new User({name: "Miguel",}).save();
// new User().fetchAll().then(model => {
//   console.log(model.toJSON());
// })
// //! ONLY USE knex
