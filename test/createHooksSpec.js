'use strict';

import test from 'ava';

test.beforeEach(t => {
  t.context.server = require('../server/server').createServer(3000);
  
});

test.afterEach(t => {
  t.context.server.stop();
});

test.cb('Create hooks: responds with status code 200 and create new hooks for repo', t => {
  let options = {
    method: 'POST',
    url: '/create-hooks'
  };
  t.context.server.inject(options, (response) => {
    t.same(response.statusCode, 200);
    t.same(response.result, 'create hooks');
    t.end();
  });
});
