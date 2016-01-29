function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const github = require('octonode');
  const config = require('./config');
  const _ = require('underscore');

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
        let issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
        let commentSentiment = getCommentSentiment(req.payload.comment.body);
        issue.comments(function (err, data, headers) {
          const pollSummary = _.findIndex(data, function (comment) {
            return comment.user.login === 'pollr';
          }) + 1;
          const positiveCount = _.filter(data, function (comment) {
            return getCommentSentiment(comment.body) === 'positive';
          }).length;
          const negativeCount = _.filter(data, function (comment) {
            return getCommentSentiment(comment.body) === 'negative';
          }).length;
          let message = `positive: ${positiveCount}, negative: ${negativeCount}`;
          issue.updateComment(pollSummary, {
              body: message
          }, function (err, data, headers) {
            console.log('err: ', err);
            console.log('data: ', data);
            console.log('headers ', headers);
            reply('this comment was ' + commentSentiment + '. ' + message);
          });
        });
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
