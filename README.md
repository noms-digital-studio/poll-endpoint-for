# Wait for deployment
A simple configurable utility script that continuously polls an endpoint until the response contains/matches all the fields asked for.


# Install
```
$ yarn add poll-endpoint-for

- or -

$ npm install --save poll-endpoint-for
```

# Usage
pollEndpointFor takes two arguments 
- An object containing the desired key value pairs received from the response(s).
- A configuration object with with to manage the request cycles

```JS
const pollEndpointFor = require('poll-endpoint-for');

pollEndpointFor(
    { status: 'OK' },
    { 
        url: 'http://foo-url.com/health',        
        initialWait: 15,
        requestInterval: 10,
        retryCount: 1,
        onSuccess: () => { console.log('I worked!') },
        onError: () => { console.log('I failed') }
        logger: (...args) => { console.info(...args)}
    }
);
```

## Configuration Object
```
{
    url: (string), // full url for the endpoint
    initialWait: (int), // time in ms
    requestInterval: (int), // time in ms
    timeoutResponse: (int), // time in ms (sets maximum time to wait for the first byte to arrive from the server)
    timeoutDeadline: (int), // time in ms (sets a deadline for the entire request (including all redirects) to complete)
    retryCount: (int), // amount of times to retry a request
    onSuccess: (func), // callback called when the endpoint request matches
    onError: (func), // callback called when the endpoint reaches it's count limit without success
    logger: (func) // callback used to override the default logger   
}
```


# Running test
```
$ yarn test
```  


# License

(The MIT License)