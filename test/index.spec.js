/* eslint-disable comma-dangle, func-names */

const nock = require('nock');
const { expect } = require('chai');
const sinon = require('sinon');
const poolEndpointFor = require('../src/index');


describe('Poll Endpoint For', () => {
  const url = 'http://foo-url.com/health';
  const buildNumber = 'foo-build-number';
  const gitRef = 'foo-git-reference';

  it('accepts a custom logger', function (done) {
    this.timeout(3000);
    const logger = sinon.spy();
    const scope =
      nock(url)
      .get('')
      .reply(200, {
        status: 'OK',
        buildNumber,
        gitRef,
      });

    const onSuccess = () => {
      expect(logger.called).to.equal(true, 'the logger was called');
      expect(
        logger.calledWithMatch('GET http://foo-url.com/health')
      ).to.equal(true, 'the logger was called with the correct arguments');
      
      scope.done();
      done();
    };

    poolEndpointFor(
      { gitRef },
      {
        initialWait: 15,
        requestInterval: 10,
        retryCount: 1,
        url,
        onSuccess,
        logger
      }
    );
  });

  it('retries polling the endpoint a failed response for each time', function (done) {
    this.timeout(3000);

    const callback = sinon.spy();
    const scope =
      nock(url)
      .get('')
      .times(10)
      .reply(400, {
        status: 'BAD',
        buildNumber,
        gitRef,
      });

    const onError = () => {
      expect(callback.callCount).to.equal(10);
      scope.done();
      done();
    };

    scope.on('request', callback);

    poolEndpointFor(
      { gitRef: 'fake-git-ref' },
      {
        initialWait: 15,
        requestInterval: 10,
        retryCount: 10,
        url,
        onError
      }
    );
  });

  it('handles slow response from from the server', function (done) {
    this.timeout(10000);

    const callback = sinon.spy();
    const scope =
      nock(url)
      .get('')
      .times(3)
      .delay(2500)
      .reply(200, {
        status: 'OK',
        buildNumber,
        gitRef,
      });

    const onError = () => {
      expect(callback.callCount).to.equal(3);
      scope.done();
      done();
    };

    scope.on('request', callback);

    poolEndpointFor(
      { gitRef: 'fake-git-ref' },
      {
        initialWait: 15,
        requestInterval: 10,
        timeoutResponse: 1000,
        timeoutDeadline: 2000,
        retryCount: 3,
        url,
        onError
      }
    );
  });


  it('calls the onSuccess callback if the response matches the required response fields', function (done) {
    this.timeout(2000);

    const scope =
      nock(url)
      .get('')
      .reply(200, {
        status: 'OK',
        buildNumber,
        gitRef,
      });

    const onSuccess = (response) => {
      expect(response).to.be.eql({
        status: 'OK',
        buildNumber: 'foo-build-number',
        gitRef: 'foo-git-reference',
      });

      scope.done();
      done();
    };

    poolEndpointFor(
      { gitRef },
      {
        initialWait: 15,
        requestInterval: 10,
        retryCount: 1,
        url,
        onSuccess,
      }
    );
  });

  it('calls the onError when the function fails to match the required response fields', function (done) {
    this.timeout(2000);

    const scope =
      nock(url)
      .get('')
      .reply(200, {
        status: 'OK',
        buildNumber,
        gitRef,
      });

    const onError = () => {
      expect(true).to.equal(true, 'Callback was called');

      scope.done();
      done();
    };

    poolEndpointFor(
      { gitRef: 'unknown-git-reference' },
      {
        initialWait: 0,
        requestInterval: 20,
        retryCount: 1,
        url,
        onError,
      }
    );
  });
});
