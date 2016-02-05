function messages() {
  const newIssueComment = function (commentSentiment, message) {
    return `this comment was ${commentSentiment}. ${message}`;
  };
  const sentimentSummary = function (positiveCount, negativeCount) {
    return `positive: ${positiveCount}, negative: ${negativeCount}`;
  };
  return {
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
}

module.exports = {
  messages: messages()
};
