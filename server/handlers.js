function init() {
  'use strict';

  const messages = require('./messages').messages;
  const _ = require('lodash');
  const github = require('octonode');
  const secrets = require('./configs/secrets.json');

  const client = github.client(secrets.oauthToken);
  const me = client.me();
  let myUsername;
  me.info(function (err, data, headers) {
    myUsername = data.login;
  });

  const createHooks = function (req, reply) {
    reply(messages.reply.createHooks);
  };

  const newIssue = function (req, reply) {
    if (req.payload.action === 'opened' && isPollIssue(req.payload)) {
      const issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
      // TODO ultimately the sending of this comment should be handled by pushing to a message queue
      issue.createComment(createComment(), function (err, data, headers) {
        logAndReply(err, data, headers, reply, messages.reply.newPoll);
      });
      return;
    }
    reply(messages.reply.notNewPoll);
  };

  const newIssueComment = function (req, reply) {
    if (isPollIssue(req.payload) && req.payload.comment) {
      const issue = client.issue(req.payload.repository.full_name, req.payload.issue.number);
      const commentSentiment = getCommentSentiment(req.payload.comment.body);
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
        const message = messages.sentiment.summary(positiveCount, negativeCount);
        issue.updateComment(pollSummary, createComment(message), function (err, data, headers) {
          logAndReply(err, data, headers, reply, messages.reply.newIssueComment(commentSentiment, message));
        });
      });
    }
  };

  return {
    createHooks,
    newIssue,
    newIssueComment
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
}

module.exports = {
  init
};
