'use strict';

const server = require('../server/server.js').createServer(3000);

describe('New Issue Comment Endpoint', function () {

  it('responds with status code 200 and positive when supplied a new positive poll issue comment', function(done) {
    let options = {
      method: 'POST',
      url: '/new-issue-comment',
      payload: require('./fixtures/newIssueComment_yesPoll_positive')
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('positive');
      done();
    });
  });
 
  it('responds with status code 200 and negative when supplied a new negative poll issue comment', function(done) {
    let options = {
      method: 'POST',
      url: '/new-issue-comment',
      payload: require('./fixtures/newIssueComment_yesPoll_negative')
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('negative');
      done();
    });
  });
  /* 
  it('responds with status code 200 and neither when supplied a new poll issue comment that is neither negative or positive', function(done) {
    let options = {
      method: 'POST',
      url: '/new-issue-comment',
      payload: require('./fixtures/newIssueComment_noPoll')
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('neither');
      done();
    });
  });
  */
});
