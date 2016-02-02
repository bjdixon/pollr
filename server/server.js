function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const github = require('octonode');
  const config = require('./config');
  const _ = require('underscore');
  const swagger = require('hapi-swagger');
  const inert = require('inert');
  const vision = require('vision');

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  server.register([
    inert,
    vision,
    {
      register: swagger
    }], function (err) {
      if (err) {
        console.log(err);
      }
    }
  );

  const client = github.client(config.oauthToken);
  const me = client.me();
  let myUsername;
  me.info(function (err, data, headers) {
    myUsername = data.login;
  });

  const createHooks = {
    method: 'POST',
    path: '/create-hooks',
    config: {
      tags: ['api']
    },
    handler: function (req, reply) {
      reply('create hooks');
    }
  };

  const newIssue = {
    method: 'POST',
    path: '/new-issue',
    config: {
      tags: ['api']
    },
    handler: function (req, reply) {
      if (req.payload.action === 'opened' && isPollIssue(req.payload)) {
        let issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
        // TODO ultimately the sending of this comment should be handled by pushing to a message queue
        issue.createComment(createComment(), function (err, data, headers) {
          logAndReply(err, data, headers, reply, 'new poll');
        });
        return;
      }
      reply('not new poll');
    }
  };

  const newIssueComment = {
    method: 'POST',
    path: '/new-issue-comment',
    config: {
      tags: ['api']
    },
    handler: function (req, reply) {
      if (isPollIssue(req.payload) && req.payload.comment) {
        let issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
        let commentSentiment = getCommentSentiment(req.payload.comment.body);
        issue.comments(function (err, data, headers) {
          const pollSummary = _.find(data, function (comment) {
            return comment.user.login === 'pollr';
          }).id;
          const filteredData = _.filter(data, function (comment) {
            return comment.user.login !== 'pollr';
          });
          const positiveCount = _.filter(filteredData, function (comment) {
            return getCommentSentiment(comment.body) === 'positive';
          }).length;
          const negativeCount = _.filter(filteredData, function (comment) {
            return getCommentSentiment(comment.body) === 'negative';
          }).length;
          let message = `positive: ${positiveCount}, negative: ${negativeCount}`;
          issue.updateComment(pollSummary, createComment(message), function (err, data, headers) {
            logAndReply(err, data, headers, reply, 'this comment was ' + commentSentiment + '. ' + message);
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

  function createComment(append) {
    let messageBody = 'This issue contains a poll. To vote for this issue add a comment containing the text "+1", ":+1:", "-1", or ":-1:"';
    if (append) {
      messageBody += append;
    }
    return { body: messageBody };
  }

  function logAndReply(err, data, headers, reply, message) {
    // TODO add logging
    reply(message);
  }

  server.route([
    newIssue,
    newIssueComment,
    createHooks
  ]);

  return server;
}

module.exports = {
  createServer: createServer
};
