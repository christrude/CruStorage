var loadtest = require('loadtest');
var options = {
    url: 'http://64.23.56.6/api/homes',
    maxSeconds: 10,
    concurrency: 100,
    requestsPerSecond: 3,
    method: 'POST'
  };
loadtest.loadTest(options, function(error, result)
{
    if (error)
    {
        return console.error('Got an error: %s', error);
    }
    console.log(result);
    console.log('Tests run successfully');
});