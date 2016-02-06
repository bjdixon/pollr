'use strict';

function newIssueComment(commentSentiment, message) {
  return `this comment was ${commentSentiment}. ${message}`;
}

function sentimentSummary(positiveCount, negativeCount) {
 return `positive: ${positiveCount}, negative: ${negativeCount}`;
}

module.exports = {
  reply: {
    createHooks: 'create hooks',
    newPoll: 'new poll',
    notNewPoll: 'not new poll',
    newIssueComment: newIssueComment,
    newPollBoilerplate: 'This issue contains a poll. To vote for this issue add acomment containing the text "+1", ":+1:", "-1", or ":-1:"'
  },
  sentiment: {
    positive: 'positive',
    negative: 'negative',
    neither: 'neither',
    summary: sentimentSummary
  }
};
