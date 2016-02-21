'use strict';

import test from 'ava';

test.beforeEach(t => {
  t.context.server = require('../server/server').createServer(3000);
});

test.afterEach(t => {
  t.context.server.stop();
});

test.cb('New issue comment: responds with 200 and positive', t => {
  let options = {
    method: 'POST',
    url: '/new-issue-comment',
    payload: require('./fixtures/newIssueComment_yesPoll_positive')
  };
  t.context.server.inject(options, (response) => {
    t.same(response.statusCode, 200);
    t.same(response.result, 'this comment was positive. positive: 2, negative: 2');
    t.end();
  });
});

test.cb('New issue comment: responds with 200 and negative', t => {
  let options = {
    method: 'POST',
    url: '/new-issue-comment',
    payload: require('./fixtures/newIssueComment_yesPoll_negative')
  };
  t.context.server.inject(options, (response) => {
    t.same(response.statusCode, 200);
    t.same(response.result, 'this comment was negative. positive: 2, negative: 2');
    t.end();
  });
});
