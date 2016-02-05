function createServer(port) {
  'use strict';

  const Hapi = require('hapi');
  const github = require('octonode');
  const secrets = require('./configs/secrets.json');
  const _ = require('underscore');
  const swagger = require('hapi-swagger');
  const inert = require('inert');
  const vision = require('vision');
  const messages = require('./messages').messages;

  const server = new Hapi.Server();
  server.connection({ port: port || 3000 });

  server.register([
    inert,
    vision,
    swagger,
    {
      register: require('good'),
      options: require('./configs/good-options').goodOptions
    }
    ], function (err) {
      if (err) {
        server.log('Error', err);
      }
    }
  );

  const client = github.client(secrets.oauthToken);
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
      reply(messages.reply.createHooks);
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
          logAndReply(err, data, headers, reply, messages.reply.newPoll);
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
            return comment.user.login === myUsername;
          }).id;
          const filteredData = _.filter(data, function (comment) {
            return comment.user.login !== myUsername;
          });
          const positiveCount = _.filter(filteredData, function (comment) {
            return getCommentSentiment(comment.body) === messages.sentiment.positive;
          }).length;
          const negativeCount = _.filter(filteredData, function (comment) {
            return getCommentSentiment(comment.body) === messages.sentiment.negative;
          }).length;
          let message = messages.sentiment.summary(positiveCount, negativeCount);
          issue.updateComment(pollSummary, createComment(message), function (err, data, headers) {
            logAndReply(err, data, headers, reply, messages.reply.newIssueComment(commentSentiment, message));
          });
        });
      }
    }
  };

  function getCommentSentiment(commentBody) {
    if (/\+1/.test(commentBody)) {
      return messages.sentiment.positive;
    }
    if (/\-1/.test(commentBody)) {
      return messages.sentiment.negative;
    }
    return messages.sentiment.neither;
  }

  function isPollIssue(payload) {
    return payload.issue && /Poll:/.test(payload.issue.title);
  }

  function createComment(append) {
    let messageBody = messages.reply.newPollBoilerplate;
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
