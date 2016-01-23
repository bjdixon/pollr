'use strict';

const server = require("../server.js").createServer(3000);

describe('New Issue Endpoint', function () {
  it("responds with status code 200 and an object with the text hello world", function(done) {
    let options = {
      method: "POST",
      url: "/new-issue",
      payload: { text: 'hello world' }
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result.text).toBe('hello world');
      done();
    });
  });
});
