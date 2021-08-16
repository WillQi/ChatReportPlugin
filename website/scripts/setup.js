// Setup database tables
require('dotenv').config();
const { sqlConnection } = require('../src/utility/database');

// who can access the site
const CREATE_USERS_TABLE = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(16) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    is_admin BOOL NOT NULL,
    PRIMARY KEY(id)
);`;

// reports made
const CREATE_REPORTS_TABLE = `CREATE TABLE IF NOT EXISTS reports (
    id INT NOT NULL AUTO_INCREMENT,
    reported_uuid VARCHAR(36) NOT NULL,
    reported_username VARCHAR(16) NOT NULL,
    assigned_to INT NULL,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY(assigned_to) REFERENCES users(id),
    PRIMARY KEY(id)
);`;

// chat logs
const CREATE_LOG_TABLE = `CREATE TABLE IF NOT EXISTS chat_logs (
    id INT NOT NULL AUTO_INCREMENT,
    report_id INT NOT NULL,
    uuid VARCHAR(36) NOT NULL,
    username VARCHAR(16) NOT NULL,
    message TEXT(32767) NOT NULL,
    FOREIGN KEY(report_id) REFERENCES reports(id),
    PRIMARY KEY(id)
);`;

const CREATE_PUNISHMENTS_TABLE = `CREATE TABLE IF NOT EXISTS punishments (
    id INT NOT NULL AUTO_INCREMENT,
    report_id INT NOT NULL UNIQUE,
    type TINYINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY(report_id) REFERENCES reports(id),
    PRIMARY KEY(id) 
);`;

(async function() {
    try {
        await sqlConnection.execute(CREATE_USERS_TABLE);
        await sqlConnection.execute(CREATE_REPORTS_TABLE);
        await sqlConnection.execute(CREATE_LOG_TABLE);
        await sqlConnection.execute(CREATE_PUNISHMENTS_TABLE);
        console.log('Successfully setup database tables!');
        process.exit();
    } catch (error) {
        console.error(error);
    }
})();