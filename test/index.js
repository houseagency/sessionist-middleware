const expect = require('chai').expect;
const EventEmitter = require('events').EventEmitter;
const sessionistHeader = require('sessionistheader');
const sessionistMiddleware = require('../index');
const util = require('util');

describe('Module', () => {

	const middleware = sessionistMiddleware((keyid, cb) => {
		if (keyid === '123') return cb(null, 'topsecret');
		cb(new Error('No such key.'));
	});
	const now = (new Date()).toUTCString();

	class Req extends EventEmitter {
		constructor(headers, method, url) {
			super();
			this.headers = headers;
			this.method = method;
			this.url = url;
		}
	}

	describe('Middleware', () => {

		it('should fail if no Authorization header is in request', done => {
			let req = new Req(
				{
					date: now
				},
				'GET',
				'/endpoint'
			);
			middleware(req, null, err => {
				expect(err.message).to.equal('No Authorization header in request.');
				done();
			});
		});

		it('should fail if no Date header is in request', done => {
			let req = new Req(
				{
					authorization: 'sasdfasdf'
				},
				'GET',
				'/endpoint'
			);
			middleware(req, null, err => {
				expect(err.message).to.equal('No Date header in request.');
				done();
			});
		});

		it('should fail if Authorization header has wrong format', done => {
			let req = new Req(
				{
					authorization: 'sasdfasdf',
					date: now
				},
				'GET',
				'/endpoint'
			);
			middleware(req, null, err => {
				expect(err.message).to.equal('Wrong header format.');
				done();
			});
		});

		it('should not fail when using a proper header', done => {
			let payload = '{ "my": "payload" }';
			sessionistHeader('123', 'topsecret', 'GET', '/endpoint', payload, now)
			.then(authHeader => {

				let req = new Req(
					{
						authorization: authHeader,
						date: now
					},
					'GET',
					'/endpoint'
				);
				middleware(req, null, err => {
					expect(typeof err).to.equal('undefined');
					done();
				});
				req.emit('data', new Buffer(payload));
				req.emit('end');
			})
			.catch(err => {
				done(err);
			});
		});

	});

});


