const hapiServer = require('./server/server');
const server = hapiServer.createServer();
server.start((err) => {
  if (err) {
    server.log('Error', err);
  }
  server.log('Info', `server running at: ${server.info.uri}`);
});
