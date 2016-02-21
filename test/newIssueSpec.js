'use strict';

import test from 'ava';

test.beforeEach(t => {
  t.context.server = require('../server/server').createServer(3000);
});

test.afterEach(t => {
  t.context.server.stop();
});

test.cb('New Issue: responds with status code 200 and new poll', t => {
  let options = {
    method: 'POST',
    url: '/new-issue',
    payload: require('./fixtures/newIssue_yesPoll')
  };
  t.context.server.inject(options, (response) => {
    t.same(response.statusCode, 200);
    t.same(response.result, 'new poll');
    t.end();
  });
});

test.cb('New Issue: responds with status code 200 and new poll', t => {
  let options = {
    method: 'POST',
    url: '/new-issue',
    payload: require('./fixtures/newIssue_noPoll')
  };
  t.context.server.inject(options, (response) => {
    t.same(response.statusCode, 200);
    t.same(response.result, 'not new poll');
    t.end();
  });
});
