const {RateLimiterRedis} = require('rate-limiter-flexible');
const {client} = require('./redis');
const HttpStatus = require('http-status-codes')
const {
  handleError
} = require('./utils');

const rateLimiter = new RateLimiterRedis({
  redis: client,
  keyPrefix: 'middleware',
  points: 10, // 10 requests
  duration: 1, // per 1 second by IP
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      return handleError(res, HttpStatus.TOO_MANY_REQUESTS, 'Too many Requests.', null);
    });
};

module.exports = rateLimiterMiddleware;