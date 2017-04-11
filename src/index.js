/* eslint-disable comma-dangle */

const request = require('superagent');
const isSubset = require('is-subset');

const { log, jsonFormat } = require('./utils');

const defaultRequestConfig = {
  requestInterval: 5000,
  initialWait: 30000,
  retryCount: 60,
  timeoutResponse: 5000,
  timeoutDeadline: 5000
};


const poll = (requiredData, config) => {
  if (config.retryCount === 0) {
    return config.onError();
  }

  log(`GET ${config.url}`);
  log('Polling attempts remaining:', config.retryCount);

  return request
    .get(config.url)
    .timeout({
      response: config.timeoutResponse,
      deadline: config.timeoutDeadline,
    })
    .end((error, response) => {
      const updatedConfig = Object.assign({}, config, {
        retryCount: config.retryCount - 1,
      });

      const schedulePoll =
        () => setTimeout(
          () => poll(requiredData, updatedConfig),
          config.requestInterval
        );

      if (error || !response.ok) {
        log('Got failed response', jsonFormat(error), jsonFormat(response));
        return schedulePoll();
      }

      if (response.body && isSubset(response.body, requiredData)) {
        log('Got readable response', jsonFormat(response.body));
        return config.onSuccess(response.body);
      }

      return schedulePoll();
    });
};

const pollEndpointFor = (requiredData, requestConfig) => {
  const config = Object.assign({}, defaultRequestConfig, requestConfig);
  log(
    'Starting polling for status endpoint, looking for',
    jsonFormat(requiredData)
  );

  setTimeout(() => poll(requiredData, config), config.initialWait);
};

module.exports = pollEndpointFor;
