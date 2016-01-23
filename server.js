function createServer(port) {
  'use strict';

  const Hapi = require('hapi');

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  const hello = {
    method: 'GET',
    path: '/{name}',
    handler: function (req, reply) {
      reply('hello ' +  encodeURIComponent(req.params.name));
    }
  };

  const newIssue = {
    method: 'POST',
    path: '/new-issue',
    handler: function (req, reply) {
      reply(req.payload);
    }
  };

  server.route([
    hello,
    newIssue
  ]);

  return server;
}

module.exports = {
  createServer: createServer
};
