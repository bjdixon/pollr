function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const github = require('octonode');
  const config = require('./config');

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  const client = github.client(config.oauthToken);
  const me = client.me();
  let myUsername;
  me.info(function (err, data, headers) {
    myUsername = data.login;
  });

  const newIssue = {
    method: 'POST',
    path: '/new-issue',
    handler: function (req, reply) {
      if (req.payload.action === 'opened' && isPollIssue(req.payload)) {
        let issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
        // TODO send new issue comment with instructions on how to vote and as a placeholder for results of the poll
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
        let sentiment = getCommentSentiment(req.payload.comment.body);
        reply(sentiment);
        // TODO get the issue comment number of the comment we inserted when the poll was started
        // and the total of positive/negative comments so we can update the original comment.
      }
    }
  };

  function getCommentSentiment(commentBody) {
    if (/\+1/.test(commentBody)) {
      return 'positive';
    }
    if (/\-1/.test(commentBody)) {
      return 'negative';
    }
    return 'neither';
  }

  function isPollIssue(payload) {
    return payload.issue && /Poll:/.test(payload.issue.title);
  }

  server.route([
    newIssue,
    newIssueComment
  ]);

  return server;
}

module.exports = {
  createServer: createServer
};
