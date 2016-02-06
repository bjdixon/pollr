function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const swagger = require('hapi-swagger');
  const inert = require('inert');
  const vision = require('vision');

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  server.register([
    inert,
    vision,
    swagger,
    {
      register: require('good'),
      options: require('./configs/good-options').goodOptions
    }
    ], function (err) {
      if (err) {
        server.log('Error', err);
      }
    }
  );

  server.route(require('./routes'));

  return server;
}

module.exports = {
  createServer: createServer
};
