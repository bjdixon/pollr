function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const github = require('octonode');
  const config = require('./config');

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  const client = github.client(config.oauthToken);

  const hello = {
    method: 'GET',
    path: '/{name}',
    handler: function (req, reply) {
      reply('hello ' +  encodeURIComponent(req.params.name));
    }
  };

  const newIssue = {
    method: 'POST',
    path: '/new-issue',
    handler: function (req, reply) {
      if (req.payload.action === 'opened' && isPollIssue(req.payload)) {
        let issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
        // TODO send new issue comment with instructions on how to vote and as a placeholder for results of the poll
        issue.comments(function (err, data, headers) {
          console.log(data);
        });
        issue.createComment({ body: 'new poll' }, function (err, data, headers) {
          reply('new poll');
        });
        // TODO ultimately the sending of this comment should be handled by pushing to a message queue
        return;
      }
      reply('not new poll');
    }
  };

  const newIssueComment = {
    method: 'POST',
    path: '/new-issue-comment',
    handler: function (req, reply) {
      if (isPollIssue(req.payload) && req.payload.comment) {
        let issueId = req.payload.issue.id;
        if (/\+1/.test(req.payload.comment.body)) {
          reply('positive');
          return;
        }
        if (/\-1/.test(req.payload.comment.body)) {
          reply('negative');
          return;
        }
        reply('neither');
      }
    }
  };

  function isPollIssue(payload) {
    return payload.issue && /Poll:/.test(payload.issue.title);
  }

  server.route([
    hello,
    newIssue,
    newIssueComment
  ]);

  return server;
}

module.exports = {
  createServer: createServer
};
