/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  jwt_secret: 'SECRET123',
  refresh_secret: 'SECRET123456',
  API_KEY: 'g0wDHt3X51KxMLJ6pBAFY7EcafNQTUd4ZIOkyGihR2uSjVsCqn5u9Ld3saDkWi2RvfrAzEh86GycbMU7'

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

};
