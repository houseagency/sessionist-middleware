# The Sessionist Middleware for Restify

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

