const errors = require('restify-errors');
const sessionistHeader = require('sessionistheader');

const parseAuthorizationMiddleware = (keyfn) => {
	return (req, res, next) => {

		if (typeof req.headers.authorization === 'undefined') {
			return next(new errors.InvalidContentError('No Authorization header in request.'));
		}

		if (
			typeof req.headers.date === 'undefined' &&
			typeof req.headers['x-date'] === 'undefined'
		) {
			return next(new errors.InvalidContentError('No Date header in request.'));
		}

		req._sessionist = sessionistHeader.verify(
			req.headers.authorization,
			req.method,
			req.url,
			req,
			req.headers.date || req.headers['x-date'],
			keyfn
		)

		next();
	};
};

const settleAuthorizationMiddleware = (keyfn) => {
	return (req, res, next) => {

		if (typeof req._sessionist === 'undefined') {
			return next(new errors.InternalServerError('Sessionist settleAuthorizationMiddleware requires parseAuthorizationMiddleware to be used first in the middleware chain.'));
		}

		req._sessionist
		.then(keyid => {
			req.sessionist_keyid = keyid;
			setImmediate(next);
		})
		.catch(err => {
			// setImmediate to break out of the try/catch of the promise chain,
			// so any throws in the callback can be handled properly (somewhere
			// else, that is).
			setImmediate(() => next(new errors.InvalidCredentialsError(err.message)));
		});

	};
};

module.exports = {
	parseAuthorizationMiddleware,
	settleAuthorizationMiddleware
};
