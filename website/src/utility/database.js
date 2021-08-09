const sql = require('mysql2');
const redis = require('redis');

const { 
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DATABASE,

    REDIS_HOST,
    REDIS_PORT,
    REDIS_USERNAME,
    REDIS_PASSWORD
 } = process.env;

const sqlConnection = sql.createPool({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_DATABASE
});

const redisConnection = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
});
redisConnection.sendCommand('AUTH', [REDIS_PASSWORD, REDIS_USERNAME]);  // This is purposely reversed as the library
                                                                        // appears to have reversed the arguments


module.exports = {
    sqlConnection,
    redisConnection
 };