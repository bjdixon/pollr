function goodOptions() {
  return {
    reporters: [{
      reporter: require('good-console'),
      events: { log: '*', response: '*' }
    }, {
      reporter: require('good-file'),
      events: { log: '*', response: '*' },
      config: './log'
    }]
  };
}

module.exports = {
  goodOptions: goodOptions()
}
