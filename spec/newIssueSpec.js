'use strict';

const server = require('../server.js').createServer(3000);

describe('New Issue Endpoint', function () {

  it('responds with status code 200 and new poll when supplied a new poll issue', function(done) {
    let options = {
      method: 'POST',
      url: '/new-issue',
      payload: require('./fixtures/newIssue_yesPoll')
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('new poll');
      done();
    });
  });

  it('responds with status code 200 and not new poll when not a new poll issue', function(done) {
    let options = {
      method: 'POST',
      url: '/new-issue',
      payload: require('./fixtures/newIssue_noPoll')
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('not new poll');
      done();
    });
  });
});
