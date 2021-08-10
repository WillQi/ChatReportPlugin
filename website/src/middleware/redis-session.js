const expressSession = require('express-session');
const { redisConnection : client } = require('../utility/database');

const RedisStore = require('connect-redis')(expressSession);

module.exports = expressSession({
    store: new RedisStore({ client }),
    saveUninitialized: false,
    resave: false,
    secret: process.env.WEBSITE_SECRET
});