const errors = require('restify-errors');
const sessionistHeader = require('sessionistheader');

const sessionistMiddleware = (keyfn) => {
	return (req, res, next) => {

		if (typeof req.headers.authorization === 'undefined') {
			return next(new errors.InvalidContentError('No Authorization header in request.'));
		}
		if (typeof req.headers.date === 'undefined') {
			return next(new errors.InvalidContentError('No Date header in request.'));
		}

		sessionistHeader.verify(
			req.headers.authorization,
			req.method,
			req.url,
			req,
			req.headers.date
		)
		.then(() => {
			next();
		})
		.catch(err => {
			next(new errors.InvalidCredentialsError(err.message));
		});

	};
};

module.exports = sessionistMiddleware;
