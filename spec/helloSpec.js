'use strict';

const server = require("../server.js").createServer(3000);

describe('Health Check', function () {
  it("responds with status code 200 and hello world text", function(done) {
    let options = {
      method: "GET",
      url: "/world"
    };
    server.inject(options, function(response) {
      expect(response.statusCode).toBe(200);
      expect(response.result).toBe('hello world');
      done();
    });
  });
});
