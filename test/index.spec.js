/* eslint-disable comma-dangle, func-names */

const nock = require('nock');
const { expect } = require('chai');
const poolEndpointFor = require('../src/index');


describe('Poll Endpoint For', () => {
  const url = 'http://foo-url.com/health';
  const buildNumber = 'foo-build-number';
  const gitRef = 'foo-git-reference';
  let health;

  beforeEach(() => {
    health =
      nock(url)
      .persist()
      .get('').reply(200, {
        status: 'OK',
        buildNumber,
        gitRef,
      });
  });

  afterEach(() => health.isDone());


  it('calls the onSuccess callback if the response matches the required response fields', function (done) {
    this.timeout(2000);
    const onSuccess = (response) => {
      expect(response).to.be.eql({
        status: 'OK',
        buildNumber: 'foo-build-number',
        gitRef: 'foo-git-reference',
      });
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
    const onError = () => {
      expect(true).to.equal(true, 'Callback was called');
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
