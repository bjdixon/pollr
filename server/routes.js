'use strict';

const handlers = require('./handlers').init();

module.exports = [
  {
    method: 'POST',
    path: '/create-hooks',
    config: {
      tags: ['api'],
    },
    handler: handlers.createHooks
  }, {
    method: 'POST',
    path: '/new-issue',
    config: {
      tags: ['api']
    },
    handler: handlers.newIssue
  }, {
    method: 'POST',
    path: '/new-issue-comment',
    config: {
      tags: ['api']
    },
    handler: handlers.newIssueComment
  }
];
