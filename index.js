const hapiServer = require('./server/server');
const server = hapiServer.createServer();
server.start((err) => {
  if (err) {
    console.log(err);
  }
  console.log('server running at: ', server.info.uri);
});
