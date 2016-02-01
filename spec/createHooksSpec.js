'use strict';

const server = require('../server/server.js').createServer(3000);

describe('Create hooks endpoint', function () {

  it('responds with status code 200 and create new hooks for repo', function(done) {
    let options = {
      method: 'POST',
      url: '/create-hooks'
    }; 
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('create hooks');
      done();
    });
  }, 15000);
});
