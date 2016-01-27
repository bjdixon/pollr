const hapiServer = require('./server/server');
const server = hapiServer.createServer();
server.start(() => {
  console.log('server running at: ', server.info.uri);
});
