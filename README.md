# The Sessionist Middleware for Restify

[![Build Status](https://semaphoreci.com/api/v1/houseagency/sessionist-middleware/branches/master/shields_badge.svg)](https://semaphoreci.com/houseagency/sessionist-middleware)

## How to use

This middleware is actually not one middleware, but two. The 
`parseAuthorizationMiddleware` should be used before `bodyParser`, and the
`settleAuthorizationMiddleware` should be used after `bodyParser`.

	const sessionistMiddleware = require('sessionist-middleware');

	const keyfn = (keyid, callback) => {
		// This function should resolve the key id to a secret key,
		// and return it using the callback function.

		if (keyid == '12345678') return callback(null, 'topsecretkey');
		callback(new Error('No such key ID.'));
	};

	server.use(sessionistMiddleware.parseAuthorizationMiddleware(keyfn));
	server.use(restify.bodyParser()); // Should be in between.
	server.use(sessionistMiddleware.settleAuthorizationMiddleware());

	// If the header is invalid, a 401 Unauthorized will be rendered.
	// If the header is valid, a sessionist_keyid string will be added to
	// the request object.

If you don't need `bodyParser` in your app, you can skip that middleware.
However, you still have to use both our two middlewares, in the proper order:

	server.use(sessionistMiddleware.parseAuthorizationMiddleware(keyfn));
	server.use(sessionistMiddleware.settleAuthorizationMiddleware());

### Why two middlewares?

To verify the `Authorization:` header, we need to make a hash of the full body
payload. To do that, we have to listen to the same data events as
`bodyParser` is listening to. So, the `parseAuthorizationMiddleware` sets up
the listeners and does the hashing, and then `settleAuthorizationMiddleware`
will act on that hash.
